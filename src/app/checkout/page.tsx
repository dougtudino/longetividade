import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import ThemeToggle from "@/components/ThemeToggle";

export default function CheckoutPage() {
  return (
    <div
      className="themed min-h-screen pt-8 pb-16 px-4"
    >
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/emagreca-sem-dieta"
            className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ← Voltar
          </a>
          <a
            href="/"
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Emagreca Sem Dieta
          </a>
          <ThemeToggle />
        </div>

        {/* Security badge */}
        <div
          className="mb-6 flex items-center justify-center gap-2 rounded-xl border py-3 text-xs"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Pagamento 100% seguro · SSL certificado · Garantia de 7 dias</span>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl border p-8 text-center"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--bg-card)",
              }}
            >
              <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>

        {/* Disclaimer */}
        <p
          className="mt-6 text-center text-xs leading-relaxed"
          style={{ color: "var(--text-hint)" }}
        >
          Ao finalizar a compra, voce concorda com nossos Termos de Uso e
          Politica de Privacidade. Garantia incondicional de 7 dias.
        </p>
      </div>
    </div>
  );
}
