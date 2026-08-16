"""End-to-end training pipeline — the reference scikit-learn implementation.

Pipeline:
   1. Load dataset/disease_symptoms.csv
   2. Validate the dataset (columns, coverage, ranges, missing values)
   3. Normalize symptom names
   4. Generate binary training instances from the documented conditional
      probability table (seeded, reproducible)
   5. Encode disease labels (LabelEncoder)
   6. Stratified 80/20 train/test split
   7. Train a Random Forest Classifier
   8. Evaluate: accuracy, precision, recall, F1, confusion matrix
   9. Save disease_model.pkl, label_encoder.pkl, feature_columns.pkl and
      metrics.json into backend/model/

Usage:  python backend/ml/train_model.py        (from the project root)
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from evaluate_model import evaluate_model
from preprocessing import (
    FEATURE_COLUMNS,
    GENERATION_SEED,
    INSTANCES_PER_DISEASE,
    NOISE,
    generate_instances,
    load_probability_table,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "dataset" / "disease_symptoms.csv"
MODEL_DIR = PROJECT_ROOT / "backend" / "model"

TEST_FRACTION = 0.2
SPLIT_SEED = 7
RF_PARAMS = {
    "n_estimators": 60,
    "max_depth": 10,
    "min_samples_leaf": 5,
    "random_state": 42,
    "class_weight": None,
}


def main() -> dict:
    print("=" * 60)
    print("  AI Disease Prediction — Training Pipeline (Python)")
    print("=" * 60)

    print(f"[1/7] Loading dataset: {DATASET_PATH}")
    df = load_probability_table(DATASET_PATH)
    print(
        f"      → {len(df)} probability rows, "
        f"{df['disease'].nunique()} diseases, {len(FEATURE_COLUMNS)} features."
    )

    print("[2/7] Generating binary instances (seeded sampling)")
    features, labels, classes = generate_instances(df)
    print(f"      → {len(features)} instances, {features.shape[1]} binary features.")

    print(f"[3/7] Stratified split ({int((1 - TEST_FRACTION) * 100)}%/{int(TEST_FRACTION * 100)}%)")
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=TEST_FRACTION, random_state=SPLIT_SEED,
        stratify=labels,
    )
    print(f"      → train: {len(X_train)}, test: {len(X_test)}")

    print("[4/7] Encoding labels")
    encoder = LabelEncoder()
    y_train_enc = encoder.fit_transform(y_train)
    y_test_enc = encoder.transform(y_test)
    # Encoder classes are sorted alphabetically — align our class list with it.
    classes = list(encoder.classes_)

    print(f"[5/7] Training Random Forest {RF_PARAMS}")
    clf = RandomForestClassifier(**RF_PARAMS)
    clf.fit(X_train, y_train_enc)

    print("[6/7] Evaluating on the held-out test set")
    y_pred = clf.predict(X_test)
    report = evaluate_model(y_test_enc, y_pred, classes)
    print(f"      → Accuracy : {report['accuracy']:.1%}")
    print(f"      → Precision: {report['precision']:.1%} (macro)")
    print(f"      → Recall   : {report['recall']:.1%} (macro)")
    print(f"      → F1-score : {report['f1']:.1%} (macro)")
    print(report["classification_report"])

    print(f"[7/7] Saving artifacts → {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, MODEL_DIR / "disease_model.pkl")
    joblib.dump(encoder, MODEL_DIR / "label_encoder.pkl")
    joblib.dump(FEATURE_COLUMNS, MODEL_DIR / "feature_columns.pkl")
    metrics = {
        "algorithm": "Random Forest",
        "generated_at": datetime.datetime.now().isoformat(),
        "n_diseases": len(classes),
        "n_symptoms": len(FEATURE_COLUMNS),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "dataset": {
            "instances_per_disease": INSTANCES_PER_DISEASE,
            "noise": NOISE,
            "seed": GENERATION_SEED,
            "total_instances": int(len(features)),
            "source": str(DATASET_PATH),
        },
        "params": RF_PARAMS,
        "classes": classes,
        "feature_columns": FEATURE_COLUMNS,
        "feature_importance": [
            round(float(v), 6) for v in clf.feature_importances_
        ],
        **{k: v for k, v in report.items() if k != "classification_report"},
    }
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print("      → disease_model.pkl, label_encoder.pkl, feature_columns.pkl, metrics.json written.")

    print("=" * 60)
    print(f"  Training complete. Test accuracy: {report['accuracy']:.1%}")
    print("=" * 60)
    return metrics


if __name__ == "__main__":
    main()
