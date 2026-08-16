/**
 * Shared types for the disease-prediction ML pipeline.
 * Pure types only — no Convex or runtime imports, so these can be used by the
 * training scripts (ml/), the Convex backend (src/convex/), and the React app.
 */

/** A decision tree stored as a flat array of nodes with a fixed stride of 5:
 *   [featureIndex, threshold, leafClass, leftChildIndex, rightChildIndex]
 *  Leaf nodes use featureIndex = -1, leftChildIndex = rightChildIndex = -1 and
 *  store the majority class in leafClass. Non-leaf nodes store -1 in leafClass.
 */
export interface TreeSpec {
  nodes: number[];
}

export interface RandomForestModel {
  algorithm: string;
  nEstimators: number;
  maxDepth: number;
  minSamplesLeaf: number;
  featureSubsetSize: number;
  randomSeed: number;
  nFeatures: number;
  classes: string[];
  featureColumns: string[];
  trees: TreeSpec[];
}

export interface PerClassMetrics {
  disease: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface ModelInfo {
  algorithm: string;
  generatedAt: string;
  nDiseases: number;
  nSymptoms: number;
  trainSamples: number;
  testSamples: number;
  dataset: {
    instancesPerDisease: number;
    noise: number;
    seed: number;
    totalInstances: number;
    source: string;
  };
  params: {
    nEstimators: number;
    maxDepth: number;
    minSamplesLeaf: number;
    featureSubsetSize: number;
    randomSeed: number;
  };
  classes: string[];
  featureColumns: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][];
  perClass: PerClassMetrics[];
}

export interface TopPrediction {
  disease: string;
  confidence: number;
}

export interface PredictionResult {
  predicted_disease: string;
  confidence: number;
  selected_symptoms: string[];
  top_predictions: TopPrediction[];
  timestamp: string;
}

/** Order of symptom features — matches the columns of dataset/disease_symptoms.csv. */
export const FEATURE_COLUMNS: readonly string[] = [
  "fever",
  "headache",
  "cough",
  "fatigue",
  "weakness",
  "nausea",
  "vomiting",
  "diarrhea",
  "abdominal_pain",
  "chest_pain",
  "shortness_of_breath",
  "sore_throat",
  "runny_nose",
  "sneezing",
  "body_pain",
  "chills",
  "sweating",
  "dizziness",
  "joint_pain",
  "muscle_pain",
  "skin_rash",
  "loss_of_appetite",
  "wheezing",
  "blurred_vision",
  "excessive_thirst",
  "frequent_urination",
  "weight_loss",
  "weight_gain",
  "high_blood_pressure",
  "nasal_congestion",
  "loss_of_smell",
  "loss_of_taste",
] as const;
