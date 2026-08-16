/**
 * End-to-end training pipeline — mirrors backend/ml/train_model.py.
 *
 * Pipeline:
 *   1. Load dataset/disease_symptoms.csv
 *   2. Validate the dataset (coverage, ranges, missing values)
 *   3. Normalize symptom names
 *   4. Generate binary training instances from the documented conditional
 *      probability table (seeded, reproducible)
 *   5. Encode disease labels
 *   6. Stratified train/test split (80/20)
 *   7. Train a Random Forest classifier (from scratch, see randomForest.ts)
 *   8. Evaluate on the held-out test set (accuracy / precision / recall / F1 /
 *      confusion matrix)
 *   9. Write the serialized model + evaluation metadata to
 *      src/convex/ml_model.ts (the artifact used by the Convex backend at
 *      runtime — no hard-coded predictions anywhere).
 *
 * Run from the project root:  bun ml/train_model.ts   (or: bun run ml:train)
 */

import { writeFileSync } from "node:fs";
import type { ModelInfo, RandomForestModel } from "../src/convex/ml/types";
import { FEATURE_COLUMNS } from "../src/convex/ml/types";
import { evaluate } from "./evaluate_model";
import {
  generateInstances,
  loadProbabilityTable,
  trainTestSplit,
  validateTable,
} from "./preprocessing";
import { predictClass, trainRandomForest } from "../src/convex/ml/randomForest";

const DATASET_PATH = "dataset/disease_symptoms.csv";
const OUTPUT_PATH = "src/convex/ml_model.ts";

const INSTANCES_PER_DISEASE = 300;
const NOISE = 0.03;
const GENERATION_SEED = 42;
const SPLIT_SEED = 7;
const TEST_FRACTION = 0.2;

const PARAMS = { nEstimators: 60, maxDepth: 10, minSamplesLeaf: 5, randomSeed: 42 };

function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

function main(): void {
  console.log("═══════════════════════════════════════════════════");
  console.log("  AI Disease Prediction — Model Training Pipeline");
  console.log("═══════════════════════════════════════════════════\n");

  // 1–3. Load, validate, normalize.
  console.log("[1/7] Loading dataset:", DATASET_PATH);
  const rows = loadProbabilityTable(DATASET_PATH);
  validateTable(rows);
  const diseases = [...new Set(rows.map((r) => r.disease))].sort();
  console.log(`      → ${rows.length} probability rows, ${diseases.length} diseases, ${FEATURE_COLUMNS.length} symptom features.`);
  console.log("      → Dataset validation passed (no missing values, all probabilities in [0,1]).\n");

  // 4–5. Generate instances + encode labels.
  console.log("[2/7] Generating binary training instances (documented sampling, seed", `${GENERATION_SEED}).`);
  const dataset = generateInstances(rows, {
    instancesPerDisease: INSTANCES_PER_DISEASE,
    noise: NOISE,
    seed: GENERATION_SEED,
  });
  console.log(`      → ${dataset.features.length} instances (${INSTANCES_PER_DISEASE} per disease), ${dataset.features[0].length} binary features.\n`);

  // 6. Stratified split.
  console.log("[3/7] Stratified train/test split (", `${(1 - TEST_FRACTION) * 100}% / ${TEST_FRACTION * 100}%).`);
  const { trainFeatures, trainLabels, testFeatures, testLabels } = trainTestSplit(
    dataset,
    TEST_FRACTION,
    SPLIT_SEED,
  );
  console.log(`      → train: ${trainFeatures.length}, test: ${testFeatures.length}\n`);

  // 7. Train.
  console.log("[4/7] Training Random Forest (", `${PARAMS.nEstimators} trees, max_depth=${PARAMS.maxDepth}, min_samples_leaf=${PARAMS.minSamplesLeaf}, seed=${PARAMS.randomSeed}).`);
  const started = Date.now();
  const model = trainRandomForest(trainFeatures, trainLabels, dataset.classes, [...FEATURE_COLUMNS], PARAMS);
  const elapsedMs = Date.now() - started;
  const totalNodes = model.trees.reduce((acc, t) => acc + t.nodes.length / 5, 0);
  console.log(`      → trained in ${(elapsedMs / 1000).toFixed(2)}s (${model.trees.length} trees, ${totalNodes} nodes).\n`);

  // 8. Evaluate.
  console.log("[5/7] Evaluating on held-out test set...");
  const predictions = testFeatures.map((f) => predictClass(model, f));
  const evalResult = evaluate(testLabels, predictions, dataset.classes);
  console.log(`      → Accuracy : ${pct(evalResult.accuracy)}`);
  console.log(`      → Precision: ${pct(evalResult.precision)} (macro)`);
  console.log(`      → Recall   : ${pct(evalResult.recall)} (macro)`);
  console.log(`      → F1-score : ${pct(evalResult.f1)} (macro)\n`);

  console.log("[6/7] Per-class report:");
  console.log("      ┌────────────────────────┬──────────┬──────────┬──────────┬─────────┐");
  console.log("      │ disease                 │ precision│ recall   │ f1       │ support │");
  console.log("      ├────────────────────────┼──────────┼──────────┼──────────┼─────────┤");
  for (const row of evalResult.perClass) {
    console.log(
      `      │ ${row.disease.padEnd(23)} │ ${pct(row.precision).padStart(7)} │ ${pct(row.recall).padStart(7)} │ ${pct(row.f1).padStart(7)} │ ${String(row.support).padStart(7)} │`,
    );
  }
  console.log("      └────────────────────────┴──────────┴──────────┴──────────┴─────────┘\n");

  // 9. Serialize.
  console.log("[7/7] Writing model artifact →", OUTPUT_PATH);
  const info: ModelInfo = {
    algorithm: "Random Forest",
    generatedAt: new Date().toISOString(),
    nDiseases: dataset.classes.length,
    nSymptoms: FEATURE_COLUMNS.length,
    trainSamples: trainFeatures.length,
    testSamples: testFeatures.length,
    dataset: {
      instancesPerDisease: INSTANCES_PER_DISEASE,
      noise: NOISE,
      seed: GENERATION_SEED,
      totalInstances: dataset.features.length,
      source: "dataset/disease_symptoms.csv (documented conditional-probability table; educational demonstration)",
    },
    params: { ...PARAMS, featureSubsetSize: model.featureSubsetSize },
    classes: dataset.classes,
    featureColumns: [...FEATURE_COLUMNS],
    accuracy: evalResult.accuracy,
    precision: evalResult.precision,
    recall: evalResult.recall,
    f1: evalResult.f1,
    confusionMatrix: evalResult.confusionMatrix,
    perClass: evalResult.perClass,
  };

  const generated = [
    "/**",
    " * AUTO-GENERATED by ml/train_model.ts — do not edit by hand.",
    " * Regenerate with: bun run ml:train",
    " */",
    'import type { ModelInfo, RandomForestModel } from "./ml/types";',
    "",
    `export const MODEL: RandomForestModel = ${JSON.stringify(model, null, 1)};`,
    "",
    `export const MODEL_INFO: ModelInfo = ${JSON.stringify(info, null, 1)};`,
    "",
  ].join("\n");

  writeFileSync(OUTPUT_PATH, generated, "utf-8");
  console.log("      → model artifact written.\n");

  console.log("═══════════════════════════════════════════════════");
  console.log("  Training complete.");
  console.log(`  Test accuracy: ${pct(evalResult.accuracy)}`);
  console.log("═══════════════════════════════════════════════════");
}

main();
