// Pipeline de geracao de Creative via IA (Meta Ads):
//   Briefing admin → Uma (Claude) escolhe template+prompt → Blotato renderiza →
//   Quinn (Claude) valida compliance Meta Ad Policy → se ok, upload pra
//   /adimages → salva Creative.metaImageHash.
//
// Diferente de blotato-media.ts (que gera pra SocialPost), esse pipeline
// gera pra Creative (campanhas Meta). Usa uma persona temporaria "SocialPost-like"
// pra reaproveitar buildVisualBrief da Uma.

import { prisma } from "./prisma";
import {
  createVisual,
  createImageSlideshow,
  createCarousel,
  waitForCreation,
  getOutputUrl,
  BlotatoError,
} from "./blotato-client";
import { buildVisualBriefForBriefing } from "./agents/uma-creative";
import { reviewCreativeCompliance } from "./agents/quinn-creative";
import { getLauncherCreds, uploadAdImage } from "./meta-launcher";

export type CreativeStyle =
  | "auto"
  | "talking-head"
  | "slideshow"
  | "quote-card"
  | "infographic"
  | "carousel";

export interface CreateAiCreativeInput {
  collectionId: string;
  slug: string;
  name: string;
  format: "feed" | "story" | "banner";
  briefing: string; // texto livre do admin: dor, objecao, prova, angulo
  angle?: "dor" | "prova" | "objecao" | "promessa" | "cta";
  headline?: string;
  cta?: string;
  style?: CreativeStyle; // hint pra Uma filtrar templates

  // PRESET DIRECT (bypass Uma quando fornecido) — playbook-aligned
  presetTemplateId?: string;
  presetSlides?: Array<{ imagePrompt: string; textOverlay: string }>;
  presetQuotes?: string[];
}

export interface CreateAiCreativeResult {
  creativeId: string;
  imageUrl: string;
  metaImageHash: string | null;
  umaRationale: string;
  quinnVerdict: {
    severity: "pass" | "warn" | "block";
    issues: string[];
    reasoning: string;
  };
  skippedMetaUpload: boolean;
}

function dimensionsFor(format: string): { width: number; height: number } {
  switch (format) {
    case "story":
      return { width: 1080, height: 1920 };
    case "banner":
      return { width: 1200, height: 628 };
    case "feed":
    default:
      return { width: 1080, height: 1080 };
  }
}

function slotFor(format: string): "AD_FEED" | "AD_STORY" | "AD_BANNER" {
  if (format === "story") return "AD_STORY";
  if (format === "banner") return "AD_FEED"; // banner cai no catalogo feed
  return "AD_FEED";
}

export async function createAiCreative(
  input: CreateAiCreativeInput
): Promise<CreateAiCreativeResult> {
  const collection = await prisma.creativeCollection.findUnique({
    where: { id: input.collectionId },
  });
  if (!collection) throw new Error(`Collection ${input.collectionId} nao encontrada`);

  const { width, height } = dimensionsFor(input.format);
  const slot = slotFor(input.format);

  // 1. PRESET DIRECT path: se preset forneceu templateId + slides/quotes,
  //    bypassa Uma (economiza ~2k tokens Anthropic, evita 429, qualidade
  //    consistente). Brief eh montado so com dados fornecidos.
  let brief: Awaited<ReturnType<typeof buildVisualBriefForBriefing>>;
  const hasCompletePreset =
    !!input.presetTemplateId &&
    ((input.presetSlides && input.presetSlides.length > 0) ||
      (input.presetQuotes && input.presetQuotes.length > 0));

  if (hasCompletePreset) {
    console.log(
      `[creative-ai] PRESET DIRECT — bypass Uma. template=${input.presetTemplateId}, ` +
        `slides=${input.presetSlides?.length ?? 0}, quotes=${input.presetQuotes?.length ?? 0}`
    );
    brief = {
      enrichedBriefing: input.briefing.slice(0, 200),
      templateId: input.presetTemplateId!,
      templateRationale: "preset playbook-aligned",
      colorPalette: "verde-oliva + off-white + terroso",
      mood: "acolhedor",
      textOverlay: input.headline,
      reasoning: "preset playbook-aligned: templateId + slides/quotes pre-definidos",
      slides: input.presetSlides,
      quotes: input.presetQuotes,
    };
  } else {
    // Fluxo normal: Uma decide tudo a partir do briefing livre
    brief = await buildVisualBriefForBriefing({
      collectionName: collection.name,
      briefing: input.briefing,
      angle: input.angle,
      headline: input.headline,
      cta: input.cta,
      slot,
      style: input.style,
    });
  }

  // 2. Quinn valida ANTES do render (economiza credito Blotato)
  const preVerdict = await reviewCreativeCompliance({
    briefing: input.briefing,
    headline: input.headline,
    cta: input.cta,
    angle: input.angle,
  });
  if (preVerdict.severity === "block") {
    throw new Error(
      `Quinn bloqueou o creative antes do render: ${preVerdict.issues.join(" · ")}${preVerdict.suggestedFix ? ` | Fix: ${preVerdict.suggestedFix}` : ""}`
    );
  }

  // 3. Blotato renderiza
  // Truncamos em 400 chars — Whiteboard Infographic valida description<=500,
  // mas Blotato pode adicionar titulo/metadata internamente, então margem
  // generosa (100 chars) evita erro server-side.
  const MAX_PROMPT = 400;
  const priorityParts = [
    input.headline ? `Headline: ${input.headline}` : "",
    brief.textOverlay ? `Texto: "${brief.textOverlay}"` : "",
    input.cta ? `CTA: ${input.cta}` : "",
  ].filter(Boolean);
  const priorityText = priorityParts.join(" · ");
  // Reserva pra priority; resto pro briefing. Min 80 chars.
  const briefingBudget = Math.max(80, MAX_PROMPT - priorityText.length - 10);
  const briefingShort =
    brief.enrichedBriefing.length > briefingBudget
      ? brief.enrichedBriefing.slice(0, briefingBudget - 3) + "..."
      : brief.enrichedBriefing;

  const prompt = [briefingShort, priorityText]
    .filter(Boolean)
    .join("\n")
    .slice(0, MAX_PROMPT);

  console.log(`[creative-ai] prompt len=${prompt.length}, template=${brief.templateId}`);

  // Timeout depende do tipo: video talking-head demora 5-15min, imagem ~30s
  const isVideo =
    input.style === "talking-head" ||
    /video|selfie|avatar|story-video|slideshow/i.test(brief.templateId);
  const timeoutMs = isVideo ? 18 * 60_000 : 3 * 60_000;
  const intervalMs = isVideo ? 10_000 : 5_000;

  // Retry ate 2 vezes se template especifico falhar em validation
  // (Blotato valida server-side depois do POST — creation retorna status
  // `creation-from-template-failed` e waitForCreation joga erro).
  const FALLBACK_TEMPLATES = [
    "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1", // Quote Card — mais tolerante
    "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", // Single Centered Text
  ];
  let attemptTemplateId = brief.templateId;
  let started;
  let done;
  let attempts = 0;

  // Decide qual funcao Blotato usar baseado no que Uma retornou
  async function startCreation(tplId: string) {
    const title = `${collection!.name} · ${input.name}`;
    // Se Uma forneceu slides estruturados (pra Image Slideshow), usa createImageSlideshow
    if (brief.slides && brief.slides.length > 0) {
      console.log(`[creative-ai] usando createImageSlideshow com ${brief.slides.length} slides`);
      return createImageSlideshow({
        templateId: tplId,
        slides: brief.slides,
        title,
      });
    }
    // Se Uma forneceu quotes (pra Quote Card / Tweet Card), usa createCarousel
    if (brief.quotes && brief.quotes.length > 0) {
      console.log(`[creative-ai] usando createCarousel com ${brief.quotes.length} quotes`);
      return createCarousel({
        templateId: tplId,
        quotes: brief.quotes,
        title,
      });
    }
    // Default: prompt simples
    return createVisual({ templateId: tplId, prompt, title });
  }

  while (attempts < 3) {
    try {
      started = await startCreation(attemptTemplateId);
      done = await waitForCreation(started.id, { timeoutMs, intervalMs });
      break;
    } catch (err) {
      attempts++;
      const msg = (err as Error).message;
      const isValidationFail =
        msg.includes("failed") ||
        msg.includes("validation") ||
        msg.includes("at most") ||
        msg.includes("characters");
      if (!isValidationFail || attempts >= 3) throw err;
      const next = FALLBACK_TEMPLATES[attempts - 1];
      if (!next || next === attemptTemplateId) throw err;
      console.warn(
        `[creative-ai] template ${attemptTemplateId} falhou validacao, tentando fallback ${next}`
      );
      attemptTemplateId = next;
      brief.templateId = next;
      brief.templateRationale = `[fallback apos falha] ${brief.templateRationale ?? ""}`;
    }
  }

  if (!done || !started) {
    throw new Error("Impossivel gerar creative apos retries");
  }

  const outputUrl = getOutputUrl(done);
  if (!outputUrl) {
    throw new BlotatoError(
      `Blotato creation ${started.id} retornou sem URL`,
      500,
      done
    );
  }

  // 4. Grava Creative no DB. Se slug ja existe na colecao, auto-sufixa -2, -3...
  //    (ate 10 tentativas) — evita desperdicar o render que ja foi feito.
  let creative: Awaited<ReturnType<typeof prisma.creative.create>> | null = null;
  let attemptSlug = input.slug;
  for (let i = 0; i < 10; i++) {
    try {
      creative = await prisma.creative.create({
        data: {
          collectionId: input.collectionId,
          slug: attemptSlug,
          componentKey: `ai:${brief.templateId}`,
          name: input.name,
          format: input.format,
          width,
          height,
          description: `[AI] ${brief.mood} · ${brief.templateRationale ?? ""}`.slice(0, 500),
          tags: ["ai", input.angle ?? "geral", brief.mood ?? ""].filter(Boolean),
          imageUrl: outputUrl,
          aiGenerated: true,
        },
      });
      break;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("Unique constraint") && msg.includes("slug")) {
        attemptSlug = `${input.slug}-${i + 2}`;
        continue;
      }
      throw err;
    }
  }
  if (!creative) {
    throw new Error(`Nao conseguiu criar Creative apos 10 tentativas com slug "${input.slug}"`);
  }

  // 5. Upload pra Meta /adimages (se creds disponiveis)
  let metaImageHash: string | null = null;
  let skippedMetaUpload = false;
  try {
    const creds = await getLauncherCreds();
    if (!creds) {
      skippedMetaUpload = true;
    } else {
      const imgRes = await fetch(outputUrl);
      if (!imgRes.ok) {
        throw new Error(`download ${outputUrl} ${imgRes.status}`);
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const base64 = buf.toString("base64");
      const filename = `${collection.slug}-${input.slug}.jpg`;
      const up = await uploadAdImage(creds, base64, filename);
      if (up.ok) {
        metaImageHash = up.hash;
        await prisma.creative.update({
          where: { id: creative.id },
          data: { metaImageHash: up.hash },
        });
      } else {
        skippedMetaUpload = true;
        console.warn(`[creative-ai] upload Meta falhou: ${up.error}`);
      }
    }
  } catch (err) {
    skippedMetaUpload = true;
    console.warn(
      `[creative-ai] upload Meta erro:`,
      err instanceof Error ? err.message : String(err)
    );
  }

  // 6. Quinn POS-render valida o creative completo (headline + visual prompt final)
  const postVerdict = await reviewCreativeCompliance({
    briefing: prompt,
    headline: input.headline,
    cta: input.cta,
    angle: input.angle,
    context: "post-render",
  });

  // Audit
  await prisma.agentDecision.create({
    data: {
      agentId: "uma",
      action: "CREATIVE_BRIEF",
      targetType: "creative",
      targetId: creative.id,
      targetName: input.name,
      params: {
        collectionId: input.collectionId,
        templateId: brief.templateId,
        format: input.format,
        angle: input.angle ?? null,
      },
      reasoning: brief.reasoning ?? brief.templateRationale ?? "(sem reasoning)",
      status: "executed",
      executedAt: new Date(),
      executionResult: JSON.parse(JSON.stringify({ brief, outputUrl })),
    },
  });
  await prisma.agentDecision.create({
    data: {
      agentId: "quinn",
      action: "CREATIVE_COMPLIANCE",
      targetType: "creative",
      targetId: creative.id,
      targetName: input.name,
      params: { severity: postVerdict.severity, phase: "post-render" },
      reasoning: postVerdict.reasoning,
      status: postVerdict.severity === "block" ? "rejected" : "executed",
      executedAt: new Date(),
      rejectedReason:
        postVerdict.severity === "block" ? postVerdict.issues.join(" · ") : null,
      executionResult: JSON.parse(JSON.stringify(postVerdict)),
    },
  });

  return {
    creativeId: creative.id,
    imageUrl: outputUrl,
    metaImageHash,
    umaRationale: brief.templateRationale ?? brief.reasoning ?? "",
    quinnVerdict: {
      severity: postVerdict.severity,
      issues: postVerdict.issues,
      reasoning: postVerdict.reasoning,
    },
    skippedMetaUpload,
  };
}
