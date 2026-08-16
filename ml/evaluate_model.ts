/**
 * Model evaluation — mirrors backend/ml/evaluate_model.py.
 * Computes accuracy, macro-averaged precision/recall/F1 and the confusion
 * matrix over a held-out test set.
 */

import type { PerClassMetrics } from "../src/convex/ml/types";

export function confusionMatrix(yTrue: number[], yPred: number[], nClasses: number): number[][] {
  const matrix = Array.from({ length: nClasses }, () => new Array<number>(nClasses).fill(0));
  for (let i = 0; i < yTrue.length; i++) matrix[yTrue[i]][yPred[i]]++;
  return matrix;
}

export interface EvalResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][];
  perClass: PerClassMetrics[];
  testSamples: number;
}

export function evaluate(
  yTrue: number[],
  yPred: number[],
  classes: string[],
): EvalResult {
  const nClasses = classes.length;
  const matrix = confusionMatrix(yTrue, yPred, nClasses);

  let correct = 0;
  for (let i = 0; i < yTrue.length; i++) if (yTrue[i] === yPred[i]) correct++;
  const accuracy = yTrue.length > 0 ? correct / yTrue.length : 0;

  const perClass: PerClassMetrics[] = [];
  let precisionSum = 0;
  let recallSum = 0;
  let f1Sum = 0;
  for (let c = 0; c < nClasses; c++) {
    const tp = matrix[c][c];
    let fp = 0;
    let fn = 0;
    let support = 0;
    for (let r = 0; r < nClasses; r++) {
      fp += matrix[r][c];
      fn += matrix[c][r];
      support += matrix[c][r];
    }
    fp -= tp;
    fn -= tp;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    precisionSum += precision;
    recallSum += recall;
    f1Sum += f1;
    perClass.push({ disease: classes[c], precision, recall, f1, support });
  }

  const macroPrecision = precisionSum / nClasses;
  const macroRecall = recallSum / nClasses;
  const macroF1 = f1Sum / nClasses;

  return {
    accuracy,
    precision: macroPrecision,
    recall: macroRecall,
    f1: macroF1,
    confusionMatrix: matrix,
    perClass,
    testSamples: yTrue.length,
  };
}
