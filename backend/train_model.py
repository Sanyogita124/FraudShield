import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, average_precision_score,
    precision_recall_curve, f1_score
)
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import warnings
warnings.filterwarnings("ignore")

DATA_PATH  = "creditcard.csv"
MODEL_DIR  = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_fraud.json")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
META_PATH  = os.path.join(MODEL_DIR, "meta.json")

os.makedirs(MODEL_DIR, exist_ok=True)

# ── 1. Load Data 
print("=" * 60)
print("CREDIT CARD FRAUD DETECTION — TRAINING PIPELINE")
print("=" * 60)

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"\n '{DATA_PATH}' not found!\n"
        "Download from: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud\n"
        "Place creditcard.csv in the backend/ folder."
    )

print(f"\n[1/6] Loading data from {DATA_PATH} ...")
df = pd.read_csv(DATA_PATH)
print(f"      Rows: {len(df):,}  |  Columns: {df.shape[1]}")
print(f"      Fraud: {df['Class'].sum():,} ({df['Class'].mean()*100:.3f}%)")

# ── 2. Preprocessing
print("\n[2/6] Preprocessing ...")
scaler = StandardScaler()
df["Amount_scaled"] = scaler.fit_transform(df[["Amount"]])
df["Time_scaled"]   = scaler.fit_transform(df[["Time"]])

FEATURE_COLS = [f"V{i}" for i in range(1, 29)] + ["Amount_scaled", "Time_scaled"]
X = df[FEATURE_COLS].values
y = df["Class"].values

# ── 3. Train/Test Split 
print("[3/6] Splitting data (80/20 stratified) ...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"      Train: {len(X_train):,}  |  Test: {len(X_test):,}")

# ── 4. SMOTE Oversampling 
print("[4/6] Applying SMOTE to balance training set ...")
smote = SMOTE(random_state=42, k_neighbors=5)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
print(f"      After SMOTE — Fraud: {y_train_res.sum():,}  |  Legit: {(y_train_res==0).sum():,}")

# ── 5. Train XGBoost 
print("[5/6] Training XGBoost ...")

# Scale pos weight: ratio of negatives to positives in original data
scale = (y_train == 0).sum() / (y_train == 1).sum()

model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=1,
    min_child_weight=5,
    reg_alpha=0.1,
    reg_lambda=1.0,
    scale_pos_weight=scale,
    use_label_encoder=False,
    eval_metric="aucpr",
    random_state=42,
    n_jobs=-1,
    early_stopping_rounds=20,
)

eval_set = [(X_test, y_test)]
model.fit(
    X_train_res, y_train_res,
    eval_set=eval_set,
    verbose=False,
)
print(f"      Best iteration: {model.best_iteration}")

# ── 6. Evaluate ───────────────────────────────────────────────
print("[6/6] Evaluating on test set ...")
y_prob = model.predict_proba(X_test)[:, 1]

# Find optimal threshold via F1 maximization
precisions, recalls, thresholds = precision_recall_curve(y_test, y_prob)
f1_scores = 2 * precisions * recalls / (precisions + recalls + 1e-9)
best_idx   = np.argmax(f1_scores[:-1])
best_thresh = float(thresholds[best_idx])

y_pred = (y_prob >= best_thresh).astype(int)

roc_auc  = roc_auc_score(y_test, y_prob)
pr_auc   = average_precision_score(y_test, y_prob)
f1       = f1_score(y_test, y_pred)
cm       = confusion_matrix(y_test, y_pred)

print(f"\n  ROC-AUC  : {roc_auc:.4f}")
print(f"  PR-AUC   : {pr_auc:.4f}")
print(f"  F1 Score : {f1:.4f}")
print(f"  Threshold: {best_thresh:.4f}")
print(f"\n  Confusion Matrix:")
print(f"  TN={cm[0,0]:5d}  FP={cm[0,1]:4d}")
print(f"  FN={cm[1,0]:5d}  TP={cm[1,1]:4d}")
print(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate','Fraud'])}")

# ── Feature importance ────────────────────────────────────────
importances = dict(zip(FEATURE_COLS, model.feature_importances_.tolist()))
top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:10]

# ── Save artifacts ────────────────────────────────────────────
model.save_model(MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

meta = {
    "feature_cols"  : FEATURE_COLS,
    "threshold"     : best_thresh,
    "roc_auc"       : round(roc_auc, 4),
    "pr_auc"        : round(pr_auc, 4),
    "f1_score"      : round(f1, 4),
    "best_iteration": int(model.best_iteration),
    "n_train"       : int(len(X_train)),
    "n_test"        : int(len(X_test)),
    "fraud_rate"    : round(float(df["Class"].mean() * 100), 4),
    "confusion_matrix": cm.tolist(),
    "top_features"  : top_features,
    "n_total"       : int(len(df)),
    "n_fraud"       : int(df["Class"].sum()),
}
with open(META_PATH, "w") as f:
    json.dump(meta, f, indent=2)

print(f"\n Model saved {MODEL_PATH}")
print(f" Scaler saved  {SCALER_PATH}")
print(f" Metadata saved {META_PATH}")
print("\ns Now run: uvicorn main:app --reload --port 8000")
