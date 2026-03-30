import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-cream-white pt-8 pb-16 px-4">
      <div className="mx-auto max-w-lg">
        <a
          href="/"
          className="font-heading font-bold text-olive text-xl block text-center mb-8"
        >
          Emagreca sem Dieta
        </a>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
              <p className="font-body text-medium-gray">Carregando...</p>
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>
      </div>
    </div>
  );
}
