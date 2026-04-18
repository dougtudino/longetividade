import { NextRequest, NextResponse } from "next/server";
import {
  createCarousel,
  createImageSlideshow,
  waitForCreation,
  getOutputUrl,
} from "@/lib/blotato-client";

// POST /api/admin/blotato/test-carousel
// Testa carrossel multi-slide. Suporta 2 modos:
//  - mode="quotes" (default): Quote Card Carousel — so texto, sem fundo
//  - mode="slideshow":        Image Slideshow with Text — imagens + texto
//
// Body: { mode?, templateId?, quotes?[], slides?[], title? }

const QUOTE_CAROUSEL_TEMPLATE =
  "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1";
const IMAGE_SLIDESHOW_TEMPLATE =
  "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1";

const DEFAULT_QUOTES = [
  "Quantas segundas voce ja comecou?",
  "Toda dieta tem prazo. Todo prazo termina.",
  "Metodo S.E.M: Simplicidade, Equilibrio, Movimento.",
  "Nao e dieta. E um metodo educacional.",
  "Baixe o ebook e conheca os 3 pilares.",
];

const DEFAULT_SLIDESHOW = [
  {
    imagePrompt:
      "Calendario antigo sobre mesa de madeira, algumas segundas-feiras marcadas com X vermelho. Luz quente de manha, foto editorial.",
    textOverlay: "Quantas segundas ja comecou?",
  },
  {
    imagePrompt:
      "Ampulheta de areia branca sobre prato vazio de ceramica. Mesa clara, luz natural, estilo minimalista.",
    textOverlay: "Toda dieta tem prazo",
  },
  {
    imagePrompt:
      "Cena aconchegante: pao caseiro, xicara de cha, tenis de caminhada sobre mesa de madeira. Luz quente.",
    textOverlay: "3 pilares: S.E.M",
  },
  {
    imagePrompt:
      "Grupo de 3 mulheres 35-55 tomando cafe em ambiente aconchegante, luz quente de tarde, sorrisos genuinos.",
    textOverlay: "Mulheres reais, metodo real",
  },
  {
    imagePrompt:
      "Mockup de ebook sobre mesa de madeira com xicara de cafe ao lado. Paleta verde-oliva e off-white.",
    textOverlay: "Baixe o ebook",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      mode?: "quotes" | "slideshow";
      templateId?: string;
      quotes?: string[];
      slides?: Array<{ imagePrompt: string; textOverlay: string }>;
      title?: string;
    };
    const mode = body.mode ?? "slideshow";
    const title = body.title || `Test ${mode} Longetividade`;

    let started;
    if (mode === "slideshow") {
      const templateId = body.templateId || IMAGE_SLIDESHOW_TEMPLATE;
      const slides = body.slides ?? DEFAULT_SLIDESHOW;
      started = await createImageSlideshow({ templateId, slides, title });
    } else {
      const templateId = body.templateId || QUOTE_CAROUSEL_TEMPLATE;
      const quotes = body.quotes ?? DEFAULT_QUOTES;
      started = await createCarousel({ templateId, quotes, title });
    }

    const done = await waitForCreation(started.id, {
      timeoutMs: 6 * 60_000, // slideshow com imagens AI demora mais que quote card
      intervalMs: 5000,
    });

    return NextResponse.json({
      ok: true,
      mode,
      creationId: started.id,
      status: done.status,
      outputUrl: getOutputUrl(done),
      raw: done,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
