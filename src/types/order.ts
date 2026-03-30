export type PlanId = "basico" | "completo" | "vip";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // em reais
  priceInCents: number;
  installments: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}

export interface CheckoutPayload {
  name: string;
  email: string;
  phone?: string;
  plan: PlanId;
}

export interface CheckoutResponse {
  init_point: string;
  orderId: string;
}

export interface OrderRecord {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  plan: string;
  amount: number;
  status: string;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
  downloadToken: string | null;
  downloadCount: number;
  tokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
