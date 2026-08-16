/**
 * Consultation & Next-Step Guidance — curated educational content for the
 * 15 supported diseases.
 *
 * IMPORTANT: this is decision-support copy for an educational demonstration.
 * It deliberately avoids diagnoses, prescriptions, dosages, guarantees and
 * mandatory referrals. Every entry uses "possible prediction" framing and
 * directs users toward a healthcare professional rather than replacing one.
 *
 * Pure data module: imported directly by the React report component, and
 * mirrored in spirit by the Python reference backend docs.
 */

export interface DiseaseGuidance {
  /** Healthcare professionals to consider — "Consider discussing your symptoms with…" */
  consult: string[];
  /** Optional caution appended to the consult section (e.g. "may need urgent evaluation"). */
  consultNote?: string;
  /** Plain-language explanation of what the prediction means. */
  beginner: string;
  /** General questions the user may want to ask a doctor (no prescriptions/dosages). */
  questions: string[];
  /** Disease-relevant warning signs shown alongside the general emergency list. */
  warningSigns?: string[];
}

/** General questions offered for every prediction (from the module spec). */
export const GENERAL_QUESTIONS: readonly string[] = [
  "What could be causing these symptoms?",
  "Do I need any tests?",
  "Are there warning signs I should watch for?",
  "How soon should I seek medical evaluation?",
  "Could another condition cause similar symptoms?",
];

/** General emergency warning signs — shown for every prediction. */
export const EMERGENCY_WARNING_SIGNS: readonly string[] = [
  "Severe difficulty breathing",
  "Severe chest pain",
  "Loss of consciousness",
  "Severe confusion",
  "Sudden weakness or difficulty speaking",
  "Severe bleeding",
  "Seizure",
  "Severe allergic reaction (swelling of the face or throat, difficulty swallowing or breathing)",
];

/** The required final disclaimer, shown verbatim after every prediction. */
export const FINAL_DISCLAIMER =
  "Important: This application is an educational machine-learning demonstration. Its predictions are not a medical diagnosis. Symptoms can have many possible causes. Please consult a qualified healthcare professional for proper evaluation, diagnosis, and treatment. If you experience severe or rapidly worsening symptoms, seek urgent medical care.";

export const DISEASE_GUIDANCE: Readonly<Record<string, DiseaseGuidance>> = {
  "Common Cold": {
    consult: ["General Physician / Primary Care Doctor"],
    beginner:
      "A common cold is a mild viral infection of the upper airways. The symptoms you reported — typically a runny or congested nose, sneezing, and a sore throat — match the pattern the model learned for the common cold. Most colds clear up on their own with rest and fluids, but if symptoms last beyond about ten days or become worse, discussing them with a doctor is a sensible next step.",
    questions: [
      "Could my symptoms be something other than a cold, such as flu or COVID-19?",
      "When should I worry if my symptoms are not improving?",
      "Are there over-the-counter options that might help, and how do I use them safely?",
    ],
  },
  Influenza: {
    consult: ["General Physician / Primary Care Doctor"],
    beginner:
      "Influenza (the flu) is a viral respiratory infection that typically arrives with fever, body aches, fatigue, and a cough — the combination you selected. The model's strongest match was influenza. Flu usually improves within one to two weeks, but young children, older adults, and people with chronic conditions deserve extra attention, so a check-in with a doctor is worthwhile.",
    questions: [
      "Should I be tested for flu, and how would that change what I do?",
      "Who in my household is most at risk of complications?",
      "When do flu symptoms become serious enough for urgent care?",
    ],
  },
  Migraine: {
    consult: [
      "General Physician",
      "Neurologist — if symptoms are recurrent or severe",
    ],
    beginner:
      "Migraine is a neurological condition that commonly involves a throbbing headache, nausea, and sensitivity to light or changes in vision — the features you reported. The model matched your selection to its migraine pattern. If headaches recur often, interfere with daily life, or are severe, a neurologist can help evaluate them.",
    questions: [
      "Could my headaches be tension-type or sinus headaches instead?",
      "What patterns or triggers should I track before my next visit?",
      "When are headaches a sign of something more serious?",
    ],
  },
  Allergy: {
    consult: [
      "General Physician",
      "Allergist/Immunologist — when appropriate",
    ],
    beginner:
      "Allergies happen when the immune system overreacts to harmless substances, producing sneezing, a runny or congested nose, and itchy or watery eyes — the symptoms you selected. The model's strongest match was allergy. Identifying potential triggers and managing exposure is usually the first step; an allergist can help when triggers are unclear.",
    questions: [
      "How can I identify what I might be allergic to?",
      "Would allergy testing be useful in my case?",
      "What can I do to reduce symptoms around common triggers?",
    ],
  },
  Gastroenteritis: {
    consult: ["General Physician / Primary Care Doctor"],
    beginner:
      "Gastroenteritis is inflammation of the stomach and intestines, usually caused by a virus, with diarrhea, vomiting, nausea, and abdominal pain — exactly the symptoms you reported. It typically passes within a few days, and staying hydrated matters most. See a doctor if symptoms are severe, last longer than a few days, or you cannot keep fluids down.",
    questions: [
      "How do I prevent dehydration, and when is it a concern?",
      "When are stomach symptoms serious enough for a doctor visit?",
      "Could something I ate have caused this, and should others in my household be careful?",
    ],
    warningSigns: [
      "Inability to keep any fluids down",
      "Signs of dehydration (very dry mouth, little or no urination, dizziness)",
      "Blood in vomit or stool",
      "High fever that does not respond to usual care",
    ],
  },
  Bronchitis: {
    consult: [
      "General Physician",
      "Pulmonologist — if persistent or severe",
    ],
    beginner:
      "Bronchitis is inflammation of the bronchial tubes that causes a persistent cough, often with wheezing or chest discomfort — the symptoms your selection matched. Acute bronchitis often clears on its own, but a cough that lingers beyond a few weeks, or one accompanied by breathing trouble, warrants a medical check-up.",
    questions: [
      "How long should I expect this cough to last before it is concerning?",
      "Do I need a breathing or chest evaluation?",
      "What could make the cough worse, and how can I protect my airways?",
    ],
    warningSigns: [
      "Cough that worsens or produces blood",
      "Worsening shortness of breath",
      "High fever lasting more than a few days",
    ],
  },
  Pneumonia: {
    consult: [
      "Doctor / General Physician",
      "Urgent medical evaluation may be appropriate depending on symptoms",
    ],
    beginner:
      "Pneumonia is a lung infection that can cause fever, cough, shortness of breath, and chest pain — the pattern your selection matches. Because pneumonia can become serious, medical evaluation is recommended, especially if you have difficulty breathing, a high fever, or other warning signs.",
    questions: [
      "Do I need any tests, such as a chest X-ray, to confirm what is going on?",
      "How should I monitor my breathing at home?",
      "Who is most at risk in my situation, and what should I watch for?",
    ],
    warningSigns: [
      "Difficulty breathing or rapid breathing",
      "Chest pain that worsens or makes breathing hard",
      "Lips or face turning blue or gray",
      "Confusion or unusual drowsiness (especially in older adults)",
    ],
  },
  Dengue: {
    consult: ["General Physician / Internal Medicine"],
    beginner:
      "Dengue is a mosquito-borne viral infection marked by high fever, severe headache, pain behind the eyes, joint and muscle aches, and sometimes a rash — matching your selected symptoms. Most people recover with rest and fluids, but dengue needs monitoring because a small number of cases develop serious complications.",
    questions: [
      "Should I have blood tests to confirm dengue or rule out similar infections?",
      "What warning signs should prompt me to return to care immediately?",
      "How can I avoid mosquito bites while I recover?",
    ],
    warningSigns: [
      "Severe abdominal pain or persistent vomiting",
      "Bleeding gums, nosebleeds, or blood in vomit or stool",
      "Extreme drowsiness, restlessness, or irritability",
      "A sudden drop in fever followed by worsening symptoms",
    ],
  },
  Malaria: {
    consult: ["General Physician / Internal Medicine"],
    beginner:
      "Malaria is a mosquito-borne infection that classically causes fever, chills, sweating, headache, and body aches — the pattern your symptoms match. It can progress quickly, so prompt medical evaluation is important, particularly if you have recently traveled to an area where malaria is present.",
    questions: [
      "Should I be tested for malaria, especially if I have traveled recently?",
      "What complications should I watch for, and how soon should I act?",
      "What should I do if my fever returns after initial treatment?",
    ],
    warningSigns: [
      "Confusion or drowsiness",
      "Difficulty breathing",
      "Dark or reduced urine",
      "Repeated vomiting that prevents keeping fluids or medicine down",
    ],
  },
  Typhoid: {
    consult: ["General Physician / Internal Medicine"],
    beginner:
      "Typhoid is a bacterial infection usually acquired through contaminated food or water, with sustained fever, headache, weakness, abdominal discomfort, and loss of appetite — the pattern your selection matched. It requires medical evaluation, often with laboratory testing, and should not be self-managed.",
    questions: [
      "What tests can confirm or rule out typhoid?",
      "How is it treated, and how long before I feel better?",
      "What hygiene steps protect the people around me?",
    ],
    warningSigns: [
      "Persistent high fever",
      "Severe abdominal pain or swelling",
      "Confusion or unusual behavior",
      "Bleeding in the stool",
    ],
  },
  Diabetes: {
    consult: [
      "General Physician",
      "Endocrinologist — for ongoing management",
    ],
    beginner:
      "Diabetes is a metabolic condition in which the body has trouble regulating blood sugar. Excessive thirst, frequent urination, fatigue, and unexplained weight loss — the symptoms you selected — are classic signs the model learned to associate with diabetes. These deserve a blood-sugar evaluation by a healthcare professional.",
    questions: [
      "What blood tests would confirm or rule this out, and do I need to fast?",
      "How should I monitor my blood sugar if testing is recommended?",
      "What lifestyle changes are most important while we investigate?",
    ],
    warningSigns: [
      "Very high blood sugar readings if you have a monitor",
      "Extreme thirst with frequent urination and severe fatigue",
      "Nausea, vomiting, or fruity-smelling breath",
      "Confusion or difficulty waking",
    ],
  },
  Hypertension: {
    consult: [
      "General Physician",
      "Cardiologist — when appropriate",
    ],
    beginner:
      "Hypertension means persistently elevated blood pressure. It often causes no symptoms at all, but it can be associated with headaches and dizziness — the features you selected. Blood pressure needs to be measured properly over time, so talking to a doctor about monitoring it is the right next step.",
    questions: [
      "How should I measure my blood pressure at home, and how often?",
      "What readings should prompt me to call your office?",
      "What lifestyle factors could be contributing, and which matter most?",
    ],
    warningSigns: [
      "A very high reading with severe headache, chest pain, or vision changes",
      "Shortness of breath",
      "Numbness or weakness on one side of the body",
    ],
  },
  Asthma: {
    consult: ["General Physician", "Pulmonologist"],
    beginner:
      "Asthma is a chronic condition in which the airways narrow, causing wheezing, shortness of breath, and coughing — the pattern your symptoms matched. A proper evaluation, including breathing tests, helps determine whether asthma — or something similar — explains your symptoms.",
    questions: [
      "What breathing tests would help evaluate this?",
      "What triggers commonly provoke symptoms, and how can I identify mine?",
      "What should I do when symptoms flare up between visits?",
    ],
    warningSigns: [
      "Difficulty speaking in full sentences due to breathlessness",
      "Wheezing that gets worse or does not respond to usual relief",
      "Chest tightness with rapid breathing",
      "Lips or fingernails turning blue or gray",
    ],
  },
  Tuberculosis: {
    consult: ["Pulmonologist / Infectious Disease specialist"],
    beginner:
      "Tuberculosis (TB) is a bacterial infection, most often of the lungs, that can cause a persistent cough, fever, night sweats, fatigue, and weight loss — the pattern your selection matches. TB requires formal medical evaluation and testing; it is not something to self-manage.",
    questions: [
      "What tests can evaluate this, and how do they work?",
      "How contagious is this condition, and what should my contacts know?",
      "How long does treatment typically take, and why is completing it important?",
    ],
    warningSigns: [
      "Coughing up blood",
      "Chest pain with breathing",
      "Severe weight loss or persistent high fever",
    ],
  },
  "COVID-19": {
    consult: ["General Physician / appropriate healthcare service"],
    beginner:
      "COVID-19 is a viral respiratory illness that can cause fever, cough, fatigue, and loss of smell or taste — the combination you selected. Symptoms vary widely and overlap with other respiratory infections, so testing and a healthcare professional's assessment are the right next steps.",
    questions: [
      "Should I take a test, and what does a positive or negative result mean for me?",
      "How long should I isolate or take precautions?",
      "Who in my household should be particularly careful?",
    ],
    warningSigns: [
      "Difficulty breathing or persistent chest pain",
      "Confusion or difficulty waking",
      "Lips or face turning blue or gray",
      "Inability to stay hydrated or worsening symptoms after initial improvement",
    ],
  },
};

/** Fallback guidance for classes not in the curated map. */
export const DEFAULT_GUIDANCE: DiseaseGuidance = {
  consult: ["General Physician / Primary Care Doctor"],
  beginner:
    "The model matched the symptoms you selected to this condition's learned pattern. Remember this is a possible prediction, not a diagnosis — discuss your symptoms with a healthcare professional, especially if they persist, worsen, or worry you.",
  questions: [],
  warningSigns: [],
};

export function getGuidance(disease: string): DiseaseGuidance {
  return DISEASE_GUIDANCE[disease] ?? DEFAULT_GUIDANCE;
}
