import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

type BrevoAccount = {
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  plan?: Array<{ type: string; credits: number; creditsType: string }>;
};

type BrevoError = { message?: string; code?: string };

export async function GET() {
  const apiKey = (await getSetting("BREVO_API_KEY")).trim();
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error:
        "BREVO_API_KEY nao foi salva ainda. Cole a chave no campo, clique 'Salvar Brevo' e depois 'Testar Conexao'.",
    });
  }
  if (!apiKey.startsWith("xkeysib-")) {
    return NextResponse.json({
      ok: false,
      error: `Chave salva nao tem formato esperado (deveria comecar com 'xkeysib-'). Tamanho atual: ${apiKey.length} caracteres. Verifique se copiou a chave inteira sem espacos.`,
    });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
      cache: "no-store",
    });
    const data = (await res.json()) as BrevoAccount & BrevoError;

    if (!res.ok) {
      const msg =
        res.status === 401
          ? `Chave Brevo invalida ou sem permissao (HTTP 401). ${data.message ?? ""}`.trim()
          : data.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ ok: false, error: msg });
    }

    const credits =
      data.plan?.reduce((acc, p) => (p.creditsType === "sendLimit" ? acc + p.credits : acc), 0) ?? 0;

    return NextResponse.json({
      ok: true,
      email: data.email ?? null,
      name: [data.firstName, data.lastName].filter(Boolean).join(" ") || null,
      company: data.companyName ?? null,
      sendCredits: credits,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha de rede contatando Brevo: ${(e as Error).message}`,
    });
  }
}
