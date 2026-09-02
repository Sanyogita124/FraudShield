"""
main.py — FastAPI backend for Credit Card Fraud Detection
Run: uvicorn main:app --reload --port 8000
"""

import os
import json
import time
import uuid
import joblib
import numpy as np
import xgboost as xgb
from datetime import datetime
from collections import deque
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── App setup ─────────────────────────────────────────────────
app = FastAPI(
    title="Fraud Detection API",
    description="XGBoost-powered credit card fraud detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model loading ─────────────────────────────────────────────
MODEL_DIR   = "model"
MODEL_PATH  = os.path.join(MODEL_DIR, "xgboost_fraud.json")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
META_PATH   = os.path.join(MODEL_DIR, "meta.json")

model  = None
scaler = None
meta   = {}

def load_artifacts():
    global model, scaler, meta
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            "Model not found. Run 'python train_model.py' first."
        )
    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(META_PATH) as f:
        meta = json.load(f)
    print("✅ Model loaded successfully")
    print(f"   ROC-AUC: {meta['roc_auc']}  |  PR-AUC: {meta['pr_auc']}")

load_artifacts()

# ── In-memory prediction history (last 500) ───────────────────
history: deque = deque(maxlen=500)

# ── Pydantic models ───────────────────────────────────────────
class TransactionInput(BaseModel):
    """Raw transaction input — V1..V28 are PCA features, Amount and Time are raw."""
    V1: float = Field(default=0.0)
    V2: float = Field(default=0.0)
    V3: float = Field(default=0.0)
    V4: float = Field(default=0.0)
    V5: float = Field(default=0.0)
    V6: float = Field(default=0.0)
    V7: float = Field(default=0.0)
    V8: float = Field(default=0.0)
    V9: float = Field(default=0.0)
    V10: float = Field(default=0.0)
    V11: float = Field(default=0.0)
    V12: float = Field(default=0.0)
    V13: float = Field(default=0.0)
    V14: float = Field(default=0.0)
    V15: float = Field(default=0.0)
    V16: float = Field(default=0.0)
    V17: float = Field(default=0.0)
    V18: float = Field(default=0.0)
    V19: float = Field(default=0.0)
    V20: float = Field(default=0.0)
    V21: float = Field(default=0.0)
    V22: float = Field(default=0.0)
    V23: float = Field(default=0.0)
    V24: float = Field(default=0.0)
    V25: float = Field(default=0.0)
    V26: float = Field(default=0.0)
    V27: float = Field(default=0.0)
    V28: float = Field(default=0.0)
    Amount: float = Field(default=150.0, ge=0)
    Time: float = Field(default=50000.0, ge=0)

    # Optional metadata (not used in model)
    merchant: Optional[str] = None
    card_last4: Optional[str] = None
    location: Optional[str] = None

class PredictionResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_probability: float
    risk_level: str          # LOW / MEDIUM / HIGH / CRITICAL
    confidence: float        # 0-1
    threshold_used: float
    latency_ms: float
    timestamp: str
    merchant: Optional[str]
    card_last4: Optional[str]
    amount: float

class BatchInput(BaseModel):
    transactions: List[TransactionInput]

# ── Helper ────────────────────────────────────────────────────
def preprocess(txn: TransactionInput) -> np.ndarray:
    amount_scaled = scaler.transform([[txn.Amount]])[0][0]
    # Re-use same scaler fitted on Time — approximate for live use
    time_scaled = (txn.Time - 94813.86) / 47488.14  # mean/std from dataset
    features = [getattr(txn, f"V{i}") for i in range(1, 29)]
    features += [amount_scaled, time_scaled]
    return np.array(features).reshape(1, -1)

def risk_level(prob: float) -> str:
    if prob >= 0.85: return "CRITICAL"
    if prob >= 0.60: return "HIGH"
    if prob >= 0.30: return "MEDIUM"
    return "LOW"

def build_response(txn: TransactionInput, prob: float, latency: float) -> dict:
    thresh    = meta.get("threshold", 0.5)
    is_fraud  = bool(prob >= thresh)
    txn_id    = str(uuid.uuid4())[:8].upper()
    record = {
        "transaction_id"    : txn_id,
        "is_fraud"          : is_fraud,
        "fraud_probability" : round(prob, 4),
        "risk_level"        : risk_level(prob),
        "confidence"        : round(abs(prob - 0.5) * 2, 4),
        "threshold_used"    : round(thresh, 4),
        "latency_ms"        : round(latency, 2),
        "timestamp"         : datetime.utcnow().isoformat() + "Z",
        "merchant"          : txn.merchant,
        "card_last4"        : txn.card_last4,
        "amount"            : txn.Amount,
    }
    history.appendleft(record)
    return record

# ── Routes ────────────────────────────────────────────────────
@app.get("/")
def health():
    return {
        "status": "ok",
        "model" : "XGBoost",
        "roc_auc": meta.get("roc_auc"),
        "version": "1.0.0",
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(txn: TransactionInput):
    t0 = time.perf_counter()
    try:
        X    = preprocess(txn)
        prob = float(model.predict_proba(X)[0, 1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    latency = (time.perf_counter() - t0) * 1000
    return build_response(txn, prob, latency)

@app.post("/predict/batch")
def predict_batch(batch: BatchInput):
    if len(batch.transactions) > 1000:
        raise HTTPException(status_code=400, detail="Max 1000 transactions per batch")
    results = []
    for txn in batch.transactions:
        t0   = time.perf_counter()
        X    = preprocess(txn)
        prob = float(model.predict_proba(X)[0, 1])
        ms   = (time.perf_counter() - t0) * 1000
        results.append(build_response(txn, prob, ms))
    fraud_count = sum(1 for r in results if r["is_fraud"])
    return {
        "total"      : len(results),
        "fraud_found": fraud_count,
        "results"    : results,
    }

@app.get("/stats")
def stats():
    hist_list = list(history)
    total     = len(hist_list)
    fraud_n   = sum(1 for r in hist_list if r["is_fraud"])
    avg_prob  = round(np.mean([r["fraud_probability"] for r in hist_list]), 4) if hist_list else 0
    avg_lat   = round(np.mean([r["latency_ms"] for r in hist_list]), 2) if hist_list else 0
    return {
        "model": {
            "type"          : "XGBoost",
            "roc_auc"       : meta.get("roc_auc"),
            "pr_auc"        : meta.get("pr_auc"),
            "f1_score"      : meta.get("f1_score"),
            "threshold"     : meta.get("threshold"),
            "best_iteration": meta.get("best_iteration"),
            "n_train"       : meta.get("n_train"),
            "n_test"        : meta.get("n_test"),
            "top_features"  : meta.get("top_features", []),
        },
        "dataset": {
            "total_transactions": meta.get("n_total"),
            "fraud_transactions": meta.get("n_fraud"),
            "fraud_rate_pct"    : meta.get("fraud_rate"),
            "confusion_matrix"  : meta.get("confusion_matrix"),
        },
        "session": {
            "predictions_made" : total,
            "fraud_detected"   : fraud_n,
            "avg_fraud_prob"   : avg_prob,
            "avg_latency_ms"   : avg_lat,
        },
    }

@app.get("/history")
def get_history(limit: int = 50):
    return {
        "total"  : len(history),
        "records": list(history)[:limit],
    }

@app.delete("/history")
def clear_history():
    history.clear()
    return {"message": "History cleared"}
