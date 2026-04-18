import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

// GET /api/admin/blotato/debug-raw
// Bate direto em GET /v2/videos/templates do Blotato e retorna o JSON cru
// SEM parse/unwrap. Usado pra ver a estrutura real da resposta e entender
// qual campo e o "templateId correto" a usar no POST /videos/from-templates.

export async function GET() {
  const apiKey =
    process.env.BLOTATO_API_KEY || (await getSetting("BLOTATO_API_KEY"));
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "BLOTATO_API_KEY nao configurada" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://backend.blotato.com/v2/videos/templates", {
      headers: { "blotato-api-key": apiKey },
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // mantem cru
    }

    // Se array, pega os primeiros 2 items pra ver estrutura
    let sample: unknown = parsed;
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed)) {
        sample = parsed.slice(0, 2);
      } else if ("items" in parsed && Array.isArray((parsed as { items: unknown[] }).items)) {
        sample = {
          ...parsed,
          items: (parsed as { items: unknown[] }).items.slice(0, 2),
          _note: `Mostrando 2 de ${(parsed as { items: unknown[] }).items.length} items`,
        };
      } else if ("templates" in parsed && Array.isArray((parsed as { templates: unknown[] }).templates)) {
        sample = {
          ...parsed,
          templates: (parsed as { templates: unknown[] }).templates.slice(0, 2),
          _note: `Mostrando 2 de ${(parsed as { templates: unknown[] }).templates.length} templates`,
        };
      }
    }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      rawType: typeof parsed,
      isArray: Array.isArray(parsed),
      keys: parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.keys(parsed)
        : null,
      sample,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
