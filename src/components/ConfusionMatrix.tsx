import { cn } from "@/lib/utils";

/**
 * Confusion-matrix heatmap. Rows = actual class, columns = predicted class.
 * Cell intensity scales with the count relative to the diagonal max.
 */
export function ConfusionMatrix({
  matrix,
  labels,
  className,
}: {
  matrix: number[][];
  labels: string[];
  className?: string;
}) {
  const max = Math.max(
    1,
    ...matrix.flat().filter((v) => v > 0),
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto pb-2">
        <div className="inline-block">
          <div className="flex items-center gap-1 pl-28">
            <span className="archival-label w-14 text-right pr-2">pred →</span>
            {labels.map((label) => (
              <span
                key={label}
                className="w-7 shrink-0 truncate text-center text-[9px] text-muted-foreground"
                title={label}
              >
                {label.length > 9 ? `${label.slice(0, 8)}…` : label}
              </span>
            ))}
          </div>
          {matrix.map((row, r) => (
            <div key={labels[r]} className="flex items-center gap-1 py-[1px]">
              <span
                className="w-24 shrink-0 truncate text-right text-[10px] leading-tight text-muted-foreground"
                title={labels[r]}
              >
                {labels[r]}
              </span>
              <span className="w-4 shrink-0 text-center text-[9px] text-muted-foreground/70">↳</span>
              {row.map((count, c) => {
                const intensity = count > 0 ? Math.sqrt(count / max) : 0;
                const isDiagonal = r === c;
                return (
                  <span
                    key={c}
                    title={`${labels[r]} → ${labels[c]}: ${count}`}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border text-[9px] tabular-nums",
                      isDiagonal
                        ? "border-foreground/40 font-semibold text-card"
                        : "border-foreground/10",
                    )}
                    style={{
                      backgroundColor: isDiagonal
                        ? `color-mix(in oklab, var(--accent) ${55 + intensity * 45}%, var(--card))`
                        : `color-mix(in oklab, var(--foreground) ${Math.round(intensity * 22)}%, var(--card))`,
                      color: isDiagonal ? "var(--card)" : "var(--foreground)",
                    }}
                  >
                    {count}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>Low</span>
        <span className="flex h-3 w-24 rounded-[2px] border border-foreground/15"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--foreground) 4%, var(--card)), color-mix(in oklab, var(--accent) 90%, var(--card)))",
          }}
        />
        <span>High</span>
        <span className="ml-2">Diagonal = correct predictions</span>
      </div>
    </div>
  );
}
