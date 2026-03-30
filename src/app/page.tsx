import { NavBar } from "@/components/landing/nav-bar";
import { HeroSection } from "@/components/landing/hero-section";
import { IdentificationChecklist } from "@/components/landing/identification-checklist";
import { BeliefBreaker } from "@/components/landing/belief-breaker";
import { MethodSEM } from "@/components/landing/method-sem";
import { BenefitsBullets } from "@/components/landing/benefits-bullets";
import { BonusSection } from "@/components/landing/bonus-section";
import { ForWho } from "@/components/landing/for-who";
import { PricingSection } from "@/components/landing/pricing-section";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { PostScript } from "@/components/landing/post-script";
import { StickyBottomCTA } from "@/components/landing/sticky-bottom-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
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
        <PricingSection />
        <Testimonials />
        <FAQSection />
        <FinalCTA />
        <PostScript />
      </main>
      <Footer />
      <StickyBottomCTA />
    </>
  );
}
