import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Gauge, ScanSearch, Stethoscope, TreePine, Zap, WifiOff } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Corners, Ornament, SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";
import { useBootTimeout } from "@/hooks/use-boot-timeout";
import { pct } from "@/lib/format";

const FEATURES = [
  {
    icon: TreePine,
    title: "Machine Learning",
    body: "A Random Forest ensemble of 60 decision trees, trained on a documented disease–symptom dataset with a real evaluation holdout.",
  },
  {
    icon: ScanSearch,
    title: "Symptom Analysis",
    body: "Search and select from 32 symptom features organized into clinical categories — exactly as they feed the model's feature vector.",
  },
  {
    icon: Gauge,
    title: "Confidence Score",
    body: "Every prediction reports the ensemble's agreement as a transparent confidence value, alongside the top 3 candidate conditions.",
  },
  {
    icon: Zap,
    title: "Fast Prediction",
    body: "Inference runs server-side and returns in a fraction of a second — select symptoms, press predict, read the result.",
  },
];

const SAMPLE_STEPS = [
  { n: "I", title: "Select symptoms", body: "Choose from 32 curated symptom features." },
  { n: "II", title: "Model infers", body: "The Random Forest votes across 60 trees." },
  { n: "III", title: "Review the record", body: "Top 3 conditions with confidence scores." },
];

export default function Landing() {
  const modelInfo = useQuery(api.modelInfo.getModelInfo);
  const bootTimedOut = useBootTimeout(12000);
  const backendDown = modelInfo === undefined && bootTimedOut;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="archival-label">
              No. 01 — A Machine-Learning Demonstration · Est. MMXXVI
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              AI-Powered <em className="text-accent">Disease</em> Prediction
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Machine Learning Based Preliminary Health Risk Assessment — select
              the symptoms you observe and let a trained Random Forest model
              weigh them against fifteen supported conditions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="btn-editorial rounded-[3px] px-7">
                <Link to="/predict">
                  Start Prediction <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-editorial rounded-[3px] px-7">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
            <p className="mt-6 max-w-md text-sm italic text-muted-foreground">
              Educational demonstration — results are not medical advice.
            </p>
          </motion.div>

          {/* Conditions Index plate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <Corners />
            <div className="paper-card relative px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between border-b border-foreground/20 pb-3">
                <p className="font-display text-lg font-semibold">Conditions Index</p>
                <p className="archival-label">15 entries</p>
              </div>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {[
                  "Common Cold", "Influenza", "Migraine", "Allergy",
                  "Gastroenteritis", "Bronchitis", "Pneumonia", "Dengue",
                  "Malaria", "Typhoid", "Diabetes", "Hypertension",
                  "Asthma", "Tuberculosis", "COVID-19",
                ].map((disease, i) => (
                  <li
                    key={disease}
                    className="flex items-baseline gap-2 border-b border-dotted border-foreground/20 pb-1 text-[0.95rem]"
                  >
                    <span className="font-display text-xs tabular-nums text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{disease}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs italic text-muted-foreground">
                The model's complete differential index — all fifteen classes it
                was trained to recognize.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Backend status / model snapshot ──────────────────── */}
      <section className="border-y border-foreground/15 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {backendDown ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-3">
                <WifiOff className="size-5 text-destructive" />
                <p className="text-sm">
                  The prediction service is unreachable right now. Please
                  reload shortly — the model cannot run without it.
                </p>
              </div>
              <Button variant="outline" size="sm" className="btn-editorial" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: "Supported diseases", value: modelInfo ? String(modelInfo.nDiseases) : "—" },
                { label: "Symptom features", value: modelInfo ? String(modelInfo.nSymptoms) : "—" },
                { label: "Ensemble trees", value: modelInfo ? String(modelInfo.params.nEstimators) : "—" },
                { label: "Test accuracy", value: modelInfo ? pct(modelInfo.accuracy) : "…" },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <dt className="archival-label">{stat.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          index="02"
          label="Capabilities"
          title="What the system provides"
          description="Every part of the pipeline — data, training, inference and evaluation — is real and inspectable."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="paper-card group p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex size-11 items-center justify-center rounded-[3px] border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-card">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works teaser ───────────────────────────────── */}
      <section className="border-y border-foreground/15 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                index="03"
                label="The pipeline"
                title="From symptoms to a confidence score"
                description="The browser never computes predictions. Symptoms are validated, encoded and scored by the trained model running server-side."
              />
              <Button asChild variant="outline" className="btn-editorial mt-6 rounded-[3px]">
                <Link to="/how-it-works">
                  See the full pipeline <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <ol className="space-y-4">
              {SAMPLE_STEPS.map((step) => (
                <li key={step.n} className="paper-card flex items-start gap-5 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent/60 font-display text-sm font-bold text-accent">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Ornament className="mb-8" />
        <Disclaimer />
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="paper-card relative overflow-hidden px-6 py-12 text-center sm:px-12">
          <Corners />
          <p className="archival-label">No. 04 — Consultation</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Consult the model with your symptom record
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Select the symptoms you have observed and receive an immediate,
            explainable preliminary assessment with confidence scores.
          </p>
          <Button asChild size="lg" className="btn-editorial mt-8 rounded-[3px] px-8">
            <Link to="/predict">
              Start Prediction <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
