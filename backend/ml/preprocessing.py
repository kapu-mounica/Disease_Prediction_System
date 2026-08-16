"""Preprocessing pipeline for the disease-prediction demonstration dataset.

The dataset (dataset/disease_symptoms.csv) is a documented conditional-
probability table: for each disease it records the probability that each
symptom is present. This module expands it into binary training instances by
sampling, per disease, N instances where each symptom is present with its
documented probability plus a small uniform noise term.

Labels are never randomized — every instance is generated from the ground
truth of its own disease, which keeps the dataset internally consistent.

Mirrors the TypeScript pipeline in ml/preprocessing.ts.
"""

from __future__ import annotations

import re

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "fever", "headache", "cough", "fatigue", "weakness", "nausea", "vomiting",
    "diarrhea", "abdominal_pain", "chest_pain", "shortness_of_breath",
    "sore_throat", "runny_nose", "sneezing", "body_pain", "chills", "sweating",
    "dizziness", "joint_pain", "muscle_pain", "skin_rash", "loss_of_appetite",
    "wheezing", "blurred_vision", "excessive_thirst", "frequent_urination",
    "weight_loss", "weight_gain", "high_blood_pressure", "nasal_congestion",
    "loss_of_smell", "loss_of_taste",
]

INSTANCES_PER_DISEASE = 300
NOISE = 0.03
GENERATION_SEED = 42


def normalize_name(name: str) -> str:
    """Normalize a symptom name: trim, lowercase, spaces/hyphens -> underscores."""
    return re.sub(r"[\s-]+", "_", name.strip().lower())


def load_probability_table(csv_path: str) -> pd.DataFrame:
    """Load and structurally validate the conditional-probability table."""
    df = pd.read_csv(csv_path)
    if list(df.columns) != ["disease", "symptom", "probability"]:
        raise ValueError(f"Unexpected CSV columns: {list(df.columns)}")
    if df.isna().any().any():
        raise ValueError("Dataset contains missing values.")
    df["symptom"] = df["symptom"].map(normalize_name)
    if ((df["probability"] < 0) | (df["probability"] > 1)).any():
        raise ValueError("Probabilities must lie within [0, 1].")
    if df["disease"].nunique() < 2:
        raise ValueError("Dataset must contain at least 2 diseases.")
    return df


def validate_table(df: pd.DataFrame) -> None:
    """Verify full disease/feature coverage for every combination."""
    for feature in FEATURE_COLUMNS:
        if feature not in set(df["symptom"]):
            raise ValueError(f"Dataset is missing the symptom feature: {feature}")
    for disease in df["disease"].unique():
        present = set(df.loc[df["disease"] == disease, "symptom"])
        missing = set(FEATURE_COLUMNS) - present
        if missing:
            raise ValueError(f"Disease '{disease}' is missing symptoms: {sorted(missing)}")


def generate_instances(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Expand the probability table into binary feature instances.

    Returns (features, labels, class_names). Deterministic given
    GENERATION_SEED; each symptom is sampled with its documented probability
    plus uniform noise in [-NOISE, NOISE].
    """
    validate_table(df)
    rng = np.random.default_rng(GENERATION_SEED)
    classes = np.array(sorted(df["disease"].unique()))
    class_index = {name: i for i, name in enumerate(classes)}
    probs = {
        (row.disease, row.symptom): row.probability
        for row in df.itertuples(index=False)
    }

    features: list[np.ndarray] = []
    labels: list[int] = []
    for disease in classes:
        for _ in range(INSTANCES_PER_DISEASE):
            vector = np.zeros(len(FEATURE_COLUMNS), dtype=np.int8)
            for i, symptom in enumerate(FEATURE_COLUMNS):
                p = probs[(disease, symptom)]
                jittered = min(1.0, max(0.0, p + (rng.random() * 2 - 1) * NOISE))
                vector[i] = 1 if jittered > 0.5 else 0
            features.append(vector)
            labels.append(class_index[disease])
    return np.vstack(features), np.array(labels, dtype=np.int64), classes
