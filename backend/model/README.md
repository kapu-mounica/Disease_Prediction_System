# Model artifacts (generated — not committed)

The files in this directory are produced by the training pipeline and are
intentionally excluded from version control (see `.gitignore`):

| File                  | Produced by                          | Used by                    |
| --------------------- | ------------------------------------ | -------------------------- |
| `disease_model.pkl`   | `python backend/ml/train_model.py`   | `backend/main.py`          |
| `label_encoder.pkl`   | `python backend/ml/train_model.py`   | `backend/main.py`          |
| `feature_columns.pkl` | `python backend/ml/train_model.py`   | `backend/main.py`          |
| `metrics.json`        | `python backend/ml/train_model.py`   | `GET /model-info`          |

Generate them with:

```bash
cd <project root>
pip install -r backend/requirements.txt
python backend/ml/train_model.py
```

The live web deployment does not use these files — it serves the equivalent
model trained by the TypeScript pipeline (`ml/train_model.ts` →
`src/convex/ml_model.ts`) through the Convex backend, so the app works without
any local Python setup.
