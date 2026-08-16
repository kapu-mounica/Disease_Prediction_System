/**
 * Runtime inference layer used by the Convex `predict` action.
 * Pure functions (no Convex imports) so the same code path is unit-tested by
 * ml/test_model.ts and executed server-side by the action.
 */

import { SYMPTOM_CATALOG } from "./catalog";
import { predictProbabilities } from "./randomForest";
import type { PredictionResult, RandomForestModel, TopPrediction } from "./types";

export class PredictionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PredictionValidationError";
  }
}

export function normalizeSymptomName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Normalizes and validates a symptom list. Returns the normalized symptom ids.
 * Throws PredictionValidationError for empty input or unknown symptoms.
 */
export function validateSymptoms(symptoms: unknown): string[] {
  if (!Array.isArray(symptoms)) {
    throw new PredictionValidationError("Request body must contain a 'symptoms' array.");
  }
  if (symptoms.length === 0) {
    throw new PredictionValidationError("Please select at least one symptom before predicting.");
  }
  if (symptoms.length > 32) {
    throw new PredictionValidationError("At most 32 symptoms can be provided.");
  }
  const known = new Set<string>(SYMPTOM_CATALOG.map((s) => s.id));
  const normalized: string[] = [];
  for (const raw of symptoms) {
    if (typeof raw !== "string" || raw.trim().length === 0) {
      throw new PredictionValidationError("Every symptom must be a non-empty string.");
    }
    const id = normalizeSymptomName(raw);
    if (!known.has(id)) {
      throw new PredictionValidationError(`Unknown symptom: "${raw}".`);
    }
    if (!normalized.includes(id)) normalized.push(id);
  }
  return normalized;
}

/** Encodes a normalized symptom list into the model's binary feature vector. */
export function encodeFeatures(symptoms: string[], featureColumns: string[]): number[] {
  const present = new Set(symptoms);
  return featureColumns.map((f) => (present.has(f) ? 1 : 0));
}

/** Builds the full prediction result: top class + top-3 with confidences. */
export function buildPrediction(model: RandomForestModel, symptoms: string[]): PredictionResult {
  const features = encodeFeatures(symptoms, model.featureColumns);
  const probs = predictProbabilities(model, features);

  const ranked: TopPrediction[] = model.classes
    .map((disease, i) => ({ disease, confidence: probs[i] }))
    .sort((a, b) => b.confidence - a.confidence);

  const top = ranked.slice(0, 3);
  return {
    predicted_disease: top[0].disease,
    confidence: top[0].confidence,
    selected_symptoms: symptoms,
    top_predictions: top,
    timestamp: new Date().toISOString(),
  };
}
