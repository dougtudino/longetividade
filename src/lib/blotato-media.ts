// Camada de alto nivel: gera AI image/video via Blotato e salva no SocialPost.
// Usa imageBriefing+content do post como prompt, escolhe templateId por slot,
// aguarda render e baixa a media pra SocialPostImage (bytes no DB — mesmo
// padrao dos cards renderizados manualmente).

import { prisma } from "./prisma";
import { getSetting } from "./settings";
import {
  createVisual,
  waitForCreation,
  getOutputUrl,
  BlotatoError,
} from "./blotato-client";

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

function buildPrompt(post: {
  title: string;
  content: string;
  imageBriefing: string | null;
  pillar: string;
  slot: string;
}): string {
  const paleta = "paleta verde-oliva e off-white (brand Longetividade)";
  const aspect = post.slot === "STORY" ? "vertical 9:16 (1080x1920)" : "quadrado 1:1 (1080x1080)";
  const briefing = post.imageBriefing?.trim() || post.title;
  const linha = post.content.split("\n")[0]?.trim().slice(0, 120) || post.title;
  return [
    briefing,
    `Texto principal a destacar: "${linha}"`,
    `Formato ${aspect}, ${paleta}, estilo elegante e minimalista, boa legibilidade.`,
    "Publico: mulheres 35+ interessadas em emagrecimento e longevidade.",
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

  // Slot REEL fica pra fase 4 (geracao de video).
  if (post.slot === "REEL") {
    throw new BlotatoError("REEL precisa de geracao de video (fase 4), nao imagem", 400);
  }

  const templateId = await getTemplateIdForSlot(post.slot);
  const prompt = buildPrompt(post);

  const started = await createVisual({ templateId, prompt });
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

function buildReelPrompt(post: {
  title: string;
  content: string;
  imageBriefing: string | null;
  pillar: string;
}): string {
  const briefing = post.imageBriefing?.trim();
  const script = post.content?.trim();
  return [
    "Reel vertical 9:16 (1080x1920) pra Instagram + Facebook.",
    "Publico: mulheres 35+ interessadas em emagrecimento e longevidade (nicho Longetividade).",
    "Estilo elegante, paleta verde-oliva e off-white, tom acolhedor sem clichê.",
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

  const templateId = await getTemplateIdForSlot("REEL");
  const prompt = buildReelPrompt(post);

  const started = await createVisual({ templateId, prompt });
  // video demora mais: ate 10min pra AI story video
  const done = await waitForCreation(started.id, { timeoutMs: 10 * 60_000, intervalMs: 10_000 });

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
