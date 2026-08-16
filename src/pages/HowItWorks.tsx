import { motion } from "framer-motion";
import {
  Activity,
  Binary,
  Database,
  FileSpreadsheet,
  Gauge,
  ListChecks,
  TreePine,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";

const STEPS = [
  {
    icon: UserRound,
    title: "User Symptoms",
    body: "You select the symptoms you have observed from the 32-feature symptom index. Each selection maps to one binary input feature.",
  },
  {
    icon: ListChecks,
    title: "Data Preprocessing",
    body: "The server validates the request — at least one symptom, every name known to the catalog — and normalizes each name (trimmed, lower-cased, underscored).",
  },
  {
    icon: Binary,
    title: "Feature Encoding",
    body: "The selected symptoms are encoded into the model's feature vector: a 1 for every symptom present, 0 for every symptom absent, in the exact column order the forest was trained on.",
  },
  {
    icon: TreePine,
    title: "Random Forest Model",
    body: "The feature vector is pushed through 60 decision trees. Each tree routes the vector along its learned splits and votes for one of the fifteen classes.",
  },
  {
    icon: Activity,
    title: "Disease Prediction",
    body: "The ensemble's votes are tallied. The class with the most votes becomes the predicted disease; the next two become the runners-up.",
  },
  {
    icon: Gauge,
    title: "Confidence Score",
    body: "Confidence is the fraction of trees that voted for each class — an honest, explainable model statistic, never a claim of medical certainty.",
  },
];

const UNDER_THE_HOOD = [
  {
    icon: Database,
    title: "The dataset",
    body: "dataset/disease_symptoms.csv is a documented conditional-probability table: for each of the 15 diseases it records the probability of each of the 32 symptoms. The training pipeline expands it into 4,500 binary instances (300 per disease) by sampling each symptom with its documented probability plus a small, seeded noise term. Labels are never randomized — every instance is generated from its own disease's ground truth.",
  },
  {
    icon: FileSpreadsheet,
    title: "Training",
    body: "The pipeline validates the table, normalizes names, encodes features, performs a stratified 80/20 split, and trains the forest (Gini impurity, sqrt feature subsampling, bootstrap bagging, seeded for reproducibility). Run it yourself with bun run ml:train.",
  },
  {
    icon: TreePine,
    title: "Evaluation",
    body: "The held-out test set (never seen during training) is scored for accuracy, macro precision, recall, F1 and a full 15×15 confusion matrix. The reported numbers on the Model Information page are these genuine holdout results.",
  },
  {
    icon: Activity,
    title: "Inference & validation",
    body: "Prediction runs server-side: empty selections, unknown symptoms and malformed input are rejected with clear messages before the model is ever invoked. The same inference path is covered by the test suite (bun run ml:test).",
  },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        index="03"
        label="How It Works"
        title="The prediction pipeline"
        description="Six stages carry a symptom selection from your screen to a confidence score. Every stage is inspectable in the repository."
      />

      {/* Pipeline */}
      <ol className="mt-12 space-y-0">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="paper-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7"
            >
              <div className="flex items-center gap-4 sm:w-56 sm:shrink-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-accent/60 text-accent">
                  <step.icon className="size-5" />
                </span>
                <div>
                  <p className="archival-label">Stage {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:flex-1 sm:border-l sm:border-dashed sm:border-foreground/20 sm:pl-6">
                {step.body}
              </p>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="mx-auto flex h-8 w-px justify-center bg-foreground/25" aria-hidden="true">
                <span className="-mt-1 text-xs leading-none text-foreground/40">↓</span>
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* Under the hood */}
      <div className="mt-16">
        <SectionHeading
          index="04"
          label="Under the Hood"
          title="How the model was built"
          description="No placeholder logic anywhere — the dataset, training, evaluation and inference are all real and reproducible."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {UNDER_THE_HOOD.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="paper-card p-6"
            >
              <div className="flex items-center gap-3">
                <card.icon className="size-5 text-accent" />
                <h3 className="font-display text-lg font-semibold">{card.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Disclaimer className="max-w-2xl flex-1" compact />
        <Button asChild className="btn-editorial shrink-0 rounded-[3px]">
          <Link to="/predict">Try a prediction</Link>
        </Button>
      </div>
    </div>
  );
}
