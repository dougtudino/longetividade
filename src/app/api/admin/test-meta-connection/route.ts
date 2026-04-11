import { NextResponse } from "next/server";
import { getSetting, getSettingWithFallback } from "@/lib/settings";

const GRAPH_VERSION = "v21.0";

type GraphError = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
};

type GraphAccount = {
  id: string;
  name: string;
  account_status: number;
  currency?: string;
};

function humanize(status: number, body: GraphError): string {
  const msg = body.error?.message ?? "Erro desconhecido";
  const code = body.error?.code;

  if (status === 401 || code === 190) {
    return "Token invalido ou expirado. Gere um novo token no Graph API Explorer.";
  }
  if (code === 200 || /permission/i.test(msg)) {
    return "Token sem permissao read_insights. Adicione a permissao e gere novamente.";
  }
  if (status === 404 || /does not exist|cannot be loaded/i.test(msg)) {
    return "Conta de anuncios nao encontrada. Verifique o ID (apenas numeros, sem 'act_').";
  }
  if (status === 400) {
    return `Requisicao invalida: ${msg}`;
  }
  return msg;
}

function accountStatusLabel(s: number): string {
  switch (s) {
    case 1:
      return "Ativa";
    case 2:
      return "Desativada";
    case 3:
      return "Sem permissao";
    case 7:
      return "Pendente de revisao";
    case 9:
      return "Em revisao";
    case 100:
      return "Pendente de fechamento";
    case 101:
      return "Fechada";
    default:
      return `Status ${s}`;
  }
}

export async function GET() {
  // Canonico META_ACCESS_TOKEN, fallback para META_ADS_ACCESS_TOKEN legado
  const token = await getSettingWithFallback("META_ACCESS_TOKEN", "META_ADS_ACCESS_TOKEN");
  const rawId = await getSetting("META_ADS_ACCOUNT_ID");

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Token Meta Ads nao configurado em /admin/configuracoes." },
      { status: 200 }
    );
  }
  if (!rawId) {
    return NextResponse.json(
      { ok: false, error: "Account ID Meta Ads nao configurado em /admin/configuracoes." },
      { status: 200 }
    );
  }

  const accountId = rawId.replace(/^act_/, "");
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/act_${accountId}?fields=id,name,account_status,currency&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as GraphAccount & GraphError;

    if (!res.ok || data.error) {
      return NextResponse.json({
        ok: false,
        error: humanize(res.status, data),
        raw: data.error ?? null,
      });
    }

    return NextResponse.json({
      ok: true,
      accountId: data.id,
      accountName: data.name,
      status: accountStatusLabel(data.account_status),
      currency: data.currency ?? null,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha de rede ao contatar Meta Graph API: ${(e as Error).message}`,
    });
  }
}
