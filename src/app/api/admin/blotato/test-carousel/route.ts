import { NextRequest, NextResponse } from "next/server";
import {
  createCarousel,
  waitForCreation,
  getOutputUrl,
} from "@/lib/blotato-client";

// POST /api/admin/blotato/test-carousel
// Testa carrossel multi-slide via inputs.quotes.
// Body opcional: { templateId?, quotes?[] }
// Defaults: template Quote Card Carousel with Paper Background + 5 quotes de teste.

const DEFAULT_CAROUSEL_TEMPLATE =
  "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1";
const DEFAULT_QUOTES = [
  "Quantas segundas voce ja comecou?",
  "Toda dieta tem prazo. Todo prazo termina.",
  "Metodo S.E.M: Simplicidade, Equilibrio, Movimento.",
  "Nao e dieta. E um metodo educacional.",
  "Baixe o ebook e conheca os 3 pilares.",
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      templateId?: string;
      quotes?: string[];
      title?: string;
    };
    const templateId = body.templateId || DEFAULT_CAROUSEL_TEMPLATE;
    const quotes = body.quotes ?? DEFAULT_QUOTES;
    const title = body.title || "Test carousel Longetividade";

    const started = await createCarousel({ templateId, quotes, title });

    const done = await waitForCreation(started.id, {
      timeoutMs: 4 * 60_000,
      intervalMs: 5000,
    });

    return NextResponse.json({
      ok: true,
      creationId: started.id,
      status: done.status,
      outputUrl: getOutputUrl(done),
      slidesCount: quotes.length,
      templateIdUsed: templateId,
      raw: done,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
