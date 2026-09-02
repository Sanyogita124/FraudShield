# FraudShield: High-Precision Transaction Security Pipeline

FraudShield is an end to end, machine learning driven fraud detection system engineered to identify rare, fraudulent credit card transactions in real time. Built specifically to handle extreme class imbalance (0.17% fraud rate), FraudShield leverages **XGBoost** sequential learning and **SMOTE** synthetic oversampling to deliver high precision without compromising legitimate user experience.

## Project Overview
Credit card fraud detection is a classic "needle in a haystack" problem. Standard machine learning algorithms often achieve high accuracy simply by predicting that every transaction is legitimate, completely missing actual fraud cases.

FraudShield overcomes this by combining advanced sampling techniques, feature importance analysis, and custom probability thresholding to provide a robust, production-ready security engine.

### Key Highlights
- **Engineered for Extreme Imbalance:** Handles a 99.83% vs. 0.17% class skew using SMOTE.
- **High Discrimination Power:** Achieves a **0.9641 ROC-AUC** score.
- **False-Positive Mitigation:** Operates on an optimal F1 decision threshold of **0.996**, minimizing customer friction.
- **Feature-Driven Insights:** Identifies technical transaction "fingerprints" using XGBoost feature importance mapping (e.g., `V26`, `V14`).

## Tech Stack & Tools
- **Language:** Python 3.x
- **Core ML Library:** XGBoost
- **Data Manipulation:** Pandas, NumPy
- **Preprocessing & Metrics:** Scikit-Learn, Imbalanced-Learn (`imblearn`)

## Dataset Specifications
- **Source:** Kaggle Credit Card Fraud Detection Dataset
- **Total Transactions:** 284,807
- **Fraud Cases:** 492 (0.17%)
- **Legitimate Cases:** 284,315 (99.83%)
- **Features:** 30 features (28 PCA-transformed numerical features `V1`–`V28`, plus `Time` and `Amount`).
