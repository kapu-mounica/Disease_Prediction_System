import { Link } from "react-router";
import { Ornament } from "@/components/vintage";

export function Footer() {
  return (
    <footer className="mt-20 bg-[#2c2215] text-[#e9ddc0]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-semibold">AI Disease Predictor</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#b3a17e]">
              Machine Learning Based Preliminary Health Risk Assessment
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#cbbfa3]">
              A demonstration project applying a Random Forest ensemble to
              symptom-based disease classification. Built for educational and
              portfolio purposes.
            </p>
          </div>
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[#b3a17e]">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { to: "/predict", label: "Disease Prediction" },
                { to: "/how-it-works", label: "How It Works" },
                { to: "/model", label: "Model Information" },
                { to: "/about", label: "About" },
                { to: "/auth", label: "Sign in" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[#e9ddc0]/85 transition-colors hover:text-[#e0a16a]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em] text-[#b3a17e]">
              Medical Disclaimer
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#cbbfa3]">
              This system provides a preliminary machine-learning prediction for
              educational purposes only. It is not a medical diagnosis and must
              not replace evaluation by a qualified healthcare professional.
            </p>
          </div>
        </div>
        <Ornament className="mt-10 text-[#b3a17e]" />
        <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-[#b3a17e] sm:flex-row">
          <p>© 2026 AI Disease Predictor — Educational demonstration.</p>
          <p className="font-display uppercase tracking-[0.18em]">
            Consult a physician for real health concerns
          </p>
        </div>
      </div>
    </footer>
  );
}
