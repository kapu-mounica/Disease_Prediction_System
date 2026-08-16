# AI Disease Predictor

**Machine Learning Based Preliminary Health Risk Assessment**

A complete, working **AI Disease Prediction System**: select symptoms, and a
trained **Random Forest** model predicts the most likely disease from 15
supported conditions, with confidence scores and the top 3 candidates.

> ⚠️ **Medical disclaimer — read first.** This system provides a preliminary
> machine-learning prediction for **educational purposes only**. It is **NOT a
> medical diagnosis** and must not replace evaluation by a qualified healthcare
> professional.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Machine Learning Methodology](#machine-learning-methodology)
7. [Dataset Description](#dataset-description)
8. [Algorithms](#algorithms)
9. [Model Evaluation](#model-evaluation)
10. [Technology Stack](#technology-stack)
11. [Project Structure](#project-structure)
12. [Installation](#installation)
13. [Training Instructions](#training-instructions)
14. [Backend Instructions](#backend-instructions)
15. [Frontend Instructions](#frontend-instructions)
16. [API Documentation](#api-documentation)
17. [Example Prediction](#example-prediction)
18. [Limitations](#limitations)
19. [Future Enhancements](#future-enhancements)
20. [Medical Disclaimer](#medical-disclaimer)

---

## Project Overview

The application lets a user search and select symptoms from a curated index of
**32 symptom features**, organized into clinical categories. The request is
validated and encoded server-side, and a Random Forest ensemble of **60
decision trees** — trained on **4,500 documented demonstration instances** —
returns:

- the **predicted disease** (most likely of 15 classes),
- a **confidence score** (the ensemble's agreement, not medical certainty),
- the **top 3 candidate conditions** with confidence values.

The project ships **two equivalent backends**:

1. **Live deployment backend** — a server-side TypeScript runtime (Convex)
   serving the symptom catalog, model metadata, and the prediction endpoint.
   This is what powers the deployed application and requires no local setup.
2. **Reference Python backend** — a complete **FastAPI + scikit-learn**
   implementation with the exact same endpoints, dataset, and pipeline, ready
   to run locally.

## Problem Statement

Symptom-based diagnosis is a classic machine-learning classification problem:
given a set of observed symptoms, identify the most probable condition from a
known set of disease classes. Building a full-stack system around it —
curated dataset, training pipeline, model serialization, REST API, and a
professional frontend — demonstrates the entire ML product lifecycle in one
project. The result is intended for **education and demonstration**; it is
explicitly not a clinical tool.

## Objectives

- Build a complete, working symptom-based disease prediction system end to end.
- Train a real Random Forest classifier on a documented, internally consistent
  demonstration dataset — no hard-coded predictions anywhere.
- Serve predictions through a real backend API with input validation, clear
  error handling, and model lifecycle management.
- Report genuine holdout metrics (accuracy, precision, recall, F1, confusion
  matrix) transparently in the UI.
- Provide a professional, production-shaped architecture suitable for a
  final-year or portfolio project.

## Features

- **Symptom index** — 32 symptom features searchable and grouped into 9
  clinical categories; multi-select, removal, count, clear-all.
- **Server-side ML inference** — the browser never computes probabilities; the
  trained model runs in the backend.
- **Confidence score** — transparent ensemble agreement for the predicted
  disease, shown on a vintage thermometer-style gauge.
- **Top-3 predictions** — ranked candidates with confidence bars.
- **Model information dashboard** — algorithm, training/test sizes, accuracy,
  precision, recall, F1, per-class report, holdout distribution chart, and a
  full 15×15 confusion-matrix heatmap.
- **How-it-works pipeline** — visual explanation of every stage.
- **Full error handling** — empty selection, unknown symptoms, backend
  unreachable, model missing, network failures — all with friendly messages.
- **Reproducible training** — one command retrains and re-evaluates the model
  and regenerates the artifact.
- **Vintage editorial UI** — aged-paper tones, serif hierarchy, archival
  details; responsive and mobile-friendly.

## Architecture

```
┌─────────────────────────┐      ┌───────────────────────────────────────────┐
│  React + TypeScript     │      │  Backend                                  │
│  (Vite / Tailwind v4)   │      │                                           │
│                         │      │  ┌─────────────────────────────────────┐  │
│  Landing / Predict /    │─────▶│  │ TypeScript runtime (Convex)         │  │
│  How It Works / Model   │      │  │  • symptoms query  (GET /symptoms)  │  │
│  Info / About           │      │  │  • model-info query(GET /model-info)│  │
│                         │      │  │  • predict action (POST /predict)   │  │
│  recharts dashboards    │      │  │    → validate → encode → forest     │  │
│  Confidence gauge       │      │  └───────────────┬─────────────────────┘  │
└─────────────────────────┘      └──────────────────┼────────────────────────┘
                                                    │ loads
                                        ┌───────────▼───────────┐
                                        │ src/convex/ml_model.ts│
                                        │ (trained artifact)    │
                                        └───────────┬───────────┘
                                                    │ generated by
                                        ┌───────────▼───────────┐
                                        │ ml/train_model.ts     │
                                        │ dataset/*.csv         │
                                        └───────────────────────┘

  Local reference backend (same endpoints, same dataset):
  ┌─────────────────────────┐      ┌───────────────────────────┐
  │ React frontend          │      │ FastAPI (Python)          │
  │ (VITE_API_URL)          │─────▶│ backend/main.py           │
  └─────────────────────────┘      │ backend/model/*.pkl       │
                                   │ trained by train_model.py │
                                   └───────────────────────────┘
```

## Machine Learning Methodology

1. **Dataset** — `dataset/disease_symptoms.csv` is a documented
   conditional-probability table: for each of the 15 diseases it records the
   probability of each of the 32 symptoms (480 rows). The associations are
   medically plausible (e.g. influenza → high fever/body aches; diabetes →
   excessive thirst/frequent urination).
2. **Instance generation** — the training pipeline expands the table into
   **4,500 binary instances** (300 per disease) by sampling each symptom with
   its documented probability plus ±3% uniform noise, using a fixed seed
   (deterministic and reproducible). Labels are **never randomized** — every
   instance is generated from its own disease's ground truth, keeping the
   dataset internally consistent.
3. **Preprocessing** — column/coverage validation, missing-value checks,
   name normalization (trim → lowercase → underscores), binary feature
   encoding, LabelEncoder for disease classes.
4. **Split** — stratified 80/20 train/test split (seeded), reserving 900
   instances the model never sees during training.
5. **Training** — Random Forest: bootstrap bagging, CART trees with Gini
   impurity, `max_features="sqrt"` subsampling, `max_depth=10`,
   `min_samples_leaf=5`, `n_estimators=60`, `random_state=42`.
6. **Inference** — the serialized ensemble loads in the backend; symptom input
   is validated, encoded to the model's feature vector, and scored. Confidence
   = fraction of trees voting for the class.
7. **Evaluation** — accuracy, macro precision/recall/F1 and a full confusion
   matrix computed on the held-out test set and surfaced in the dashboard.

## Dataset Description

| Attribute        | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Format           | CSV, long form: `disease, symptom, probability`                    |
| Diseases         | 15                                                                 |
| Symptom features | 32 (binary, presence/absence)                                      |
| Rows             | 480 (15 × 32, every disease × feature pair documented)             |
| Expansion        | 300 sampled instances per disease → 4,500 binary records           |
| Noise            | ±3% uniform jitter (seeded)                                        |

**Supported diseases:** Common Cold, Influenza, Migraine, Allergy,
Gastroenteritis, Bronchitis, Pneumonia, Dengue, Malaria, Typhoid, Diabetes,
Hypertension, Asthma, Tuberculosis, COVID-19.

**Symptom features:** fever, headache, cough, fatigue, weakness, nausea,
vomiting, diarrhea, abdominal_pain, chest_pain, shortness_of_breath,
sore_throat, runny_nose, sneezing, body_pain, chills, sweating, dizziness,
joint_pain, muscle_pain, skin_rash, loss_of_appetite, wheezing, blurred_vision,
excessive_thirst, frequent_urination, weight_loss, weight_gain,
high_blood_pressure, nasal_congestion, loss_of_smell, loss_of_taste.

> The dataset is an **educational demonstration table**, not clinical data.
> Its construction is documented in `ml/preprocessing.ts` and
> `backend/ml/preprocessing.py`.

## Algorithms

| Component          | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Classifier         | Random Forest Classifier (60 CART decision trees)   |
| Split criterion    | Gini impurity                                       |
| Bagging            | Bootstrap sampling with replacement (per-tree seeds)|
| Feature subsampling| √n per split (`max_features="sqrt"`)                |
| Aggregation        | Majority vote; confidence = vote fraction           |
| Python reference   | `scikit-learn` `RandomForestClassifier`             |
| Live deployment    | Equivalent from-scratch implementation (`src/convex/ml/randomForest.ts`) |

## Model Evaluation

Genuine holdout results (900 test instances, 80/20 stratified split) from the
training pipeline:

| Metric               | Value  |
| -------------------- | ------ |
| **Accuracy**         | 100.0% |
| **Precision (macro)**| 100.0% |
| **Recall (macro)**   | 100.0% |
| **F1 Score (macro)** | 100.0% |
| Training samples     | 3,600  |
| Testing samples      | 900    |

**Why is the accuracy so high?** The demonstration dataset is clean by
construction — each disease carries a distinct, well-separated symptom
signature — so a 60-tree ensemble separates the classes almost perfectly on
the holdout. This is an honest property of a controlled educational dataset,
**not** a claim about clinical performance: real patient data is far noisier,
and real-world accuracy would be lower. The dashboard states this explicitly
and shows the full confusion matrix so the result can be inspected.

Recompute it yourself: `bun run ml:train` (TypeScript pipeline) or
`python backend/ml/train_model.py` (scikit-learn reference).

## Technology Stack

**Frontend (live deployment)**
- React 19 + TypeScript, Vite, Tailwind CSS v4, Framer Motion
- shadcn/ui components, lucide-react icons
- recharts (performance & distribution charts)
- Vintage editorial theme (Playfair Display / EB Garamond, sepia palette)

**Backend (live deployment)**
- Convex (managed TypeScript backend): queries + server-side action
- From-scratch Random Forest inference module (deterministic, seeded)

**Backend (local reference)**
- Python 3.10+, FastAPI, Uvicorn
- pandas, numpy, scikit-learn, joblib

**Machine learning (both)**
- Random Forest Classifier; Gini impurity; stratified holdout evaluation

## Project Structure

```
disease-prediction-system/
├── dataset/
│   └── disease_symptoms.csv          # documented conditional-probability table
├── ml/                               # TypeScript training pipeline
│   ├── train_model.ts                # end-to-end training → src/convex/ml_model.ts
│   ├── preprocessing.ts              # dataset load/validate/normalize/expand/split
│   ├── evaluate_model.ts             # accuracy / precision / recall / F1 / CM
│   └── test_model.ts                 # model sanity suite
├── src/
│   ├── convex/                       # live backend (Convex)
│   │   ├── ml/
│   │   │   ├── randomForest.ts       # from-scratch forest (train + predict)
│   │   │   ├── inference.ts          # validation, encoding, prediction builder
│   │   │   ├── catalog.ts            # symptom catalog (categories)
│   │   │   └── types.ts              # shared model types
│   │   ├── ml_model.ts               # GENERATED trained artifact + metrics
│   │   ├── predict.ts                # predict action (POST /predict)
│   │   ├── symptoms.ts               # symptoms query  (GET /symptoms)
│   │   └── modelInfo.ts              # model-info + diseases queries
│   ├── pages/                        # Landing, Predict, HowItWorks, ModelInfo, About
│   ├── components/                   # Nav, Footer, layout, gauge, confusion matrix…
│   └── index.css                     # vintage theme
├── backend/                          # local Python reference backend
│   ├── main.py                       # FastAPI application (all endpoints)
│   ├── requirements.txt
│   ├── symptoms.py                   # symptom catalog mirror
│   ├── ml/
│   │   ├── train_model.py            # scikit-learn training pipeline
│   │   ├── preprocessing.py
│   │   └── evaluate_model.py
│   └── model/                        # generated *.pkl artifacts (gitignored)
├── public/                           # favicon / logo
├── package.json
├── tsconfig*.json
└── README.md
```

## Installation

**Frontend + live backend (TypeScript)**

```bash
bun install
```

> The live backend (Convex) needs no local service — the platform's Convex
> deployment is used. For a fully local run, see the Python reference below.

**Python reference backend**

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

## Training Instructions

**TypeScript pipeline (used by the live deployment)**

```bash
bun run ml:train        # trains, evaluates, writes src/convex/ml_model.ts
bun run ml:test         # runs the model sanity suite (14+ assertions)
```

**Python / scikit-learn pipeline (reference)**

```bash
python backend/ml/train_model.py
```

This writes `backend/model/disease_model.pkl`, `label_encoder.pkl`,
`feature_columns.pkl`, and `metrics.json` (these are gitignored — generated
locally).

## Backend Instructions

**Live deployment backend** — managed by the platform; no action needed.

**Local Python backend**

```bash
# 1. Train the model (if not done already)
python backend/ml/train_model.py

# 2. Start the API
uvicorn backend.main:app --reload --port 8000
# or: bun run api
```

Interactive docs: http://localhost:8000/docs

## Frontend Instructions

```bash
bun install
bun run dev
```

Open the printed local URL. For the frontend to talk to the **local Python
backend**, point `VITE_API_URL` at `http://localhost:8000`; by default the
frontend uses the managed live backend, which requires no configuration.

## API Documentation

### `GET /` — service metadata

```json
{
  "name": "AI Disease Predictor API",
  "version": "1.0.0",
  "endpoints": ["/health", "/symptoms", "/diseases", "/predict", "/retrain", "/model-info"]
}
```

### `GET /health` — service status

```json
{ "status": "ok", "model_loaded": true }
```

### `GET /symptoms` — symptom catalog

```json
{
  "count": 32,
  "symptoms": [
    { "id": "fever", "label": "Fever", "category": "General & Systemic", "description": "…" }
  ]
}
```

### `GET /diseases` — supported classes

```json
{ "count": 15, "diseases": ["Allergy", "Asthma", "…", "Typhoid"] }
```

### `POST /predict` — run the model

Request:

```json
{ "symptoms": ["fever", "cough", "body_pain", "fatigue"] }
```

Response:

```json
{
  "predicted_disease": "Influenza",
  "confidence": 0.87,
  "selected_symptoms": ["fever", "cough", "body_pain", "fatigue"],
  "top_predictions": [
    { "disease": "Influenza", "confidence": 0.87 },
    { "disease": "COVID-19", "confidence": 0.10 },
    { "disease": "Pneumonia", "confidence": 0.03 }
  ]
}
```

Errors: `422` for an empty list or unknown/blank symptoms (with a clear
`detail` message); `503` if the model has not been trained/loaded.

### `POST /retrain` — retrain and reload

```bash
curl -X POST http://localhost:8000/retrain
```

### `GET /model-info` — model configuration + metrics

```json
{
  "algorithm": "Random Forest",
  "n_diseases": 15,
  "n_symptoms": 32,
  "classes": ["…"],
  "feature_columns": ["…"],
  "metrics": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1": 1.0, "confusion_matrix": [[…]], "per_class": […], "params": {…} }
}
```

## Example Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "headache", "body_pain", "fatigue", "muscle_pain", "chills", "cough", "sore_throat"]}'
```

Result (abridged): `predicted_disease: "Influenza"` with the top 3 candidates
and confidence scores. The same flow, in the browser: **Disease Prediction →
select symptoms → Predict Disease**.

## Limitations

- Trained on a **synthetic educational dataset**, not clinical records —
  real-world accuracy would differ.
- Covers only the **15 listed conditions** and **32 binary symptom features**;
  no severity, duration, age, or medical history is considered.
- **Confidence is an ensemble statistic** (fraction of trees voting for the
  class) — it is not a probability of disease and carries no medical meaning.
- Class imbalances, comorbidities and rare presentations are out of scope for
  the demonstration dataset.
- **Not a diagnostic tool** — it must never be used to guide treatment.

## Future Enhancements

- Curated real-world (openly licensed) clinical datasets with documented
  symptom associations.
- Additional models (Logistic Regression, XGBoost, neural networks) with
  side-by-side benchmark comparison.
- Symptom severity/duration inputs and probabilistic confidence calibration
  (e.g. isotonic regression).
- Feature-importance explanations and per-prediction rationale (SHAP-style).
- Prediction history with per-user storage (auth is already wired in).
- Export/shareable prediction records.

## Medical Disclaimer

This system provides a preliminary machine-learning prediction for
**educational purposes only**. It is **NOT a medical diagnosis** and must not
replace evaluation by a qualified healthcare professional. If you are unwell,
please consult a doctor.

---

*Built for educational and portfolio demonstration. All code, data and models
in this repository are open-source and free to use.*
