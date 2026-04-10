"use client";

import { trackInitiateCheckout } from "@/lib/tracking";
import { appendUTMs } from "@/lib/utm";

interface PlanCTAButtonProps {
  planId: string;
  planName: string;
  price: number;
  checkoutUrl: string;
  ctaLabel: string;
  highlighted: boolean;
}

export function PlanCTAButton({
  planName,
  price,
  checkoutUrl,
  ctaLabel,
  highlighted,
}: PlanCTAButtonProps) {
  function handleClick() {
    trackInitiateCheckout(`Metodo S.E.M — ${planName}`, price);
  }

  // Anexa UTMs do localStorage ao link do Hotmart no momento do clique
  const href = typeof window !== "undefined" ? appendUTMs(checkoutUrl) : checkoutUrl;

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={`block w-full text-center font-body font-bold text-base py-3.5 rounded-xl transition-colors ${
        highlighted ? "text-white" : "border-2"
      }`}
      style={
        highlighted
          ? { backgroundColor: "var(--accent)" }
          : { borderColor: "var(--accent)", color: "var(--accent)" }
      }
    >
      {ctaLabel}
    </a>
  );
}
