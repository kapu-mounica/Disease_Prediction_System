/**
 * Model metadata endpoints — mirror GET /model-info and GET /diseases of the
 * FastAPI backend. Return the trained model's configuration, evaluation
 * metrics, supported diseases and feature set (all derived from the training
 * pipeline output; nothing is hard-coded).
 */

import { query } from "./_generated/server";
import { MODEL_INFO } from "./ml_model";

export const getModelInfo = query({
  args: {},
  handler: async () => {
    return MODEL_INFO;
  },
});

export const listDiseases = query({
  args: {},
  handler: async () => {
    return MODEL_INFO.classes;
  },
});
