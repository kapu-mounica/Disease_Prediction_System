import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  HelpCircle,
  ListChecks,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Corners } from "@/components/vintage";
import { ConfidenceGauge } from "@/components/ConfidenceGauge";
import { SYMPTOM_CATALOG } from "@/convex/ml/catalog";
import {
  EMERGENCY_WARNING_SIGNS,
  FINAL_DISCLAIMER,
  GENERAL_QUESTIONS,
  getGuidance,
} from "@/convex/ml/guidance";
import type { ModelInfo, PredictionResult } from "@/convex/ml/types";
import { formatTimestamp, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "3px",
  fontSize: "0.8125rem",
  color: "var(--foreground)",
};

const STEPS = [
  "Assessment",
  "Summary",
  "Consultation",
  "Explainable AI",
  "Next Steps",
  "Safety",
];

function labelFor(symptomId: string): string {
  return SYMPTOM_CATALOG.find((s) => s.id === symptomId)?.label ?? symptomId;
}

function SectionCard({
  index,
  icon: Icon,
  title,
  children,
  className,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("paper-card relative p-6 sm:p-8", className)}>
      <Corners />
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent/60 text-accent">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="archival-label">Section {index}</p>
          <h3 className="font-display text-xl font-semibold">{title}</h3>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/** Horizontal importance/confidence bar row. */
function BarRow({
  label,
  value,
  max,
  display,
  title,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  title?: string;
}) {
  const width = max > 0 ? Math.max(2, (Math.abs(value) / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3" title={title}>
      <span className="w-32 shrink-0 truncate text-sm sm:w-40">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className={cn(
            "h-full rounded-full",
            value >= 0 ? "bg-accent/80" : "bg-muted-foreground/60",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-accent">
        {display}
      </span>
    </div>
  );
}

export function PredictionReport({
  result,
  modelInfo,
  selectedLabels,
  onReset,
}: {
  result: PredictionResult;
  modelInfo: ModelInfo | undefined;
  selectedLabels: Map<string, string>;
  onReset: () => void;
}) {
  const guidance = getGuidance(result.predicted_disease);
  const [first, second] = result.top_predictions;

  const maxImpact = useMemo(
    () =>
      Math.max(
        ...result.contributions.map((c) => Math.abs(c.impact)),
        0.0001,
      ),
    [result.contributions],
  );

  const topContributions = result.contributions.slice(0, 5);

  const featureImportanceData = useMemo(() => {
    const importance = modelInfo?.featureImportance ?? [];
    return importance
      .slice(0, 8)
      .map((f) => ({ label: labelFor(f.feature), importance: f.importance }));
  }, [modelInfo]);

  const maxFeatureImportance = useMemo(
    () =>
      Math.max(
        ...featureImportanceData.map((f) => f.importance),
        0.0001,
      ),
    [featureImportanceData],
  );

  const probabilityData = useMemo(
    () =>
      [...result.probabilities]
        .sort((a, b) => b.probability - a.probability)
        .filter((p) => p.probability > 0),
    [result.probabilities],
  );

  const consultedSymptoms = result.selected_symptoms.map(
    (id) => selectedLabels.get(id) ?? labelFor(id),
  );

  const questions = useMemo(() => {
    const seen = new Set<string>();
    return [...guidance.questions, ...GENERAL_QUESTIONS].filter((q) => {
      if (seen.has(q)) return false;
      seen.add(q);
      return true;
    });
  }, [guidance.questions]);

  const warningSigns = useMemo(
    () => [...EMERGENCY_WARNING_SIGNS, ...(guidance.warningSigns ?? [])],
    [guidance.warningSigns],
  );

  const advancedStats = [
    ["Model type", modelInfo?.algorithm ?? "Random Forest"],
    ["Supported diseases", modelInfo ? String(modelInfo.nDiseases) : "—"],
    ["Symptom features", modelInfo ? String(modelInfo.nSymptoms) : "—"],
    ["Ensemble trees", modelInfo ? String(modelInfo.params.nEstimators) : "—"],
    ["Training samples", modelInfo ? String(modelInfo.trainSamples) : "—"],
    ["Testing samples", modelInfo ? String(modelInfo.testSamples) : "—"],
    ["Accuracy", modelInfo ? pct(modelInfo.accuracy) : "—"],
    ["Precision (macro)", modelInfo ? pct(modelInfo.precision) : "—"],
    ["Recall (macro)", modelInfo ? pct(modelInfo.recall) : "—"],
    ["F1 Score (macro)", modelInfo ? pct(modelInfo.f1) : "—"],
  ];

  return (
    <div className="space-y-8">
      {/* ── Record header + progressive steps ─────────────────── */}
      <div className="paper-card relative px-6 py-7 sm:px-10">
        <Corners />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="archival-label">Prediction Record</p>
          <p className="text-xs tabular-nums text-muted-foreground">
            Filed {formatTimestamp(result.timestamp)}
          </p>
        </div>
        <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Understanding your result">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-[3px] border border-foreground/25 bg-background px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-foreground/80">
                <span className="tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                {" "}{step}
              </span>
              {i < STEPS.length - 1 && (
                <ArrowRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* ── 01 Prediction Summary ─────────────────────────────── */}
      <SectionCard index="01" icon={Stethoscope} title="Prediction Summary">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="archival-label">Possible condition</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {result.predicted_disease}
            </h2>
            <p className="mt-2 text-sm italic text-muted-foreground">
              A <em>possible</em> prediction, not a diagnosis — the model's
              strongest match for the symptoms you reported.
            </p>
            <div className="mt-5 max-w-md">
              <ConfidenceGauge value={result.confidence} size="lg" />
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
              Model-estimated probability: the share of the{" "}
              {modelInfo?.params.nEstimators ?? "trained"}-tree ensemble that
              voted for this class. It is a model statistic, not a statement of
              medical certainty.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="archival-label">Other possible predictions</p>
              <ol className="mt-3 space-y-3">
                {[second, result.top_predictions[2]]
                  .filter(Boolean)
                  .map((alt, i) => (
                    <li key={alt!.disease} className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-foreground/30 font-display text-xs font-bold text-muted-foreground">
                        {i + 2}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
                        {alt!.disease}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-accent">
                        {pct(alt!.confidence)}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
            <div>
              <p className="archival-label">Symptoms considered</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {consultedSymptoms.map((label) => (
                  <span
                    key={label}
                    className="rounded-[3px] border border-foreground/25 bg-background px-2 py-0.5 text-xs"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 02 Who Should I Consult? ──────────────────────────── */}
      <SectionCard index="02" icon={UserRound} title="Who Should I Consult?">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Consider discussing your symptoms with:
        </p>
        <ul className="mt-4 space-y-2.5">
          {guidance.consult.map((role) => (
            <li
              key={role}
              className="flex items-start gap-3 rounded-[3px] border border-foreground/20 bg-background px-4 py-3"
            >
              <UserRound className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="font-display text-base font-semibold">{role}</span>
            </li>
          ))}
        </ul>
        {guidance.consultNote && (
          <p className="mt-4 flex items-start gap-2 rounded-[3px] border border-accent/40 bg-accent/5 px-4 py-3 text-sm leading-relaxed">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
            {guidance.consultNote}
          </p>
        )}
        <p className="mt-4 text-xs italic text-muted-foreground">
          These are general suggestions to help you choose who to talk to — not
          mandatory referrals, and not a substitute for a healthcare
          professional's judgment.
        </p>
      </SectionCard>

      {/* ── 03 Why did the model predict this? ────────────────── */}
      <SectionCard index="03" icon={Brain} title="Why did the model predict this?">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The model encoded your{" "}
          {result.selected_symptoms.length > 1
            ? `${result.selected_symptoms.length} symptoms`
            : "symptom"}{" "}
          into a 32-feature vector, ran it through the trained forest, and
          ranked the 15 supported conditions by match strength. The two views
          below show what drove the prediction.
        </p>

        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="archival-label">Symptoms that most influenced this prediction</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Impact = how much the model's confidence in{" "}
              <em>{result.predicted_disease}</em> would drop if you had not
              reported the symptom (leave-one-out analysis over the ensemble).
            </p>
            <div className="mt-4 space-y-3">
              {topContributions.map((c, i) => (
                <BarRow
                  key={c.symptom}
                  label={selectedLabels.get(c.symptom) ?? labelFor(c.symptom)}
                  value={c.impact}
                  max={maxImpact}
                  display={`${c.impact >= 0 ? "+" : ""}${(c.impact * 100).toFixed(1)} pts`}
                  title={`Removing "${c.symptom}" changes the confidence by ${(c.impact * 100).toFixed(1)} percentage points`}
                  // Stagger the bars slightly.
                />
              ))}
            </div>
          </div>

          <div>
            <p className="archival-label">Global feature importance (Random Forest)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Gini importance learned during training, across the whole forest —
              the features the model relies on most overall.
            </p>
            {featureImportanceData.length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={featureImportanceData}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, maxFeatureImportance]}
                      tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={140}
                      tick={{ fontSize: 12, fill: "var(--foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "color-mix(in oklab, var(--accent) 8%, transparent)" }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value: number | string) => [
                        `${(Number(value) * 100).toFixed(1)}%`,
                        "Importance",
                      ]}
                    />
                    <Bar dataKey="importance" radius={[0, 2, 2, 0]} fill="var(--accent)" maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-sm italic text-muted-foreground">
                Global feature importance is unavailable right now — the model
                metadata has not loaded.
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-[3px] border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs leading-relaxed">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          Feature importance describes how the model weighs symptoms in its
          decision. It does <strong>not</strong> mean a symptom medically causes
          the predicted disease — cause is determined by a healthcare
          professional, not by a machine-learning model.
        </p>
      </SectionCard>

      {/* ── 04 Next Steps ─────────────────────────────────────── */}
      <SectionCard index="04" icon={ListChecks} title="Next Steps">
        <Tabs defaultValue="beginner" className="gap-4">
          <TabsList className="w-full justify-start rounded-[3px] border border-foreground/20 bg-muted/60 p-1 sm:w-fit">
            <TabsTrigger value="beginner" className="rounded-[3px] data-[state=active]:border-accent/50 data-[state=active]:bg-card">
              Beginner
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="rounded-[3px] data-[state=active]:border-accent/50 data-[state=active]:bg-card">
              Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-[3px] data-[state=active]:border-accent/50 data-[state=active]:bg-card">
              Advanced Analysis
            </TabsTrigger>
          </TabsList>

          {/* Beginner */}
          <TabsContent value="beginner" className="space-y-5">
            <div>
              <p className="archival-label">What the prediction means</p>
              <p className="mt-2 text-sm leading-relaxed">{guidance.beginner}</p>
            </div>
            <div>
              <p className="archival-label">Why the system produced this prediction</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The system compared your selection against the patterns it
                learned from its training dataset and ranked the 15 conditions
                by how closely their symptom signatures match.{" "}
                <strong>{result.predicted_disease}</strong> was the strongest
                match; the runners-up are listed in the summary above.
              </p>
            </div>
            <div>
              <p className="archival-label">Which type of doctor may be appropriate</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {guidance.consult.join("; ")}. Consider discussing your
                symptoms with one of them.
              </p>
            </div>
            <div>
              <p className="archival-label">When to seek professional advice</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If your symptoms persist, worsen, or cause concern — or if you
                notice any of the warning signs listed in the Safety section
                below — contact a healthcare professional promptly.
              </p>
            </div>
          </TabsContent>

          {/* Intermediate */}
          <TabsContent value="intermediate" className="space-y-5">
            <div>
              <p className="archival-label">Top 3 predicted conditions</p>
              <div className="mt-3 space-y-3">
                {result.top_predictions.map((top, i) => (
                  <div key={top.disease} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-bold",
                        i === 0
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-foreground/30 text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-display text-base font-semibold">
                          {top.disease}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-accent">
                          {pct(top.confidence)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                        <motion.div
                          className="h-full rounded-full bg-accent/80"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(top.confidence / (first?.confidence || 1)) * 100}%`,
                          }}
                          transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="archival-label">Most important selected symptoms</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {topContributions.length > 0
                  ? topContributions
                      .slice(0, 3)
                      .map((c) => selectedLabels.get(c.symptom) ?? labelFor(c.symptom))
                      .join(", ")
                  : "—"}{" "}
                — removing these from your selection changes the prediction the
                most (see the Explainable AI section above).
              </p>
            </div>
            <div>
              <p className="archival-label">Model explanation</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A Random Forest runs your symptom vector through{" "}
                {modelInfo?.params.nEstimators ?? "60"} decision trees; each
                tree votes for one of the 15 conditions, and the reported
                confidence is the share of votes for each class. No single tree
                decides — the ensemble averages their votes.
              </p>
            </div>
            <div>
              <p className="archival-label">Possible alternative predictions</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {[second, result.top_predictions[2]]
                  .filter(Boolean)
                  .map((alt) => alt!.disease)
                  .join(" and ") || "None"} ranked close behind because their
                learned symptom patterns overlap with the symptoms you
                reported. Discuss the full picture — not just the top match —
                with a healthcare professional.
              </p>
            </div>
            <div>
              <p className="archival-label">Questions you may want to ask a doctor</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A ready-made list is in the "Questions You Can Ask Your Doctor"
                section below — bring it to your visit.
              </p>
            </div>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6">
            <p className="text-xs italic text-muted-foreground">
              Advanced analysis — model configuration, evaluation and
              explainability details for technically minded readers. Hidden by
              default so beginners are not overwhelmed.
            </p>

            <div>
              <p className="archival-label">Model information</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {advancedStats.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-3 border-b border-dotted border-foreground/20 pb-1"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-display font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="archival-label">Prediction probabilities (all classes)</p>
              <div className="mt-3 space-y-2.5">
                {probabilityData.map((p) => (
                  <BarRow
                    key={p.disease}
                    label={p.disease}
                    value={p.probability}
                    max={probabilityData[0]?.probability ?? 1}
                    display={pct(p.probability)}
                  />
                ))}
                <p className="text-xs text-muted-foreground">
                  {result.probabilities.length - probabilityData.length} remaining
                  classes received no votes and are omitted.
                </p>
              </div>
            </div>

            <div>
              <p className="archival-label">Dataset</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {modelInfo
                  ? `Trained on ${modelInfo.dataset.totalInstances} binary instances (${modelInfo.dataset.instancesPerDisease} per disease) sampled from a documented conditional-probability table with ±${(modelInfo.dataset.noise * 100).toFixed(0)}% seeded noise. Split ${modelInfo.trainSamples}/${modelInfo.testSamples} train/test.`
                  : "Dataset metadata is unavailable right now."}
              </p>
            </div>

            <div>
              <p className="archival-label">Model limitations</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>Synthetic educational data, not clinical records — real-world accuracy would differ.</li>
                <li>Only the 15 listed conditions and 32 binary symptoms; no severity, duration, age or history.</li>
                <li>Confidence is an ensemble statistic, not a probability of disease.</li>
                <li>Comorbidities and rare presentations are out of scope.</li>
                <li>Not a diagnostic tool — never use it to guide treatment.</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </SectionCard>

      {/* ── 05 Questions You Can Ask Your Doctor ──────────────── */}
      <SectionCard index="05" icon={HelpCircle} title="Questions You Can Ask Your Doctor">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A general starting list for your next conversation. Write down the
          ones that matter to you — and your own follow-ups.
        </p>
        <ul className="mt-4 space-y-2.5">
          {questions.map((q, i) => (
            <li
              key={q}
              className="flex items-start gap-3 rounded-[3px] border border-foreground/20 bg-background px-4 py-2.5 text-sm leading-relaxed"
            >
              <span className="mt-0.5 font-display text-xs font-bold tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs italic text-muted-foreground">
          This list contains general questions only. This application never
          suggests prescriptions or medication dosages.
        </p>
      </SectionCard>

      {/* ── 06 Warning Signs ──────────────────────────────────── */}
      <div className="paper-card relative border-destructive/50 p-6 sm:p-8">
        <Corners />
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-destructive/60 text-destructive">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <p className="archival-label text-destructive">Section 06 — Safety</p>
            <h3 className="font-display text-xl font-semibold">Warning Signs</h3>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed">
          If you or someone you are helping experiences any of the following,
          <strong> seek emergency medical care immediately</strong>:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {warningSigns.map((sign) => (
            <li
              key={sign}
              className="flex items-start gap-2.5 rounded-[3px] border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm leading-relaxed"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>{sign}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs italic text-muted-foreground">
          Contact your local emergency services. This application does not
          provide country-specific emergency numbers.
        </p>
      </div>

      {/* ── Final disclaimer ──────────────────────────────────── */}
      <div className="rounded-[3px] border border-destructive/50 bg-destructive/5 px-5 py-4" role="note">
        <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Final Disclaimer
        </p>
        <p className="mt-2 leading-relaxed">{FINAL_DISCLAIMER}</p>
      </div>

      {/* ── Footer actions ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-foreground/15 pt-5">
        <p className="flex items-center gap-2 text-xs italic text-muted-foreground">
          <Stethoscope className="size-4" />
          A preliminary machine-learning prediction — not a diagnosis.
        </p>
        <Button
          variant="outline"
          className="btn-editorial rounded-[3px]"
          onClick={onReset}
        >
          Predict Again
        </Button>
      </div>
    </div>
  );
}
