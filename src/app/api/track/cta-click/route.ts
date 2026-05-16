import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// POST /api/track/cta-click
// Body: { ctaId, planId?, destinationUrl, pathname?, utm?: {...} }
//
// Disparado via navigator.sendBeacon antes do redirect pro Hotmart. Cria a
// fonte da verdade INTERNA de cliques no CTA, independente do Hotmart (que
// marca "Origem: Nao identificada") e do Pixel (bloqueado em ~30% mobile).
//
// Retorna 200 rapido — nao bloqueia o redirect. Falhas sao silenciosas
// pra nunca quebrar UX do usuario.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      ctaId?: string;
      planId?: string;
      destinationUrl?: string;
      pathname?: string;
      utm?: {
        source?: string;
        medium?: string;
        campaign?: string;
        content?: string;
        term?: string;
      };
    };

    if (!body.ctaId || !body.destinationUrl) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    // Hash IP pra nao guardar PII bruto. Suficiente pra dedup/fraude detection
    // sem reter dado sensivel.
    const xff = req.headers.get("x-forwarded-for") ?? "";
    const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;

    await prisma.ctaClick.create({
      data: {
        ctaId: body.ctaId.slice(0, 64),
        planId: body.planId ? body.planId.slice(0, 32) : null,
        destinationUrl: body.destinationUrl.slice(0, 500),
        pathname: body.pathname ? body.pathname.slice(0, 200) : null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
        referrer: req.headers.get("referer")?.slice(0, 500) ?? null,
        utmSource: body.utm?.source?.slice(0, 64) ?? null,
        utmMedium: body.utm?.medium?.slice(0, 64) ?? null,
        utmCampaign: body.utm?.campaign?.slice(0, 64) ?? null,
        utmContent: body.utm?.content?.slice(0, 64) ?? null,
        utmTerm: body.utm?.term?.slice(0, 64) ?? null,
        ipHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Silently succeed — tracking nao deve quebrar UX
    return NextResponse.json({ ok: true, error: (e as Error).message });
  }
}
