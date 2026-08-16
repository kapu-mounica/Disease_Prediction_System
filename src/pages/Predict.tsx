import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import {
  ArrowRight,
  Check,
  Eraser,
  Loader2,
  Search,
  Stethoscope,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Corners, Ornament, SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";
import { ConfidenceGauge } from "@/components/ConfidenceGauge";
import { useBootTimeout } from "@/hooks/use-boot-timeout";
import { SYMPTOM_CATEGORIES, SYMPTOM_CATALOG } from "@/convex/ml/catalog";
import type { PredictionResult } from "@/convex/ml/types";
import { formatTimestamp, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

function extractErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    return "The prediction service rejected the request.";
  }
  return "Could not reach the prediction service. Please check the connection and try again.";
}

export default function Predict() {
  const symptoms = useQuery(api.symptoms.listSymptoms);
  const modelInfo = useQuery(api.modelInfo.getModelInfo);
  const predict = useAction(api.predict.predict);
  const bootTimedOut = useBootTimeout(12000);
  const backendDown = symptoms === undefined && bootTimedOut;
  const nTrees = modelInfo?.params.nEstimators;

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const catalog = symptoms ?? SYMPTOM_CATALOG;
  const known = useMemo(() => new Set(catalog.map((s) => s.id)), [catalog]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      catalog.filter(
        (s) =>
          query.length === 0 ||
          s.label.toLowerCase().includes(query) ||
          s.id.includes(query),
      ),
    [catalog, query],
  );

  const toggle = (id: string) => {
    setResult(null);
    setError(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const clearAll = () => {
    setSelected([]);
    setError(null);
  };

  const handlePredict = async () => {
    if (selected.length === 0) {
      setError("Please select at least one symptom before predicting.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await predict({ symptoms: selected });
      setResult(res as unknown as PredictionResult);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLabels = new Map(
    catalog.filter((s) => selected.includes(s.id)).map((s) => [s.id, s.label]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        index="02"
        label="Disease Prediction"
        title="Record your symptoms"
        description="Search or browse the symptom index, mark everything you have observed, then consult the model. Inference runs server-side — this page never computes probabilities."
      />

      {backendDown && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-[3px] border border-destructive/40 bg-destructive/5 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <WifiOff className="size-5 shrink-0 text-destructive" />
            <p className="text-sm">
              The prediction service is unreachable. The model cannot run
              without it — please reload shortly.
            </p>
          </div>
          <Button variant="outline" size="sm" className="btn-editorial" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.45fr_1fr]">
        {/* ── Symptom browser ─────────────────────────────────── */}
        <div className="paper-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Symptom Index</h2>
            <span className="archival-label">{catalog.length} entries</span>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms — e.g. fever, cough, wheezing…"
              className="w-full rounded-[3px] border border-input bg-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            {search.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {query.length > 0 && visible.length === 0 && (
            <p className="mt-6 text-sm italic text-muted-foreground">
              No symptoms match “{search}”. Try a different term.
            </p>
          )}

          <div className="mt-6 space-y-8">
            {SYMPTOM_CATEGORIES.map((category) => {
              const items = visible.filter((s) => s.category === category);
              if (items.length === 0) return null;
              return (
                <section key={category}>
                  <div className="flex items-baseline justify-between border-b border-foreground/15 pb-1.5">
                    <h3 className="archival-label text-foreground/80">{category}</h3>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {items.map((s) => {
                      const isSelected = selected.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          title={s.description}
                          onClick={() => toggle(s.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "flex items-center justify-between gap-1.5 rounded-[3px] border px-3 py-2 text-left text-sm transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_rgba(58,46,32,0.25)]"
                              : "border-foreground/25 bg-card hover:border-accent/60 hover:bg-accent/5",
                          )}
                        >
                          <span className="truncate">{s.label}</span>
                          {isSelected && <Check className="size-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* ── Selection panel ─────────────────────────────────── */}
        <div className="lg:sticky lg:top-24">
          <div className="paper-card p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Your Selection</h2>
              <span className="font-display text-sm tabular-nums text-accent">
                {selected.length} / {catalog.length}
              </span>
            </div>

            {selected.length === 0 ? (
              <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
                No symptoms recorded yet. Mark the symptoms you have observed
                from the index, then press <em>Predict Disease</em>.
              </p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {selected.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="group flex items-center gap-1.5 rounded-full border border-foreground/30 bg-background px-3 py-1 text-sm transition-colors hover:border-destructive/60 hover:bg-destructive/10"
                      title={`Remove ${selectedLabels.get(id) ?? id}`}
                    >
                      {selectedLabels.get(id) ?? id}
                      <X className="size-3.5 text-muted-foreground transition-colors group-hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={handlePredict}
                disabled={selected.length === 0 || isLoading}
                className="btn-editorial flex-1 rounded-[3px] py-2.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Consulting the model…
                  </>
                ) : (
                  <>
                    Predict Disease <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={clearAll}
                disabled={selected.length === 0 || isLoading}
                aria-label="Clear all symptoms"
                title="Clear all symptoms"
              >
                <Eraser className="size-4" />
              </Button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-[3px] border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="mt-5">
            <Disclaimer compact />
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {result && !isLoading && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mt-12"
          >
            <div className="paper-card relative px-6 py-8 sm:px-10 sm:py-10">
              <Corners />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="archival-label">Prediction Record</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  Filed {formatTimestamp(result.timestamp)}
                </p>
              </div>

              <div className="mt-6 grid gap-10 lg:grid-cols-2">
                {/* Predicted disease + gauge */}
                <div>
                  <p className="archival-label">Predicted Disease</p>
                  <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                    {result.predicted_disease}
                  </h2>
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    Preliminary assessment by a {nTrees ?? "trained"}-tree Random Forest ensemble
                    — educational only.
                  </p>
                  <div className="mt-6 max-w-md">
                    <ConfidenceGauge value={result.confidence} size="lg" />
                  </div>
                  <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
                    Confidence reflects the fraction of trees in the ensemble
                    that voted for this class. It is a model statistic, not a
                    statement of medical certainty.
                  </p>
                </div>

                {/* Top 3 */}
                <div>
                  <p className="archival-label">Top 3 Candidate Conditions</p>
                  <ol className="mt-4 space-y-3">
                    {result.top_predictions.map((top, i) => (
                      <li key={top.disease} className="flex items-center gap-4">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-bold",
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
                                width: `${(top.confidence / (result.top_predictions[0].confidence || 1)) * 100}%`,
                              }}
                              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 border-t border-dashed border-foreground/25 pt-4">
                    <p className="archival-label">Symptoms Consulted</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.selected_symptoms.map((id) => (
                        <span
                          key={id}
                          className="rounded-[3px] border border-foreground/25 bg-background px-2 py-0.5 text-xs"
                        >
                          {selectedLabels.get(id) ?? id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/15 pt-5">
                <p className="flex items-center gap-2 text-xs italic text-muted-foreground">
                  <Stethoscope className="size-4" />
                  A preliminary machine-learning prediction — not a diagnosis.
                </p>
                <Button
                  variant="outline"
                  className="btn-editorial rounded-[3px]"
                  onClick={() => setResult(null)}
                >
                  Predict Again
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Ornament />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
