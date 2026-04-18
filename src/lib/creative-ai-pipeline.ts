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
  waitForCreation,
  getOutputUrl,
  BlotatoError,
} from "./blotato-client";
import { buildVisualBriefForBriefing } from "./agents/uma-creative";
import { reviewCreativeCompliance } from "./agents/quinn-creative";
import { getLauncherCreds, uploadAdImage } from "./meta-launcher";

export interface CreateAiCreativeInput {
  collectionId: string;
  slug: string;
  name: string;
  format: "feed" | "story" | "banner";
  briefing: string; // texto livre do admin: dor, objecao, prova, angulo
  angle?: "dor" | "prova" | "objecao" | "promessa" | "cta";
  headline?: string;
  cta?: string;
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

  // 1. Uma monta brief + escolhe template
  const brief = await buildVisualBriefForBriefing({
    collectionName: collection.name,
    briefing: input.briefing,
    angle: input.angle,
    headline: input.headline,
    cta: input.cta,
    slot,
  });

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
  const prompt = [
    brief.enrichedBriefing,
    `Paleta: ${brief.colorPalette}`,
    `Mood: ${brief.mood}`,
    brief.textOverlay ? `Texto no visual: "${brief.textOverlay}"` : "",
    input.headline ? `Headline principal: ${input.headline}` : "",
    input.cta ? `CTA: ${input.cta}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const started = await createVisual({
    templateId: brief.templateId,
    prompt,
    title: `${collection.name} · ${input.name}`,
  });
  const done = await waitForCreation(started.id, { timeoutMs: 3 * 60_000 });
  const outputUrl = getOutputUrl(done);
  if (!outputUrl) {
    throw new BlotatoError(
      `Blotato creation ${started.id} retornou sem URL`,
      500,
      done
    );
  }

  // 4. Grava Creative no DB (metaImageHash sera preenchido apos upload)
  const creative = await prisma.creative.create({
    data: {
      collectionId: input.collectionId,
      slug: input.slug,
      componentKey: `ai:${brief.templateId}`, // AI-generated; componentKey marca origem
      name: input.name,
      format: input.format,
      width,
      height,
      description: `[AI] ${brief.mood} · ${brief.templateRationale ?? ""}`.slice(0, 500),
      tags: ["ai", input.angle ?? "geral", brief.mood ?? ""].filter(Boolean),
    },
  });

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
