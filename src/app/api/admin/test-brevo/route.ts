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
  const apiKey = await getSetting("BREVO_API_KEY");
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "BREVO_API_KEY nao configurada em /admin/configuracoes.",
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
          ? "Chave Brevo invalida ou sem permissao."
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
