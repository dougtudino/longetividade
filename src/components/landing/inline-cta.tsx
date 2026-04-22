// CTA inline distribuível pela LP.
// Scroll pra #pricing + data-cta pra tracking.
"use client";

type InlineCTAProps = {
  label: string;
  ctaKey: string; // ex: "emotional-primary" | "quiz-primary" | "pillars-primary" | "bonus-primary"
  size?: "sm" | "md" | "lg";
  center?: boolean;
};

export function InlineCTA({ label, ctaKey, size = "md", center = true }: InlineCTAProps) {
  const sizeClass =
    size === "lg"
      ? "py-4 px-8 text-lg"
      : size === "sm"
      ? "py-2.5 px-5 text-sm"
      : "py-3.5 px-6 text-base";

  return (
    <div className={`mt-8 ${center ? "flex justify-center" : ""}`}>
      <a
        href="#pricing"
        data-cta={ctaKey}
        className={`group inline-flex items-center justify-center gap-2 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${sizeClass}`}
        style={{
          backgroundColor: "var(--accent)",
          boxShadow: "0 4px 18px var(--accent-soft)",
        }}
      >
        {label}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
    </div>
  );
}
