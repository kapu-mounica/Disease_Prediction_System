/**
 * Symptom catalog — the 32 supported symptom features grouped into clinical
 * categories for the UI. Pure data module: imported by Convex queries and by
 * the inference layer, and mirrored by the Python backend (backend/symptoms.py).
 */

export interface SymptomEntry {
  id: string;
  label: string;
  category: string;
  description: string;
}

export const SYMPTOM_CATEGORIES: readonly string[] = [
  "General & Systemic",
  "Respiratory",
  "Gastrointestinal",
  "Neurological",
  "Musculoskeletal",
  "Metabolic & Endocrine",
  "Cardiovascular",
  "Dermatological",
  "Sensory",
];

export const SYMPTOM_CATALOG: readonly SymptomEntry[] = [
  { id: "fever", label: "Fever", category: "General & Systemic", description: "Elevated body temperature above the normal range" },
  { id: "chills", label: "Chills", category: "General & Systemic", description: "Sensation of cold with shivering, often with fever" },
  { id: "sweating", label: "Sweating", category: "General & Systemic", description: "Excessive perspiration, including night sweats" },
  { id: "fatigue", label: "Fatigue", category: "General & Systemic", description: "Persistent tiredness or low energy" },
  { id: "weakness", label: "Weakness", category: "General & Systemic", description: "Reduced strength or loss of physical power" },
  { id: "body_pain", label: "Body Ache", category: "General & Systemic", description: "Generalised aches across the body" },
  { id: "cough", label: "Cough", category: "Respiratory", description: "Persistent or frequent coughing" },
  { id: "sore_throat", label: "Sore Throat", category: "Respiratory", description: "Pain or irritation of the throat" },
  { id: "runny_nose", label: "Runny Nose", category: "Respiratory", description: "Excess nasal discharge" },
  { id: "sneezing", label: "Sneezing", category: "Respiratory", description: "Repeated involuntary sneezing" },
  { id: "nasal_congestion", label: "Nasal Congestion", category: "Respiratory", description: "Blocked or stuffy nose" },
  { id: "shortness_of_breath", label: "Shortness of Breath", category: "Respiratory", description: "Difficulty or laboured breathing" },
  { id: "wheezing", label: "Wheezing", category: "Respiratory", description: "Whistling sound while breathing" },
  { id: "nausea", label: "Nausea", category: "Gastrointestinal", description: "Feeling of sickness or urge to vomit" },
  { id: "vomiting", label: "Vomiting", category: "Gastrointestinal", description: "Expelling stomach contents" },
  { id: "diarrhea", label: "Diarrhea", category: "Gastrointestinal", description: "Frequent loose or watery stools" },
  { id: "abdominal_pain", label: "Abdominal Pain", category: "Gastrointestinal", description: "Pain or cramps in the abdomen" },
  { id: "loss_of_appetite", label: "Loss of Appetite", category: "Gastrointestinal", description: "Reduced desire to eat" },
  { id: "headache", label: "Headache", category: "Neurological", description: "Pain in the head or scalp" },
  { id: "dizziness", label: "Dizziness", category: "Neurological", description: "Feeling faint, lightheaded or unsteady" },
  { id: "blurred_vision", label: "Blurred Vision", category: "Neurological", description: "Loss of sharpness of vision" },
  { id: "joint_pain", label: "Joint Pain", category: "Musculoskeletal", description: "Aches or stiffness in the joints" },
  { id: "muscle_pain", label: "Muscle Pain", category: "Musculoskeletal", description: "Aches or cramps in the muscles" },
  { id: "excessive_thirst", label: "Excessive Thirst", category: "Metabolic & Endocrine", description: "Unusually strong or persistent thirst" },
  { id: "frequent_urination", label: "Frequent Urination", category: "Metabolic & Endocrine", description: "Urinating more often than usual" },
  { id: "weight_loss", label: "Weight Loss", category: "Metabolic & Endocrine", description: "Unexplained loss of body weight" },
  { id: "weight_gain", label: "Weight Gain", category: "Metabolic & Endocrine", description: "Unexplained increase in body weight" },
  { id: "chest_pain", label: "Chest Pain", category: "Cardiovascular", description: "Discomfort or pain in the chest" },
  { id: "high_blood_pressure", label: "High Blood Pressure", category: "Cardiovascular", description: "Elevated measured blood pressure" },
  { id: "skin_rash", label: "Skin Rash", category: "Dermatological", description: "Abnormal skin redness or eruption" },
  { id: "loss_of_smell", label: "Loss of Smell", category: "Sensory", description: "Reduced or absent sense of smell" },
  { id: "loss_of_taste", label: "Loss of Taste", category: "Sensory", description: "Reduced or absent sense of taste" },
];
