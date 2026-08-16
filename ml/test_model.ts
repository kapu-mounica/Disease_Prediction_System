/**
 * Model sanity tests — run with: bun ml/test_model.ts  (or: bun run ml:test)
 *
 * Verifies that the trained artifact (src/convex/ml_model.ts) used by the
 * Convex backend produces medically sensible predictions, validates input, and
 * returns well-formed top-3 results. The exact same inference code path
 * (src/convex/ml/inference.ts) is what runs server-side.
 */

import { MODEL, MODEL_INFO } from "../src/convex/ml_model";
import {
  buildPrediction,
  PredictionValidationError,
  validateSymptoms,
} from "../src/convex/ml/inference";

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    failures++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function expectError(symptoms: unknown, label: string): void {
  try {
    validateSymptoms(symptoms);
    failures++;
    console.error(`  ✗ FAIL: ${label} — expected an error but none was thrown`);
  } catch (e) {
    if (e instanceof PredictionValidationError) {
      console.log(`  ✓ ${label} (rejected: ${e.message})`);
    } else {
      failures++;
      console.error(`  ✗ FAIL: ${label} — wrong error type: ${e}`);
    }
  }
}

function expectDisease(symptoms: string[], disease: string, label: string): void {
  const result = buildPrediction(MODEL, validateSymptoms(symptoms));
  if (result.predicted_disease === disease) {
    console.log(
      `  ✓ ${label} → ${result.predicted_disease} (${(result.confidence * 100).toFixed(1)}%)`,
    );
  } else {
    failures++;
    console.error(
      `  ✗ FAIL: ${label} — expected ${disease}, got ${result.predicted_disease} (${result.top_predictions
        .map((t) => `${t.disease}:${(t.confidence * 100).toFixed(0)}%`)
        .join(", ")})`,
    );
  }
}

console.log("═══════════════════════════════════════════════════");
console.log("  Model sanity tests");
console.log("═══════════════════════════════════════════════════\n");

console.log("[1] Artifact sanity");
assert(MODEL.classes.length === 15, "model supports 15 diseases");
assert(MODEL.featureColumns.length === 32, "model uses 32 symptom features");
assert(MODEL.trees.length === MODEL_INFO.params.nEstimators, "forest contains the reported number of trees");
assert(MODEL_INFO.accuracy >= 0.9, `reported test accuracy is ${(MODEL_INFO.accuracy * 100).toFixed(1)}% (≥ 90%)`);
assert(MODEL_INFO.confusionMatrix.length === 15, "confusion matrix is 15×15");

console.log("\n[2] Medically sensible predictions");
expectDisease(["fever", "cough", "sore_throat", "body_pain", "fatigue", "muscle_pain", "chills", "headache"], "Influenza", "classic flu presentation");
expectDisease(["fever", "cough", "shortness_of_breath", "chest_pain", "fatigue"], "Pneumonia", "pneumonia presentation");
expectDisease(["diarrhea", "vomiting", "nausea", "abdominal_pain"], "Gastroenteritis", "gastroenteritis presentation");
expectDisease(["excessive_thirst", "frequent_urination", "fatigue", "weight_loss"], "Diabetes", "diabetes presentation");
expectDisease(["wheezing", "shortness_of_breath", "cough"], "Asthma", "asthma presentation");
expectDisease(["headache", "nausea", "blurred_vision", "dizziness"], "Migraine", "migraine presentation");
expectDisease(["fever", "joint_pain", "muscle_pain", "skin_rash", "headache"], "Dengue", "dengue presentation");
expectDisease(["fever", "chills", "sweating", "headache", "body_pain"], "Malaria", "malaria presentation");
expectDisease(["fever", "cough", "fatigue", "loss_of_smell", "loss_of_taste"], "COVID-19", "COVID-19 presentation");
expectDisease(["fever", "cough", "weight_loss", "sweating", "fatigue"], "Tuberculosis", "tuberculosis presentation");
expectDisease(["fever", "abdominal_pain", "loss_of_appetite", "weakness", "headache"], "Typhoid", "typhoid presentation");
expectDisease(["runny_nose", "sneezing", "nasal_congestion", "sore_throat"], "Common Cold", "common cold presentation");
expectDisease(["high_blood_pressure", "dizziness", "headache"], "Hypertension", "hypertension presentation");

console.log("\n[3] Top-3 result shape");
const r = buildPrediction(MODEL, validateSymptoms(["fever", "cough", "fatigue"]));
assert(r.top_predictions.length === 3, "returns exactly 3 top predictions");
assert(r.top_predictions[0].disease === r.predicted_disease, "top prediction matches predicted disease");
assert(r.selected_symptoms.length === 3, "echoes selected symptoms");
assert(r.confidence >= r.top_predictions[1].confidence && r.top_predictions[1].confidence >= r.top_predictions[2].confidence, "confidences are sorted descending");
assert(r.top_predictions.reduce((s, t) => s + t.confidence, 0) <= 1.0001, "confidences sum to ≤ 1");
assert(r.top_predictions.every((t) => t.confidence >= 0 && t.confidence <= 1), "confidences are within [0, 1]");

console.log("\n[4] Input validation");
expectError([], "empty symptom list");
expectError(["not_a_real_symptom"], "unknown symptom");
expectError(["fever", "bogus"], "mixed valid + invalid");
expectError(["fever", "  "], "blank symptom");
expectError(null, "non-array input");
expectError([42], "non-string element");
expectError(Array(40).fill("fever"), "too many symptoms");

console.log("\n[5] Normalization + deduplication");
const norm = validateSymptoms([" Fever ", "body-pain", "fever", "Body Pain"]);
assert(norm.length === 2 && norm.includes("fever") && norm.includes("body_pain"), "normalizes and deduplicates symptom names");

console.log("\n═══════════════════════════════════════════════════");
if (failures > 0) {
  console.error(`  ${failures} test(s) FAILED`);
  process.exit(1);
}
console.log("  All model tests passed.");
console.log("═══════════════════════════════════════════════════");
