"use client";

import { fireCheckoutAndGo } from "@/lib/tracking";
import { trackCtaClick } from "@/lib/cta-tracking";
import { appendUTMs } from "@/lib/utm";

interface PlanCTAButtonProps {
  planId: string;
  planName: string;
  price: number;
  checkoutUrl: string;
  ctaLabel: string;
  highlighted: boolean;
}

const CTA_KEY_MAP: Record<string, string> = {
  basico: "pricing-basico",
  completo: "pricing-completo",
  vip: "pricing-vip",
};

export function PlanCTAButton({
  planId,
  price,
  checkoutUrl,
  ctaLabel,
  highlighted,
}: PlanCTAButtonProps) {
  const ctaKey = CTA_KEY_MAP[planId] ?? `pricing-${planId}`;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const href = appendUTMs(checkoutUrl);
    // sendBeacon ANTES do redirect — sobrevive a target=_blank/fechamento.
    trackCtaClick({ ctaId: ctaKey, planId, destinationUrl: href });
    fireCheckoutAndGo(href, { targetBlank: true, value: price });
  }

  return (
    <a
      href={checkoutUrl}
      onClick={handleClick}
      data-cta={ctaKey}
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
