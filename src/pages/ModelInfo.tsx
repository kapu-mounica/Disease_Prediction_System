import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WifiOff } from "lucide-react";
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
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { Corners, SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";
import { useBootTimeout } from "@/hooks/use-boot-timeout";
import { SYMPTOM_CATALOG } from "@/convex/ml/catalog";
import { pct } from "@/lib/format";

function labelFor(symptomId: string): string {
  return SYMPTOM_CATALOG.find((s) => s.id === symptomId)?.label ?? symptomId;
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "3px",
  fontSize: "0.8125rem",
  color: "var(--foreground)",
};

export default function ModelInfo() {
  const modelInfo = useQuery(api.modelInfo.getModelInfo);
  const bootTimedOut = useBootTimeout(12000);
  const backendDown = modelInfo === undefined && bootTimedOut;

  if (backendDown) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="paper-card flex flex-col items-center gap-4 p-10 text-center">
          <WifiOff className="size-8 text-destructive" />
          <p className="font-display text-xl font-semibold">Model metadata unavailable</p>
          <p className="max-w-md text-sm text-muted-foreground">
            The backend serving the model information cannot be reached right
            now. Please reload shortly.
          </p>
          <Button variant="outline" className="btn-editorial" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    );
  }

  if (modelInfo === undefined) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-16 sm:px-6">
        <div className="h-4 w-40 rounded bg-foreground/10" />
        <div className="mt-3 h-10 w-2/3 rounded bg-foreground/10" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="paper-card h-28" />
          ))}
        </div>
      </div>
    );
  }

  const performanceData = [
    { metric: "Accuracy", value: Number((modelInfo.accuracy * 100).toFixed(1)) },
    { metric: "Precision", value: Number((modelInfo.precision * 100).toFixed(1)) },
    { metric: "Recall", value: Number((modelInfo.recall * 100).toFixed(1)) },
    { metric: "F1 Score", value: Number((modelInfo.f1 * 100).toFixed(1)) },
  ];

  const holdoutData = modelInfo.perClass.map((row) => ({
    disease: row.disease,
    support: row.support,
  }));

  const stats = [
    { label: "Algorithm", value: modelInfo.algorithm },
    { label: "Supported diseases", value: String(modelInfo.nDiseases) },
    { label: "Symptom features", value: String(modelInfo.nSymptoms) },
    { label: "Training samples", value: String(modelInfo.trainSamples) },
    { label: "Testing samples", value: String(modelInfo.testSamples) },
    { label: "Accuracy", value: pct(modelInfo.accuracy) },
    { label: "Precision (macro)", value: pct(modelInfo.precision) },
    { label: "Recall (macro)", value: pct(modelInfo.recall) },
    { label: "F1 Score (macro)", value: pct(modelInfo.f1) },
    { label: "Ensemble trees", value: String(modelInfo.params.nEstimators) },
    { label: "Max tree depth", value: String(modelInfo.params.maxDepth) },
    { label: "Feature subset / split", value: String(modelInfo.params.featureSubsetSize) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        index="04"
        label="Model Information"
        title="The trained model, on record"
        description="The configuration and evaluation metrics of the Random Forest that powers every prediction. All figures are genuine holdout results from the training pipeline — nothing is hard-coded."
      />

      {/* Stats grid */}
      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="paper-card px-5 py-4">
            <dt className="archival-label">{stat.label}</dt>
            <dd className="mt-1.5 font-display text-xl font-bold tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="paper-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Model Performance</h2>
            <span className="archival-label">Holdout test set</span>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--accent) 8%, transparent)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number | string) => [`${value}%`, ""]}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} fill="var(--accent)" maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="paper-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Holdout Samples per Condition</h2>
            <span className="archival-label">Test set support</span>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={holdoutData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="disease" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} angle={-38} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--accent) 8%, transparent)" }}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Bar dataKey="support" name="samples" radius={[2, 2, 0, 0]} fill="var(--chart-2)" maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature importance */}
      <div className="paper-card mt-6 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Feature Importance</h2>
          <span className="archival-label">Gini importance · learned during training</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Which symptom features the forest relies on most when separating the
          15 conditions. This describes the model's decision boundary — it does
          not mean a symptom medically causes a disease.
        </p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={modelInfo.featureImportance.slice(0, 10).map((f) => ({
                label: labelFor(f.feature),
                importance: f.importance,
              }))}
              margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, modelInfo.featureImportance[0]?.importance ?? 0.1]}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={150}
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
              <Bar dataKey="importance" radius={[0, 2, 2, 0]} fill="var(--chart-3)" maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion matrix */}
      <div className="paper-card mt-6 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Confusion Matrix</h2>
          <span className="archival-label">Actual → Predicted · {modelInfo.testSamples} holdout samples</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Rows are the true condition, columns the predicted condition. On this
          demonstration dataset the classes are well separated, so nearly all
          mass sits on the diagonal — hover any cell for the exact count.
        </p>
        <ConfusionMatrix
          className="mt-6"
          matrix={modelInfo.confusionMatrix}
          labels={modelInfo.classes}
        />
      </div>

      {/* Parameters + methodology */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="paper-card relative p-6">
          <Corners />
          <h2 className="font-display text-lg font-semibold">Training Parameters</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Classifier", modelInfo.algorithm],
              ["Trees (n_estimators)", String(modelInfo.params.nEstimators)],
              ["Max depth", String(modelInfo.params.maxDepth)],
              ["Min samples per leaf", String(modelInfo.params.minSamplesLeaf)],
              ["Features considered per split", String(modelInfo.params.featureSubsetSize)],
              ["Random seed", String(modelInfo.params.randomSeed)],
              ["Dataset seed / noise", `${modelInfo.dataset.seed} / ±${modelInfo.dataset.noise}`],
              ["Instances per disease", String(modelInfo.dataset.instancesPerDisease)],
              ["Total instances", String(modelInfo.dataset.totalInstances)],
              ["Model generated", new Date(modelInfo.generatedAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b border-dotted border-foreground/20 pb-1.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-display font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="paper-card p-6">
          <h2 className="font-display text-lg font-semibold">About the Evaluation</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The dataset is a <em>documented educational demonstration table</em>:
            each disease carries a medically plausible probability for each of
            the 32 symptoms, and the pipeline samples 300 binary instances per
            disease (seeded, ±3% noise) to build 4,500 records. An 80/20
            stratified split reserves 900 records the model never sees during
            training; every metric above is computed on that holdout.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Because the demonstration dataset is clean and its disease
            signatures are well separated, holdout accuracy is very high. Real
            clinical data is far noisier, and real-world performance would be
            lower — that is precisely why this tool must never be used for
            actual diagnosis.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The full pipeline is reproducible: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bun run ml:train</code>{" "}
            retrains and re-evaluates, <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bun run ml:test</code>{" "}
            runs the model sanity suite. The Python reference backend
            (<code className="rounded bg-muted px-1.5 py-0.5 text-xs">backend/</code>) trains the equivalent
            scikit-learn model with <code className="rounded bg-muted px-1.5 py-0.5 text-xs">python backend/ml/train_model.py</code>.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
