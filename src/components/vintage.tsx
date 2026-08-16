import { cn } from "@/lib/utils";

/** Ornamental rule: — ❦ — */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("ornament text-sm", className)} aria-hidden="true">
      <span>❦</span>
    </div>
  );
}

/** Section heading with an archival "No. 0X" overline. */
export function SectionHeading({
  index,
  label,
  title,
  description,
  className,
}: {
  index?: string;
  label: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="archival-label">
        {index ? `No. ${index} — ` : ""}
        {label}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

/** Four corner brackets for framed plates (archival document look). */
export function Corners({ className }: { className?: string }) {
  const corner =
    "pointer-events-none absolute h-3.5 w-3.5 border-accent/70";
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <span className={cn(corner, "left-0 top-0 border-l-2 border-t-2")} />
      <span className={cn(corner, "right-0 top-0 border-r-2 border-t-2")} />
      <span className={cn(corner, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cn(corner, "bottom-0 right-0 border-b-2 border-r-2")} />
    </div>
  );
}
