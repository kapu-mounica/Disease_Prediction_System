/**
 * Preprocessing pipeline — mirrors backend/ml/preprocessing.py.
 *
 * The demonstration dataset (dataset/disease_symptoms.csv) is a documented
 * conditional-probability table: for each disease it records the probability
 * that each symptom is present. The training pipeline expands it into binary
 * feature instances by sampling, per disease, N instances where each symptom is
 * present with its documented probability (plus a small uniform noise term).
 * Labels are never randomized — every instance is generated from the ground
 * truth of its own disease, which is what keeps the dataset internally
 * consistent.
 */

import { readFileSync } from "node:fs";
import { mulberry32 } from "../src/convex/ml/randomForest";
import { FEATURE_COLUMNS } from "../src/convex/ml/types";

export interface ProbabilityRow {
  disease: string;
  symptom: string;
  probability: number;
}

export interface GeneratedDataset {
  features: number[][];
  labels: number[];
  classes: string[]; // ordered unique disease names (deterministic)
  instancesPerDisease: number;
  noise: number;
  seed: number;
}

/** Normalizes a symptom name: trims, lowercases, spaces/hyphens -> underscores. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function loadProbabilityTable(csvPath: string): ProbabilityRow[] {
  const text = readFileSync(csvPath, "utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(",").map((h) => h.trim());
  if (header.join(",") !== "disease,symptom,probability") {
    throw new Error(`Unexpected CSV header: ${header.join(",")}`);
  }
  const rows: ProbabilityRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length !== 3) {
      throw new Error(`Malformed CSV row ${i + 1}: ${lines[i]}`);
    }
    const disease = parts[0].trim();
    const symptom = normalizeName(parts[1]);
    const probability = Number(parts[2]);
    if (disease.length === 0) throw new Error(`Empty disease name at row ${i + 1}`);
    if (symptom.length === 0) throw new Error(`Empty symptom name at row ${i + 1}`);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
      throw new Error(`Invalid probability '${parts[2]}' at row ${i + 1}`);
    }
    rows.push({ disease, symptom, probability });
  }
  return rows;
}

/** Validates the table: full disease and feature coverage, no missing values. */
export function validateTable(rows: ProbabilityRow[]): void {
  const diseases = [...new Set(rows.map((r) => r.disease))].sort();
  const symptomSet = new Set(rows.map((r) => r.symptom));
  for (const feature of FEATURE_COLUMNS) {
    if (!symptomSet.has(feature)) {
      throw new Error(`Dataset is missing the symptom feature: ${feature}`);
    }
  }
  const keyed = new Set(rows.map((r) => `${r.disease}\u0000${r.symptom}`));
  for (const disease of diseases) {
    for (const feature of FEATURE_COLUMNS) {
      if (!keyed.has(`${disease}\u0000${feature}`)) {
        throw new Error(`Dataset is missing (${disease}, ${feature})`);
      }
    }
  }
  if (diseases.length < 2) throw new Error("Dataset must contain at least 2 diseases");
}

/**
 * Expands the probability table into binary instances.
 * Deterministic given seed: symptoms sampled with probability p (jittered by
 * uniform noise) per documented disease ground truth.
 */
export function generateInstances(
  rows: ProbabilityRow[],
  opts: { instancesPerDisease: number; noise: number; seed: number },
): GeneratedDataset {
  validateTable(rows);
  const classes = [...new Set(rows.map((r) => r.disease))].sort();
  const probs = new Map<string, number>();
  for (const r of rows) probs.set(`${r.disease}\u0000${r.symptom}`, r.probability);

  const rng = mulberry32(opts.seed);
  const features: number[][] = [];
  const labels: number[] = [];
  for (const disease of classes) {
    for (let i = 0; i < opts.instancesPerDisease; i++) {
      const vector: number[] = [];
      for (const symptom of FEATURE_COLUMNS) {
        const p = probs.get(`${disease}\u0000${symptom}`)!;
        const jitter = (rng() * 2 - 1) * opts.noise;
        vector.push(Math.min(1, Math.max(0, p + jitter)) > 0.5 ? 1 : 0);
      }
      features.push(vector);
      labels.push(classes.indexOf(disease));
    }
  }
  return { features, labels, classes, instancesPerDisease: opts.instancesPerDisease, noise: opts.noise, seed: opts.seed };
}

/** Deterministic stratified train/test split (80/20) with a seeded shuffle. */
export function trainTestSplit(
  dataset: GeneratedDataset,
  testFraction: number,
  seed: number,
): { trainFeatures: number[][]; trainLabels: number[]; testFeatures: number[][]; testLabels: number[] } {
  const rng = mulberry32(seed);
  const trainFeatures: number[][] = [];
  const trainLabels: number[] = [];
  const testFeatures: number[][] = [];
  const testLabels: number[] = [];

  for (let c = 0; c < dataset.classes.length; c++) {
    const indices: number[] = [];
    for (let i = 0; i < dataset.labels.length; i++) {
      if (dataset.labels[i] === c) indices.push(i);
    }
    // Fisher–Yates shuffle with the seeded PRNG.
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }
    const splitAt = Math.floor(indices.length * (1 - testFraction));
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const target = i < splitAt ? trainFeatures : testFeatures;
      const targetLabels = i < splitAt ? trainLabels : testLabels;
      target.push(dataset.features[idx]);
      targetLabels.push(dataset.labels[idx]);
    }
  }
  return { trainFeatures, trainLabels, testFeatures, testLabels };
}
