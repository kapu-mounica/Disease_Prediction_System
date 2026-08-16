import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Disease Prediction" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/model", label: "Model Information" },
  { to: "/about", label: "About" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/20 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt="AI Disease Predictor emblem"
            width={38}
            height={38}
            className="transition-transform duration-300 group-hover:rotate-[8deg]"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight">
              AI Disease Predictor
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Est. MMXXVI · Health Risk Assessment
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "font-display text-[0.8125rem] uppercase tracking-[0.14em] transition-colors hover:text-accent",
                  isActive ? "text-accent" : "text-foreground/85",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="btn-editorial text-[0.7rem] text-foreground/80"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="btn-editorial rounded-[3px]">
              <Link to="/predict">Start Prediction</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-[3px] border border-foreground/25 lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <nav
          className="border-t border-foreground/15 bg-card px-4 pb-5 pt-3 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "border-b border-foreground/10 py-3 font-display text-sm uppercase tracking-[0.14em] transition-colors last:border-b-0 hover:text-accent",
                    isActive ? "text-accent" : "text-foreground/85",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-4 flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="btn-editorial flex-1">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm" className="btn-editorial flex-1 rounded-[3px]">
                <Link to="/predict" onClick={() => setOpen(false)}>
                  Start Prediction
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
