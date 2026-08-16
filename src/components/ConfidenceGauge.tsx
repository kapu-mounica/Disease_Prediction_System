import { motion } from "framer-motion";
import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A vintage "mercury thermometer" confidence gauge: a graduated tube filled
 * from the left with a rust mercury column. The value is the model's ensemble
 * agreement (fraction of trees), not a medical certainty — callers must keep
 * that framing in their copy.
 */
export function ConfidenceGauge({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const heights = { sm: "h-3", md: "h-4", lg: "h-5" };
  const labelSizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-3">
        <span className={cn("font-display font-bold tabular-nums", labelSizes[size])}>
          {pct(clamped)}
        </span>
        <span className="archival-label pb-1">Model agreement</span>
      </div>

      {/* Graduated tube */}
      <div className="relative mt-2">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full border border-foreground/40 bg-card",
            heights[size],
          )}
          role="img"
          aria-label={`Confidence ${pct(clamped)}`}
        >
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <span
              key={tick}
              className="absolute top-0 h-full w-px bg-foreground/25"
              style={{ left: `${tick}%` }}
            />
          ))}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #8a3a22 0%, #a84f33 70%, #c05f3e 100%)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${clamped * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Mercury bulb at the fill tip */}
          <motion.span
            className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#a84f33] ring-2 ring-card"
            initial={{ left: 0 }}
            animate={{ left: `calc(${clamped * 100}% - 4px)` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {/* Scale labels */}
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
