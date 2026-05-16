// src/app/emagreca-sem-dieta/page.tsx
//
// Reposicionamento: vende "Calendario Detox 21 Dias" (produto tangivel de
// continuidade) em vez de "Metodo S.E.M". Backend mantem PlanId basico|completo|vip.
//
// Estrutura: nav -> hero -> como funciona -> o que recebe -> nao e dieta ->
// progresso -> social proof -> pricing -> faq -> final CTA -> lead capture.
"use client";

import { useEffect } from "react";
import { trackViewContent, trackInitiateCheckout, trackAddToCart } from "@/lib/tracking";
import { trackCtaClick } from "@/lib/cta-tracking";
import { captureUTMs, appendUTMs } from "@/lib/utm";
import { PLAN_BASICO } from "@/config/plans";
import { DetoxNav } from "@/components/landing/detox/detox-nav";
import { DetoxHero } from "@/components/landing/detox/detox-hero";
import { DetoxHowItWorks } from "@/components/landing/detox/detox-how-it-works";
import { DetoxWhatYouGet } from "@/components/landing/detox/detox-what-you-get";
import { DetoxNotDiet } from "@/components/landing/detox/detox-not-diet";
import { DetoxProgress } from "@/components/landing/detox/detox-progress";
import { DetoxFaq } from "@/components/landing/detox/detox-faq";
import { DetoxFinalCta } from "@/components/landing/detox/detox-final-cta";
import { PricingSection } from "@/components/landing/pricing-section";
import { SocialProofBlock } from "@/components/landing/social-proof-block";
import { StickyBottomCTA } from "@/components/landing/sticky-bottom-cta";
import LeadCapture from "@/components/LeadCapture";

export default function EmagrecaSemDietaPage() {
  useEffect(() => {
    captureUTMs(new URLSearchParams(window.location.search));
    trackViewContent("Calendario Detox 21 Dias", PLAN_BASICO.price);
  }, []);

  function handleNavCtaClick() {
    const href = appendUTMs(PLAN_BASICO.checkoutUrl);
    trackInitiateCheckout("Calendario Detox 21 Dias", PLAN_BASICO.price);
    trackAddToCart("Calendario Detox 21 Dias", PLAN_BASICO.price);
    trackCtaClick({
      ctaId: "nav-detox",
      planId: "basico",
      destinationUrl: href,
    });
  }

  return (
    <main style={{ backgroundColor: "var(--bg-page)" }}>
      <DetoxNav onCtaClick={handleNavCtaClick} />

      <DetoxHero />
      <DetoxHowItWorks />
      <DetoxWhatYouGet />
      <DetoxNotDiet />
      <DetoxProgress />
      <SocialProofBlock />
      <PricingSection />
      <DetoxFaq />
      <DetoxFinalCta />

      <LeadCapture />

      <footer
        className="py-10 px-4"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p
            className="font-body text-xs leading-relaxed mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Resultados podem variar conforme adesao, rotina e historico
            individual. Este produto nao substitui orientacao medica ou
            nutricional. Consulte um profissional antes de mudar habitos
            alimentares ou rotina de exercicios.
          </p>
          <p
            className="font-body text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            © {new Date().getFullYear()} Longetividade · Calendario Detox 21
            Dias
          </p>
        </div>
      </footer>

      <StickyBottomCTA />
    </main>
  );
}
