import {
  Activity,
  Binary,
  Braces,
  FlaskConical,
  Github,
  Server,
  ShieldAlert,
  Table2,
  TreePine,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Corners, Ornament, SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";

const OBJECTIVES = [
  "Build a complete, working symptom-based disease prediction system end to end.",
  "Train a real Random Forest classifier on a documented, internally consistent demonstration dataset.",
  "Serve predictions through a real backend API with input validation and clear error handling.",
  "Present the model's configuration, genuine holdout metrics and confusion matrix transparently.",
  "Demonstrate a professional, production-shaped architecture suitable for a final-year or portfolio project.",
];

const STACK = [
  { icon: Braces, name: "React + TypeScript", role: "Frontend application" },
  { icon: Server, name: "Convex (TypeScript) backend", role: "Symptom catalog, model info & prediction API" },
  { icon: FlaskConical, name: "Python + FastAPI (reference)", role: "Equivalent REST backend for local execution" },
  { icon: TreePine, name: "scikit-learn / from-scratch Random Forest", role: "Machine learning classifier" },
  { icon: Table2, name: "pandas + numpy (Python) / TS pipeline", role: "Dataset preprocessing & evaluation" },
  { icon: Activity, name: "recharts", role: "Performance & distribution charts" },
];

const LIMITATIONS = [
  "Trained on a synthetic educational dataset, not clinical records — real-world accuracy would differ.",
  "Supports only the 15 listed conditions and 32 symptom features; anything outside the index is out of scope.",
  "Confidence is an ensemble statistic (fraction of trees), not a probability of disease.",
  "Symptoms are entered as binary present/absent — no severity, duration, or medical history is considered.",
  "Not a diagnostic tool, and it must never be treated as one.",
];

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        index="05"
        label="About"
        title="A complete machine-learning demonstration"
        description="AI Disease Predictor is a full-stack symptom-based disease classification system built for educational and portfolio purposes — every layer, from dataset to deployed API, is real and inspectable."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="paper-card relative p-6 sm:p-8">
          <Corners />
          <p className="archival-label">Project Overview</p>
          <p className="mt-4 text-[0.95rem] leading-relaxed">
            The user selects symptoms from a curated index of 32 features; the
            request is validated and encoded server-side; a Random Forest
            ensemble of 60 trees — trained on 4,500 documented demonstration
            instances — returns the most likely of 15 supported conditions
            together with the top 3 candidates and confidence scores.
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed">
            A complete Python/FastAPI + scikit-learn implementation of the same
            system ships in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">backend/</code> for local
            execution, and the live deployment runs the equivalent pipeline on
            a server-side TypeScript runtime.
          </p>
        </div>

        <div className="paper-card p-6 sm:p-8">
          <p className="archival-label">Objectives</p>
          <ul className="mt-4 space-y-3">
            {OBJECTIVES.map((item, i) => (
              <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed">
                <span className="font-display text-sm font-bold tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tech stack */}
      <div className="mt-12">
        <SectionHeading
          index="06"
          label="Technology Stack"
          title="Open-source, free, and reproducible"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item) => (
            <div key={item.name} className="paper-card flex items-start gap-4 p-5">
              <item.icon className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h3 className="font-display text-base font-semibold leading-snug">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="paper-card p-6 sm:p-8">
          <p className="archival-label">Limitations</p>
          <ul className="mt-4 space-y-3">
            {LIMITATIONS.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-5">
          <div className="paper-card p-6 sm:p-8">
            <p className="archival-label">Repository</p>
            <p className="mt-4 flex items-center gap-2 text-sm leading-relaxed">
              <Binary className="size-4 shrink-0 text-accent" />
              The complete source — dataset, training pipeline, backend and
              frontend — lives in the project repository. Clone it, run{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bun run ml:train</code> and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bun run dev</code>, and everything
              runs locally.
            </p>
            <Button asChild variant="outline" className="btn-editorial mt-5 rounded-[3px]">
              <Link to="/model">
                <Github className="size-4" /> Inspect the model record
              </Link>
            </Button>
          </div>
          <Disclaimer />
        </div>
      </div>

      <Ornament className="mt-14" />
    </div>
  );
}
