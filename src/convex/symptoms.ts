/**
 * Symptom catalog endpoint — mirrors GET /symptoms of the FastAPI backend.
 * Returns the 32 supported symptoms grouped into clinical categories.
 */

import { query } from "./_generated/server";
import { SYMPTOM_CATALOG } from "./ml/catalog";

export const listSymptoms = query({
  args: {},
  handler: async () => {
    return SYMPTOM_CATALOG;
  },
});
