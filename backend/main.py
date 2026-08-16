"""FastAPI backend for the AI Disease Predictor.

Endpoints:
    GET  /            → application metadata
    GET  /health      → service + model availability
    GET  /symptoms    → the 32 supported symptoms (with categories)
    GET  /diseases    → the 15 supported disease classes
    POST /predict     → run the trained Random Forest on a symptom list
    POST /retrain     → re-run the training pipeline and reload the model
    GET  /model-info  → model configuration + evaluation metrics

Run:  uvicorn backend.main:app --reload --port 8000
"""

from __future__ import annotations

import json
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Ensure this package's directory is importable regardless of how the app is
# launched (`uvicorn backend.main:app` from the project root, or directly).
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from symptoms import SYMPTOM_CATALOG  # noqa: E402

MODEL_DIR = BACKEND_DIR / "model"

_MODEL = None
_LABEL_ENCODER = None
_FEATURE_COLUMNS = None


def _load_model() -> None:
    """Load the trained artifacts from backend/model/. Sets globals or None."""
    global _MODEL, _LABEL_ENCODER, _FEATURE_COLUMNS
    try:
        _MODEL = joblib.load(MODEL_DIR / "disease_model.pkl")
        _LABEL_ENCODER = joblib.load(MODEL_DIR / "label_encoder.pkl")
        _FEATURE_COLUMNS = joblib.load(MODEL_DIR / "feature_columns.pkl")
    except FileNotFoundError:
        _MODEL = None
        _LABEL_ENCODER = None
        _FEATURE_COLUMNS = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    _load_model()
    yield


app = FastAPI(
    title="AI Disease Predictor API",
    version="1.0.0",
    description=(
        "Machine Learning Based Preliminary Health Risk Assessment. "
        "Educational demonstration only — not a medical diagnosis."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # educational demo; restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _normalize(name: str) -> str:
    return name.strip().lower().replace("-", "_").replace(" ", "_")


class PredictRequest(BaseModel):
    symptoms: list[str] = Field(..., description="List of symptom ids, e.g. ['fever', 'cough']")


@app.get("/")
def root():
    return {
        "name": "AI Disease Predictor API",
        "version": "1.0.0",
        "description": "Machine Learning Based Preliminary Health Risk Assessment (educational only).",
        "endpoints": ["/health", "/symptoms", "/diseases", "/predict", "/retrain", "/model-info"],
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _MODEL is not None}


@app.get("/symptoms")
def symptoms():
    return {"count": len(SYMPTOM_CATALOG), "symptoms": SYMPTOM_CATALOG}


@app.get("/diseases")
def diseases():
    if _LABEL_ENCODER is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Run backend/ml/train_model.py first.")
    return {"count": len(_LABEL_ENCODER.classes_), "diseases": list(_LABEL_ENCODER.classes_)}


@app.get("/model-info")
def model_info():
    if _MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="Model artifacts are missing. Run `python backend/ml/train_model.py` first.",
        )
    metrics_path = MODEL_DIR / "metrics.json"
    metrics = json.loads(metrics_path.read_text()) if metrics_path.exists() else {}
    return {
        "algorithm": "Random Forest",
        "n_diseases": int(len(_LABEL_ENCODER.classes_)),
        "n_symptoms": int(len(_FEATURE_COLUMNS)),
        "classes": list(_LABEL_ENCODER.classes_),
        "feature_columns": list(_FEATURE_COLUMNS),
        "metrics": metrics,
    }


@app.post("/predict")
def predict(req: PredictRequest):
    if _MODEL is None or _LABEL_ENCODER is None or _FEATURE_COLUMNS is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Run `python backend/ml/train_model.py` first.",
        )
    if not req.symptoms:
        raise HTTPException(status_code=422, detail="Please select at least one symptom before predicting.")

    normalized: list[str] = []
    known = set(_FEATURE_COLUMNS)
    for raw in req.symptoms:
        if not isinstance(raw, str) or not raw.strip():
            raise HTTPException(status_code=422, detail="Every symptom must be a non-empty string.")
        name = _normalize(raw)
        if name not in known:
            raise HTTPException(status_code=422, detail=f'Unknown symptom: "{raw}".')
        if name not in normalized:
            normalized.append(name)

    vector = [[1 if feature in normalized else 0 for feature in _FEATURE_COLUMNS]]
    proba = _MODEL.predict_proba(vector)[0]
    ranked = sorted(
        zip(_LABEL_ENCODER.classes_, proba, strict=True),
        key=lambda item: item[1],
        reverse=True,
    )
    top = ranked[:3]
    return {
        "predicted_disease": top[0][0],
        "confidence": float(top[0][1]),
        "selected_symptoms": normalized,
        "top_predictions": [
            {"disease": disease, "confidence": float(confidence)}
            for disease, confidence in top
        ],
    }


@app.post("/retrain")
def retrain():
    """Re-run the training pipeline, then reload the freshly saved model."""
    sys.path.insert(0, str(Path(__file__).resolve().parent / "ml"))
    try:
        from train_model import main as train_main  # type: ignore[import-not-found]
        metrics = train_main()
    except Exception as exc:  # pragma: no cover - surfaced to the client
        raise HTTPException(status_code=500, detail=f"Retraining failed: {exc}") from exc
    _load_model()
    return {"status": "ok", "message": "Model retrained and reloaded.", "metrics": metrics}


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
