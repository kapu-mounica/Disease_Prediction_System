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
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/vintage";
import { Disclaimer } from "@/components/Disclaimer";
import { PredictionReport } from "@/components/PredictionReport";
import { useBootTimeout } from "@/hooks/use-boot-timeout";
import { SYMPTOM_CATEGORIES, SYMPTOM_CATALOG } from "@/convex/ml/catalog";
import type { PredictionResult } from "@/convex/ml/types";
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

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const catalog = symptoms ?? SYMPTOM_CATALOG;

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

      {/* ── Results: full consultation report ─────────────────── */}
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
            <PredictionReport
              result={result}
              modelInfo={modelInfo}
              selectedLabels={selectedLabels}
              onReset={() => setResult(null)}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
