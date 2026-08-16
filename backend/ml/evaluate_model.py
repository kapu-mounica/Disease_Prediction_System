"""Model evaluation helpers — mirrors ml/evaluate_model.ts."""

from __future__ import annotations

from typing import Any

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)


def evaluate_model(y_true, y_pred, class_names: list[str]) -> dict[str, Any]:
    """Compute accuracy, macro precision/recall/F1 and the confusion matrix."""
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=list(range(len(class_names))), average=None,
    )
    macro = precision_recall_fscore_support(
        y_true, y_pred, labels=list(range(len(class_names))), average="macro",
    )
    report = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(macro[0]),
        "recall": float(macro[1]),
        "f1": float(macro[2]),
        "confusion_matrix": confusion_matrix(
            y_true, y_pred, labels=list(range(len(class_names))),
        ).tolist(),
        "per_class": [
            {
                "disease": name,
                "precision": float(precision[i]),
                "recall": float(recall[i]),
                "f1": float(f1[i]),
                "support": int(support[i]),
            }
            for i, name in enumerate(class_names)
        ],
        "classification_report": classification_report(
            y_true, y_pred, labels=list(range(len(class_names))),
            target_names=class_names, zero_division=0,
        ),
    }
    return report
