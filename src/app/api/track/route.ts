import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/track
// Body: { page, referrer?, utm_source?, utm_medium?, utm_campaign?, device? }
//
// Registra um pageview na tabela PageView. Chamado client-side pelo
// componente TrackPageView que roda em todas as paginas publicas.
//
// Rate limit natural: 1 pageview por page load (nao por segundo).
// Nao requer autenticacao (publico).
export async function POST(req: NextRequest) {
  try {
    let body: {
      page?: string;
      referrer?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      device?: string;
      country?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const page = body.page ?? "/";

    // Detecta device do user-agent se nao vier no body
    const ua = req.headers.get("user-agent") ?? "";
    let device = body.device ?? "desktop";
    if (/mobile|android|iphone|ipad/i.test(ua)) device = "mobile";
    else if (/tablet|ipad/i.test(ua)) device = "tablet";

    // Tenta pegar pais do header (Cloudflare/Vercel/Railway)
    const country =
      body.country ??
      req.headers.get("cf-ipcountry") ??
      req.headers.get("x-vercel-ip-country") ??
      null;

    await prisma.pageView.create({
      data: {
        page,
        referrer: body.referrer ?? null,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        device,
        country,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Silently fail — tracking nao deve quebrar a experiencia do usuario
    return NextResponse.json({ ok: true });
  }
}
