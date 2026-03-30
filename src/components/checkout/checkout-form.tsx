"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PLANS } from "@/config/plans";
import type { PlanId, CheckoutResponse } from "@/types/order";

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") as PlanId | null;
  const canceled = searchParams.get("canceled");

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    planParam && ["basico", "completo", "vip"].includes(planParam)
      ? planParam
      : "completo"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abandonedSaved, setAbandonedSaved] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const saveAbandonedCheckout = useCallback(async () => {
    if (!email || abandonedSaved) return;

    try {
      await fetch("/api/abandoned-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: selectedPlan }),
      });
      setAbandonedSaved(true);
    } catch {
      // Silent fail
    }
  }, [email, selectedPlan, abandonedSaved]);

  useEffect(() => {
    if (email && email.includes("@")) {
      const timer = setTimeout(() => {
        saveAbandonedCheckout();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [email, saveAbandonedCheckout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, plan: selectedPlan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao processar checkout");
      }

      const data: CheckoutResponse = await res.json();
      window.location.href = data.init_point;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro inesperado. Tente novamente.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <>
      {canceled && (
        <div className="bg-rose/10 border border-rose rounded-lg p-4 mb-6 text-center">
          <p className="font-body text-rose text-sm">
            Pagamento cancelado. Voce pode tentar novamente.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="font-heading font-bold text-charcoal text-2xl text-center mb-6">
          Finalize sua compra
        </h1>

        {/* Plan selector */}
        <div className="mb-6">
          <p className="font-body font-semibold text-charcoal text-sm mb-3">
            Selecione seu plano:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  selectedPlan === p.id
                    ? "border-sage bg-sage-light"
                    : "border-light-gray hover:border-sage"
                }`}
              >
                <span className="font-body font-bold text-charcoal text-xs block">
                  {p.name}
                </span>
                <span className="font-heading font-extrabold text-charcoal text-lg block">
                  R$ {p.price}
                </span>
                {p.highlighted && (
                  <span className="text-sage text-xs font-body font-bold">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        {plan && (
          <div className="bg-sage-light rounded-xl p-4 mb-6">
            <p className="font-body font-bold text-olive text-sm mb-2">
              Resumo do pedido:
            </p>
            <div className="flex justify-between font-body text-charcoal text-sm">
              <span>Ebook Emagreca sem Dieta - {plan.name}</span>
              <span className="font-bold">R$ {plan.price},00</span>
            </div>
            <p className="font-body text-medium-gray text-xs mt-1">
              ou {plan.installments}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body font-semibold text-charcoal text-sm mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-lg border border-light-gray font-body text-charcoal text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block font-body font-semibold text-charcoal text-sm mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-light-gray font-body text-charcoal text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block font-body font-semibold text-charcoal text-sm mb-1">
              Telefone (opcional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 rounded-lg border border-light-gray font-body text-charcoal text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            />
          </div>

          {error && (
            <div className="bg-rose/10 border border-rose rounded-lg p-3">
              <p className="font-body text-rose text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage hover:bg-olive text-white font-body font-bold text-base py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processando..." : "Pagar com MercadoPago"}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-medium-gray text-xs font-body">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Pagamento seguro
          </span>
          <span>|</span>
          <span>Garantia 7 dias</span>
          <span>|</span>
          <span>Acesso imediato</span>
        </div>
      </div>
    </>
  );
}
