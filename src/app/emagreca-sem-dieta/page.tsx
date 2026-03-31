// src/app/emagreca-sem-dieta/page.tsx
// Layout original AIOX + links reais Hotmart e Kiwify

import { NavBar } from "@/components/landing/nav-bar";
import { HeroSection } from "@/components/landing/hero-section";
import { IdentificationChecklist } from "@/components/landing/identification-checklist";
import { BeliefBreaker } from "@/components/landing/belief-breaker";
import { MethodSEM } from "@/components/landing/method-sem";
import { BenefitsBullets } from "@/components/landing/benefits-bullets";
import { BonusSection } from "@/components/landing/bonus-section";
import { ForWho } from "@/components/landing/for-who";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { PostScript } from "@/components/landing/post-script";
import { StickyBottomCTA } from "@/components/landing/sticky-bottom-cta";
import { Footer } from "@/components/landing/footer";
import { PLANS } from "@/config/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Emagreca Sem Dieta - Metodo S.E.M | Longetividade",
    description: "Descubra o Metodo S.E.M: 3 pilares simples para emagrecer sem dieta.",
};

const CHECKOUT = {
    hotmart: "https://pay.hotmart.com/H105141835Q",
    kiwify: "https://pay.kiwify.com.br/3fle7dM",
};

function PricingComLinks() {
    return (
          <section id="pricing" className="py-12 md:py-20 bg-white scroll-mt-16">
                <div className="mx-auto max-w-5xl px-4">
                        <h2 className="font-heading font-bold text-charcoal text-2xl md:text-4xl text-center mb-8">
                                  Quanto vale transformar sua relacao com comida?
                        </h2>h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
                          {PLANS.map((plan) => (
                        <div
                                        key={plan.id}
                                        className={`relative rounded-2xl p-6 md:p-8 border-2 transition-transform ${
                                                          plan.highlighted
                                                            ? "border-sage bg-white md:scale-105 shadow-xl"
                                                            : "border-light-gray bg-white"
                                        }`}
                                      >
                          {plan.highlighted && (
                                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage text-white font-body font-bold text-xs uppercase tracking-wider px-4 py-1 rounded-full">
                                                                          MAIS ESCOLHIDO
                                                        </span>span>
                                      )}
                                      <h3 className="font-body font-bold text-charcoal text-lg text-center mb-1">
                                        {plan.name}
                                      </h3>h3>
                                      <div className="text-center mb-4">
                                                      <span className="font-heading font-extrabold text-charcoal text-4xl">
                                                                        R$ {plan.price}
                                                      </span>span>
                                                      <p className="font-body text-medium-gray text-sm mt-1">
                                                                        ou {plan.installments}
                                                      </p>p>
                                      </div>div>
                                      <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature, i) => (
                                                          <li key={i} className="flex items-start gap-2">
                                                                              <svg className="w-4 h-4 text-sage flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                                              </svg>svg>
                                                                              <span className="font-body text-dark-gray text-sm leading-relaxed">{feature}</span>span>
                                                          </li>li>
                                                        ))}
                                      </ul>ul>
                                      <div className="flex flex-col gap-2">
                                                      <a
                                                                          href={CHECKOUT.hotmart}
                                                                          target="_blank"
                                                                          rel="noopener noreferrer"
                                                                          className={`block w-full text-center font-body font-bold text-base py-3.5 rounded-xl transition-colors ${
                                                                                                plan.highlighted
                                                                                                  ? "bg-sage hover:bg-olive text-white"
                                                                                                  : "border-2 border-sage text-sage hover:bg-sage hover:text-white"
                                                                          }`}
                                                                        >
                                                                        Comprar via Hotmart
                                                      </a>a>
                                                      <a
                                                                          href={CHECKOUT.kiwify}
                                                                          target="_blank"
                                                                          rel="noopener noreferrer"
                                                                          className="block w-full text-center font-body font-semibold text-sm py-2.5 rounded-xl border border-sage/40 text-sage/80 hover:border-sage hover:text-sage transition-colors"
                                                                        >
                                                                        Comprar via Kiwify
                                                      </a>a>
                                      </div>div>
                        </div>div>
                      ))}
                        </div>div>
                        <div className="mt-10 mx-auto max-w-xl bg-sage-light border-2 border-dashed border-sage rounded-xl p-6 text-center">
                                  <h3 className="font-body font-bold text-olive text-lg mb-2">GARANTIA INCONDICIONAL DE 7 DIAS</h3>h3>
                                  <p className="font-body text-dark-gray text-sm">Risco zero. Devolvemos 100% do seu dinheiro. Sem perguntas.</p>p>
                        </div>div>
                </div>div>
          </section>section>
        );
}

export default function EmagrecaSemDietaPage() {
    return (
          <>
                <NavBar />
                <main>
                        <HeroSection />
                        <IdentificationChecklist />
                        <BeliefBreaker />
                        <MethodSEM />
                        <BenefitsBullets />
                        <BonusSection />
                        <ForWho />
                        <PricingComLinks />
                        <Testimonials />
                        <FAQSection />
                        <FinalCTA />
                        <PostScript />
                </main>main>
                <Footer />
                <StickyBottomCTA />
          </>>
        );
}</></section>
