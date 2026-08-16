/**
 * A from-scratch Random Forest classifier, implemented without any ML library.
 *
 * Mirrors the reference scikit-learn implementation used by the Python backend
 * (backend/ml/): CART decision trees grown with Gini impurity, bootstrap
 * bagging, and random feature subsampling (sqrt) at every split. Inference uses
 * majority voting across the ensemble; confidence for a class is the fraction
 * of trees that predicted it.
 *
 * Deterministic: every source of randomness flows through a seeded mulberry32
 * PRNG, so retraining reproduces the exact same model.
 *
 * Lives inside src/convex so the Convex backend can bundle the inference path;
 * the training pipeline (ml/) imports it from here too — one implementation.
 */

import type { RandomForestModel, TreeSpec } from "./types";

/** Seeded mulberry32 PRNG — deterministic across runs and platforms. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ForestParams {
  nEstimators: number;
  maxDepth: number;
  minSamplesLeaf: number;
  randomSeed: number;
}

const NODE_STRIDE = 5;
const IDX_FEATURE = 0;
const IDX_THRESHOLD = 1;
const IDX_CLASS = 2;
const IDX_LEFT = 3;
const IDX_RIGHT = 4;

function classCounts(rows: number[], labels: number[], nClasses: number): number[] {
  const counts = new Array<number>(nClasses).fill(0);
  for (const r of rows) counts[labels[r]]++;
  return counts;
}

function argmax(counts: number[]): number {
  let best = 0;
  for (let i = 1; i < counts.length; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

function giniImpurity(rows: number[], labels: number[], nClasses: number): number {
  if (rows.length === 0) return 0;
  const counts = classCounts(rows, labels, nClasses);
  let impurity = 1;
  for (const c of counts) {
    if (c > 0) {
      const p = c / rows.length;
      impurity -= p * p;
    }
  }
  return impurity;
}

/** Finds the best binary split (threshold 0.5 — features are 0/1) by Gini gain. */
function bestSplit(
  rows: number[],
  features: number[][],
  labels: number[],
  nClasses: number,
  candidateFeatures: number[],
): { feature: number; gain: number } | null {
  const parentImpurity = giniImpurity(rows, labels, nClasses);
  let best: { feature: number; gain: number } | null = null;
  for (const f of candidateFeatures) {
    const left: number[] = [];
    const right: number[] = [];
    for (const r of rows) (features[r][f] > 0.5 ? right : left).push(r);
    if (left.length === 0 || right.length === 0) continue;
    const gain =
      parentImpurity -
      (left.length / rows.length) * giniImpurity(left, labels, nClasses) -
      (right.length / rows.length) * giniImpurity(right, labels, nClasses);
    if (gain <= 0) continue;
    if (best === null || gain > best.gain) best = { feature: f, gain };
  }
  return best;
}

function buildTree(
  rows: number[],
  features: number[][],
  labels: number[],
  nClasses: number,
  params: ForestParams,
  featureSubsetSize: number,
  rng: () => number,
  depth: number,
  nodes: number[],
  importance: number[],
): number {
  const nodeIndex = nodes.length / NODE_STRIDE;
  // Placeholder node, filled in below.
  nodes.push(0, 0, 0, 0, 0);

  const counts = classCounts(rows, labels, nClasses);
  const majority = argmax(counts);
  const isPure = counts[majority] === rows.length;

  if (isPure || depth >= params.maxDepth || rows.length < 2 * params.minSamplesLeaf) {
    nodes[nodeIndex * NODE_STRIDE + IDX_FEATURE] = -1;
    nodes[nodeIndex * NODE_STRIDE + IDX_CLASS] = majority;
    nodes[nodeIndex * NODE_STRIDE + IDX_LEFT] = -1;
    nodes[nodeIndex * NODE_STRIDE + IDX_RIGHT] = -1;
    return nodeIndex;
  }

  // Random feature subset (like sklearn max_features="sqrt").
  const candidateFeatures: number[] = [];
  const pool: number[] = [];
  for (let f = 0; f < features[0].length; f++) pool.push(f);
  for (let i = 0; i < featureSubsetSize && pool.length > 0; i++) {
    const pick = Math.floor(rng() * pool.length);
    candidateFeatures.push(pool[pick]);
    pool[pick] = pool[pool.length - 1];
    pool.pop();
  }

  const split = bestSplit(rows, features, labels, nClasses, candidateFeatures);
  if (split === null) {
    nodes[nodeIndex * NODE_STRIDE + IDX_FEATURE] = -1;
    nodes[nodeIndex * NODE_STRIDE + IDX_CLASS] = majority;
    nodes[nodeIndex * NODE_STRIDE + IDX_LEFT] = -1;
    nodes[nodeIndex * NODE_STRIDE + IDX_RIGHT] = -1;
    return nodeIndex;
  }

  // Gini importance: impurity decrease weighted by the node's sample count
  // (sklearn-style), accumulated per feature across the whole forest.
  importance[split.feature] += split.gain * rows.length;

  const left: number[] = [];
  const right: number[] = [];
  for (const r of rows) (features[r][split.feature] > 0.5 ? right : left).push(r);

  const leftChild = buildTree(left, features, labels, nClasses, params, featureSubsetSize, rng, depth + 1, nodes, importance);
  const rightChild = buildTree(right, features, labels, nClasses, params, featureSubsetSize, rng, depth + 1, nodes, importance);

  nodes[nodeIndex * NODE_STRIDE + IDX_FEATURE] = split.feature;
  nodes[nodeIndex * NODE_STRIDE + IDX_THRESHOLD] = 0.5;
  nodes[nodeIndex * NODE_STRIDE + IDX_CLASS] = -1;
  nodes[nodeIndex * NODE_STRIDE + IDX_LEFT] = leftChild;
  nodes[nodeIndex * NODE_STRIDE + IDX_RIGHT] = rightChild;
  return nodeIndex;
}

/** Trains a Random Forest on binary features. Returns the serialized model. */
export function trainRandomForest(
  features: number[][],
  labels: number[],
  classes: string[],
  featureColumns: string[],
  params: ForestParams,
): RandomForestModel {
  const nClasses = classes.length;
  const nFeatures = featureColumns.length;
  const featureSubsetSize = Math.max(1, Math.floor(Math.sqrt(nFeatures)));
  const trees: TreeSpec[] = [];
  const baseRng = mulberry32(params.randomSeed);
  const importance = new Array<number>(nFeatures).fill(0);

  for (let t = 0; t < params.nEstimators; t++) {
    // Bootstrap sample (sampling with replacement) — per-tree RNG derived from
    // the base seed so the whole run is reproducible.
    const rng = mulberry32((params.randomSeed + 1 + t * 7919) >>> 0);
    const boot: number[] = [];
    for (let i = 0; i < features.length; i++) {
      boot.push(Math.floor(rng() * features.length));
    }
    const nodes: number[] = [];
    buildTree(
      boot,
      features,
      labels,
      nClasses,
      params,
      featureSubsetSize,
      rng,
      0,
      nodes,
      importance,
    );
    trees.push({ nodes });
  }

  // Normalize importance: average across all trees and bootstrap samples, then
  // scale so the values sum to 1 (sklearn convention).
  const totalWeight = features.length * params.nEstimators;
  for (let i = 0; i < nFeatures; i++) importance[i] /= totalWeight;
  const sum = importance.reduce((acc, v) => acc + v, 0);
  if (sum > 0) for (let i = 0; i < nFeatures; i++) importance[i] /= sum;

  return {
    algorithm: "Random Forest",
    nEstimators: params.nEstimators,
    maxDepth: params.maxDepth,
    minSamplesLeaf: params.minSamplesLeaf,
    featureSubsetSize,
    randomSeed: params.randomSeed,
    nFeatures,
    classes,
    featureColumns,
    featureImportance: importance,
    trees,
  };
}

/** Predicts the class of a single feature vector with one tree. */
export function predictTree(tree: TreeSpec, features: number[]): number {
  const nodes = tree.nodes;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const f = nodes[i * NODE_STRIDE + IDX_FEATURE];
    if (f < 0) return nodes[i * NODE_STRIDE + IDX_CLASS];
    const goRight = features[f] > nodes[i * NODE_STRIDE + IDX_THRESHOLD];
    i = goRight ? nodes[i * NODE_STRIDE + IDX_RIGHT] : nodes[i * NODE_STRIDE + IDX_LEFT];
  }
}

/**
 * Predicts class probabilities (fraction of trees voting for each class).
 * Returns an array aligned with model.classes.
 */
export function predictProbabilities(model: RandomForestModel, features: number[]): number[] {
  const votes = new Array<number>(model.classes.length).fill(0);
  for (const tree of model.trees) {
    votes[predictTree(tree, features)]++;
  }
  const total = model.trees.length;
  return votes.map((v) => (total > 0 ? v / total : 0));
}

/** Predicts a single class (majority vote across the ensemble). */
export function predictClass(model: RandomForestModel, features: number[]): number {
  const probs = predictProbabilities(model, features);
  return argmax(probs);
}
