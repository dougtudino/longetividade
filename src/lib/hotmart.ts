// Hotmart Sales API client — source of truth para vendas reais.
// Docs: https://developers.hotmart.com/docs/
//
// Fluxo:
//   1. OAuth2 client_credentials: POST /security/oauth/token
//      Retorna access_token (expira em ~1h)
//   2. GET /payments/api/v1/sales/history com Bearer token
//      Paginado, filtros de data/status
//
// Credenciais precisam estar em AppSetting ou env:
//   HOTMART_CLIENT_ID
//   HOTMART_CLIENT_SECRET
//   HOTMART_BASIC (header Basic base64(client_id:client_secret))

import { getSetting } from "./settings";

const OAUTH_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const SALES_URL = "https://developers.hotmart.com/payments/api/v1/sales/history";

// Cache de token em memoria (processo vive ~minutos no Railway serverless
// entao cache modesto eh util)
let tokenCache: { token: string; expiresAt: number } | null = null;

export type HotmartCreds = {
  clientId: string;
  clientSecret: string;
  basic: string; // "Basic <base64>"
};

export async function getHotmartCreds(): Promise<HotmartCreds | null> {
  const clientId = await getSetting("HOTMART_CLIENT_ID");
  const clientSecret = await getSetting("HOTMART_CLIENT_SECRET");
  let basic = await getSetting("HOTMART_BASIC");

  if (!clientId || !clientSecret) return null;

  // Se o admin nao colocou HOTMART_BASIC, gera automaticamente
  if (!basic) {
    basic = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  } else if (!basic.startsWith("Basic ")) {
    basic = `Basic ${basic}`;
  }

  return { clientId, clientSecret, basic };
}

export async function getAccessToken(
  creds: HotmartCreds
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  // Cache hit
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return { ok: true, token: tokenCache.token };
  }

  try {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    });

    const res = await fetch(`${OAUTH_URL}?${params}`, {
      method: "POST",
      headers: {
        Authorization: creds.basic,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !data.access_token) {
      return {
        ok: false,
        error: data.error_description ?? data.error ?? `HTTP ${res.status}`,
      };
    }

    const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000; // margem 1min
    tokenCache = { token: data.access_token, expiresAt };

    return { ok: true, token: data.access_token };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type HotmartSaleStatus =
  | "APPROVED"
  | "REFUNDED"
  | "CHARGEBACK"
  | "CANCELED"
  | "BLOCKED"
  | "COMPLETE"
  | "WAITING_PAYMENT";

export type HotmartSale = {
  transaction: string; // "HP..."
  approved_date?: number; // epoch ms
  order_date?: number;
  status: HotmartSaleStatus;
  price: {
    value: number;
    currency_value: string;
  };
  offer?: { code?: string };
  product?: { id?: number; name?: string };
  buyer: {
    email: string;
    name?: string;
    phone?: string;
  };
};

export type HotmartSalesResponse = {
  items: Array<{ purchase: HotmartSale; buyer?: HotmartSale["buyer"] }>;
  page_info?: {
    total_results?: number;
    next_page_token?: string;
    results_per_page?: number;
  };
};

export type NormalizedSale = {
  transactionId: string;
  status: HotmartSaleStatus;
  date: Date;
  email: string;
  name: string;
  phone: string | null;
  offerCode: string | null;
  amountCents: number;
  productId: number | null;
  productName: string | null;
};

export function normalizeSale(item: HotmartSalesResponse["items"][number]): NormalizedSale | null {
  const purchase = item.purchase;
  // Buyer pode vir no item ou dentro de purchase
  const buyer = (item.buyer ?? purchase.buyer) as HotmartSale["buyer"] | undefined;

  if (!purchase?.transaction || !buyer?.email) return null;

  const dateMs = purchase.approved_date ?? purchase.order_date ?? Date.now();

  return {
    transactionId: purchase.transaction,
    status: purchase.status,
    date: new Date(dateMs),
    email: buyer.email.trim().toLowerCase(),
    name: buyer.name ?? buyer.email,
    phone: buyer.phone ?? null,
    offerCode: purchase.offer?.code ?? null,
    amountCents: Math.round((purchase.price?.value ?? 0) * 100),
    productId: purchase.product?.id ?? null,
    productName: purchase.product?.name ?? null,
  };
}

export async function fetchSalesHistory(
  token: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    maxResults?: number;
    transactionStatus?: HotmartSaleStatus;
  } = {}
): Promise<{ ok: true; sales: NormalizedSale[] } | { ok: false; error: string }> {
  const params = new URLSearchParams();
  params.set("max_results", String(options.maxResults ?? 200));
  if (options.startDate) params.set("start_date", String(options.startDate.getTime()));
  if (options.endDate) params.set("end_date", String(options.endDate.getTime()));
  if (options.transactionStatus) params.set("transaction_status", options.transactionStatus);

  try {
    const res = await fetch(`${SALES_URL}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = (await res.json()) as HotmartSalesResponse & {
      error?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.message ?? data.error ?? `HTTP ${res.status}`,
      };
    }

    const sales = (data.items ?? [])
      .map((item) => normalizeSale(item))
      .filter((s): s is NormalizedSale => s !== null);

    return { ok: true, sales };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Helper: mapeia offer code → plan usando AppSetting (mesma logica do webhook)
export async function planFromOfferCode(
  offerCode: string | null,
  amountCents: number
): Promise<"basico" | "completo" | "vip"> {
  const offerBasico = await getSetting("HOTMART_OFFER_BASICO", "zxq5tgew");
  const offerCompleto = await getSetting("HOTMART_OFFER_COMPLETO", "uzvdkzkf");
  const offerVip = await getSetting("HOTMART_OFFER_VIP", "h84hak4e");

  if (offerCode === offerVip) return "vip";
  if (offerCode === offerCompleto) return "completo";
  if (offerCode === offerBasico) return "basico";

  // Fallback por valor
  if (amountCents >= 9700) return "vip";
  if (amountCents >= 6700) return "completo";
  return "basico";
}

// Mapeia status Hotmart → nosso status interno
export function mapHotmartStatus(status: HotmartSaleStatus): string {
  switch (status) {
    case "APPROVED":
    case "COMPLETE":
      return "approved";
    case "REFUNDED":
      return "refunded";
    case "CHARGEBACK":
      return "chargeback";
    case "CANCELED":
    case "BLOCKED":
      return "canceled";
    case "WAITING_PAYMENT":
      return "pending";
    default:
      return String(status).toLowerCase();
  }
}

export function clearTokenCache(): void {
  tokenCache = null;
}
