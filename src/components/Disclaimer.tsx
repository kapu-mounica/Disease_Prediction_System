import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The required medical disclaimer, shown prominently across the app.
 */
export function Disclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-[3px] border border-destructive/40 bg-destructive/5 px-5 py-4",
        className,
      )}
      role="note"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-destructive">
            Medical Disclaimer
          </p>
          <p className={cn("mt-1 leading-relaxed text-foreground/90", compact ? "text-sm" : "text-[0.95rem]")}>
            This system provides a preliminary machine-learning prediction for{" "}
            <strong>educational purposes only</strong>. It is{" "}
            <strong>NOT a medical diagnosis</strong> and must not replace
            evaluation by a qualified healthcare professional. If you are
            unwell, please consult a doctor.
          </p>
        </div>
      </div>
    </div>
  );
}
