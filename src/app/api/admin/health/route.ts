import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting, getSettingWithFallback } from "@/lib/settings";

// GET /api/admin/health
// Verifica todas as configuracoes e retorna status de cada servico.
export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // Brevo
  const brevoKey = await getSetting("BREVO_API_KEY");
  checks.brevo = {
    ok: !!brevoKey && brevoKey.startsWith("xkeysib-"),
    detail: brevoKey ? `Chave ${brevoKey.slice(0, 12)}...` : "Nao configurado",
  };

  // Meta Ads
  const metaToken = await getSettingWithFallback("META_ACCESS_TOKEN", "META_ADS_ACCESS_TOKEN");
  checks.metaToken = {
    ok: !!metaToken && metaToken.length > 20,
    detail: metaToken ? `Token ${metaToken.slice(0, 12)}...` : "Nao configurado",
  };

  const metaAccount = await getSetting("META_ADS_ACCOUNT_ID");
  checks.metaAccount = {
    ok: !!metaAccount,
    detail: metaAccount || "Nao configurado",
  };

  const metaPixel = await getSetting("NEXT_PUBLIC_META_PIXEL_ID");
  checks.metaPixel = {
    ok: !!metaPixel,
    detail: metaPixel || "Nao configurado",
  };

  // Social Media (Luna)
  const pageToken = await getSetting("SOCIAL_PAGE_TOKEN");
  checks.socialPageToken = {
    ok: !!pageToken && pageToken.length > 20,
    detail: pageToken ? `Token ${pageToken.slice(0, 12)}...` : "Nao configurado",
  };

  const pageId = await getSetting("META_PAGE_ID");
  checks.metaPageId = {
    ok: !!pageId,
    detail: pageId || "Nao configurado",
  };

  const igId = await getSetting("INSTAGRAM_ACCOUNT_ID");
  checks.instagramId = {
    ok: !!igId,
    detail: igId || "Nao configurado",
  };

  // Anthropic (Maya chat)
  const anthropicKey = process.env.ANTHROPIC_API_KEY || await getSetting("ANTHROPIC_API_KEY");
  checks.anthropicKey = {
    ok: !!anthropicKey && anthropicKey.length > 10,
    detail: anthropicKey ? "Configurado" : "Nao configurado",
  };

  // CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  checks.cronSecret = {
    ok: !!cronSecret,
    detail: cronSecret ? "Configurado" : "Nao configurado em env",
  };

  // Hotmart
  const hotmartId = await getSetting("HOTMART_CLIENT_ID");
  const hotmartSecret = await getSetting("HOTMART_CLIENT_SECRET");
  checks.hotmart = {
    ok: !!hotmartId && !!hotmartSecret,
    detail: hotmartId ? `Client ${hotmartId.slice(0, 10)}...` : "Nao configurado",
  };

  // Database tables
  let socialPostCount = 0;
  let knowledgeCount = 0;
  try {
    socialPostCount = await prisma.socialPost.count();
  } catch { /* table missing */ }
  try {
    knowledgeCount = await prisma.agentKnowledge.count({ where: { agentId: "luna" } });
  } catch { /* table missing */ }

  checks.lunaContent = {
    ok: socialPostCount > 0,
    detail: `${socialPostCount} posts no banco`,
  };
  checks.lunaKnowledge = {
    ok: knowledgeCount > 0,
    detail: `${knowledgeCount} entries de conhecimento`,
  };

  const allOk = Object.values(checks).every((c) => c.ok);
  const okCount = Object.values(checks).filter((c) => c.ok).length;

  return NextResponse.json({
    ok: allOk,
    score: `${okCount}/${Object.keys(checks).length}`,
    checks,
  });
}
