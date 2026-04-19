// Camada de alto nivel: gera AI image/video via Blotato e salva no SocialPost.
// Usa imageBriefing+content do post como prompt, escolhe templateId por slot,
// aguarda render e baixa a media pra SocialPostImage (bytes no DB — mesmo
// padrao dos cards renderizados manualmente).

import { prisma } from "./prisma";
import { getSetting } from "./settings";
import {
  createVisual,
  createImageSlideshow,
  createCarousel,
  createTalkingHead,
  waitForCreation,
  getOutputUrl,
  BlotatoError,
  type BlotatoCreation,
} from "./blotato-client";
import { buildVisualBrief, type UmaBrief } from "./agents/uma";

// Decide qual funcao Blotato chamar baseado no que Uma retornou.
// Mesma logica de creative-ai-pipeline (consistencia social + ads).
async function startCreationFromBrief(
  brief: UmaBrief,
  fallbackPrompt: string,
  title: string
): Promise<BlotatoCreation> {
  // Talking head — scenes + characterDescription
  if (brief.scenes && brief.scenes.length > 0 && brief.characterDescription) {
    console.log(`[blotato-media] createTalkingHead com ${brief.scenes.length} scenes`);
    return createTalkingHead({
      templateId: brief.templateId,
      scenes: brief.scenes,
      characterDescription: brief.characterDescription,
      title,
    });
  }
  // Image Slideshow — slides com imagem + texto
  if (brief.slides && brief.slides.length > 0) {
    console.log(`[blotato-media] createImageSlideshow com ${brief.slides.length} slides`);
    return createImageSlideshow({
      templateId: brief.templateId,
      slides: brief.slides,
      title,
    });
  }
  // Quote Card / Tweet Card — quotes
  if (brief.quotes && brief.quotes.length > 0) {
    console.log(`[blotato-media] createCarousel com ${brief.quotes.length} quotes`);
    return createCarousel({
      templateId: brief.templateId,
      quotes: brief.quotes,
      title,
    });
  }
  // Default: prompt simples
  return createVisual({ templateId: brief.templateId, prompt: fallbackPrompt, title });
}

const DEFAULT_TEMPLATES: Record<string, string> = {
  FEED_AM: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", // Single Centered Text Quote
  STORY: "ae868019-820d-434c-8fe1-74c9da99129a", // Whiteboard Infographic
  REEL: "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1", // AI Video with AI Voice
};

async function getTemplateIdForSlot(slot: string): Promise<string> {
  const key =
    slot === "FEED_AM" ? "BLOTATO_TPL_FEED_AM" :
    slot === "STORY" ? "BLOTATO_TPL_STORY" :
    slot === "REEL" ? "BLOTATO_TPL_REEL" :
    null;
  if (key) {
    const fromDb = await getSetting(key);
    if (fromDb) return fromDb;
  }
  return DEFAULT_TEMPLATES[slot] ?? DEFAULT_TEMPLATES.FEED_AM;
}

function fallbackImagePrompt(post: {
  title: string;
  content: string;
  imageBriefing: string | null;
  pillar: string;
  slot: string;
}): string {
  // Fallback sem Uma (se ANTHROPIC_API_KEY faltar ou Uma falhar). Melhor que
  // nada — compoe prompt basico com os campos planos do post.
  const paleta = "paleta verde-oliva (#5C6B4D) e off-white (#F4EFE4) — brand Longetividade";
  const aspect = post.slot === "STORY" ? "vertical 9:16 (1080x1920)" : "quadrado 1:1 (1080x1080)";
  const briefing = post.imageBriefing?.trim() || post.title;
  const linha = post.content.split("\n")[0]?.trim().slice(0, 120) || post.title;
  return [
    briefing,
    `Texto principal a destacar: "${linha}"`,
    `Formato ${aspect}, ${paleta}, estilo elegante e minimalista, boa legibilidade.`,
    "Publico: mulheres 30-55 interessadas em reeducacao alimentar sem dieta.",
  ].join("\n");
}

export interface GenerateImageResult {
  postId: string;
  creationId: string;
  outputUrl: string;
  slideIndex: number;
}

export async function generateImageForPost(postId: string): Promise<GenerateImageResult> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      imageBriefing: true,
      pillar: true,
      slot: true,
      format: true,
    },
  });
  if (!post) throw new BlotatoError(`SocialPost ${postId} nao encontrado`, 404);

  // Slot REEL fica pra geracao de video.
  if (post.slot === "REEL") {
    throw new BlotatoError("REEL precisa de generateVideoForPost — nao imagem", 400);
  }

  // Pede Uma pra escolher template + slides/quotes estruturados.
  // Se Uma falhar (sem ANTHROPIC_API_KEY), fallback pro template default + prompt simples.
  let brief: UmaBrief | null = null;
  try {
    brief = await buildVisualBrief(post.id);
  } catch (err) {
    console.warn(`[uma] fallback apos erro:`, (err as Error).message);
  }

  let started;
  if (brief) {
    // Trunca prompt fallback (caso Uma escolha template que aceite so prompt)
    const fallbackPrompt = [
      brief.enrichedBriefing,
      `Paleta: ${brief.colorPalette}`,
      `Mood: ${brief.mood}`,
      brief.textOverlay ? `Texto: "${brief.textOverlay}"` : "",
    ].filter(Boolean).join("\n\n").slice(0, 400);
    started = await startCreationFromBrief(brief, fallbackPrompt, post.title);
  } else {
    // Sem Uma — caminho determinista
    const templateId = await getTemplateIdForSlot(post.slot);
    const prompt = fallbackImagePrompt(post).slice(0, 400);
    started = await createVisual({ templateId, prompt, title: post.title });
  }
  const done = await waitForCreation(started.id, { timeoutMs: 3 * 60_000 });

  const url = getOutputUrl(done);
  if (!url) throw new BlotatoError(`creation ${started.id} retornou sem URL`, 500, done);

  // Baixa a imagem e salva em SocialPostImage (slideIndex=0) pro poster
  // servir via /api/public/social-image/[postId]/[slide].png.
  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    throw new BlotatoError(`falha ao baixar ${url}: ${imgRes.status}`, imgRes.status);
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const mime = imgRes.headers.get("content-type") || "image/jpeg";

  await prisma.socialPostImage.upsert({
    where: { postId_slideIndex: { postId: post.id, slideIndex: 0 } },
    create: {
      postId: post.id,
      slideIndex: 0,
      mimeType: mime,
      data: buf,
    },
    update: {
      mimeType: mime,
      data: buf,
    },
  });

  // Espelha a URL gerada no imageUrl do post (historico/preview).
  await prisma.socialPost.update({
    where: { id: post.id },
    data: { imageUrl: url },
  });

  return { postId: post.id, creationId: started.id, outputUrl: url, slideIndex: 0 };
}

// ─── AI Reels (video) ──────────────────────────────────

export interface GenerateVideoResult {
  postId: string;
  creationId: string;
  videoUrl: string;
}

function fallbackReelPrompt(post: {
  title: string;
  content: string;
  imageBriefing: string | null;
  pillar: string;
}): string {
  const briefing = post.imageBriefing?.trim();
  const script = post.content?.trim();
  return [
    "Reel vertical 9:16 (1080x1920) pra Instagram + Facebook.",
    "Publico: mulheres 30-55 em reeducacao alimentar sem dieta (Longetividade).",
    "Estilo elegante, paleta verde-oliva (#5C6B4D) + off-white (#F4EFE4), tom acolhedor sem clichê.",
    briefing ? `Briefing visual: ${briefing}` : "",
    script ? `Narracao / roteiro:\n${script}` : "",
    "Voz feminina brasileira calorosa, ritmo natural, pausas curtas.",
  ].filter(Boolean).join("\n\n");
}

export async function generateVideoForPost(postId: string): Promise<GenerateVideoResult> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      imageBriefing: true,
      pillar: true,
      slot: true,
    },
  });
  if (!post) throw new BlotatoError(`SocialPost ${postId} nao encontrado`, 404);
  if (post.slot !== "REEL") {
    throw new BlotatoError(`slot ${post.slot} nao suporta video — use generateImageForPost`, 400);
  }

  // Reel: pede Uma com slot REEL (vai retornar slides[] pra Image Slideshow
  // ou scenes[] pra AI Video, ou prompt livre).
  let brief: UmaBrief | null = null;
  try {
    brief = await buildVisualBrief(post.id);
  } catch (err) {
    console.warn(`[uma/reel] fallback apos erro:`, (err as Error).message);
  }

  let started;
  if (brief) {
    const fallbackPrompt = [
      brief.enrichedBriefing,
      `Paleta: ${brief.colorPalette}`,
      `Mood: ${brief.mood}`,
      brief.textOverlay ? `Texto: "${brief.textOverlay}"` : "",
      `Roteiro:\n${post.content.slice(0, 200)}`,
    ].filter(Boolean).join("\n\n").slice(0, 480);
    started = await startCreationFromBrief(brief, fallbackPrompt, post.title);
  } else {
    const templateId = await getTemplateIdForSlot("REEL");
    const prompt = fallbackReelPrompt(post).slice(0, 480);
    started = await createVisual({ templateId, prompt, title: post.title });
  }
  // Video costuma demorar 3-15min. Damos 20min de folga. Se o cliente cair
  // antes disso, a creation continua no Blotato e dá pra consultar depois
  // via GET /v2/videos/creations/:id.
  const done = await waitForCreation(started.id, { timeoutMs: 20 * 60_000, intervalMs: 10_000 });

  const url = getOutputUrl(done);
  if (!url) throw new BlotatoError(`creation ${started.id} retornou sem URL`, 500, done);

  // Pra video nao baixamos pro DB (arquivos grandes). Guardamos a URL
  // publica do CDN Blotato no SocialPost.imageUrl — o poster consome direto.
  await prisma.socialPost.update({
    where: { id: post.id },
    data: { imageUrl: url },
  });

  return { postId: post.id, creationId: started.id, videoUrl: url };
}
