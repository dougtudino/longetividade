import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSchemaMigrations } from "@/lib/db-migrations";
import { requireAdmin } from "@/lib/require-admin";

// POST /api/admin/reset-test-data
// Body: { confirmPhrase: "DELETAR TUDO", preserveSynced?: boolean }
//
// Deleta dados transacionais do banco, preservando configuracoes,
// credenciais, admins e knowledge base da Gaia.
//
// Preserva (nao deleta):
//   - AdminUser
//   - AppSetting
//   - AgentKnowledge
//   - AgentDecision
//   - CreativeCollection + Creative (galeria)
//
// Deleta:
//   - Order (todas OU apenas sem hotmartTransactionId se preserveSynced=true)
//   - AbandonedCheckout (todas)
//   - Lead (todas)
//   - AppUser (cascade: profiles, checkins, water/weight/mood logs, etc)
//   - PageView (todas)
//   - MayaMessage (todas)
//   - Campaign + CampaignMetric (todas)
//   - AppVipSlot reset para 0/100
//
// Requer confirmPhrase exata "DELETAR TUDO" pra prevenir ativacao
// acidental via curl/clique errado.

const CONFIRM_PHRASE = "DELETAR TUDO";

type Counters = Record<string, number>;

async function countAll(): Promise<Counters> {
  const counters: Counters = {};
  const tables = [
    { key: "orders", fn: () => prisma.order.count() },
    { key: "abandoned", fn: () => prisma.abandonedCheckout.count() },
    { key: "leads", fn: () => prisma.lead.count() },
    { key: "appUsers", fn: () => prisma.appUser.count() },
    { key: "appCheckins", fn: () => prisma.appCheckin.count() },
    { key: "appWaterLogs", fn: () => prisma.appWaterLog.count() },
    { key: "appWeightLogs", fn: () => prisma.appWeightLog.count() },
    { key: "appMoodLogs", fn: () => prisma.appMoodLog.count() },
    { key: "pageviews", fn: () => prisma.pageView.count() },
    { key: "mayaMessages", fn: () => prisma.mayaMessage.count() },
    { key: "campaigns", fn: () => prisma.campaign.count() },
    { key: "campaignMetrics", fn: () => prisma.campaignMetric.count() },
  ];
  for (const t of tables) {
    try {
      counters[t.key] = await t.fn();
    } catch {
      counters[t.key] = 0;
    }
  }
  return counters;
}

// GET /api/admin/reset-test-data — retorna contadores (preview do que sera deletado)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const counts = await countAll();
  return NextResponse.json({
    ok: true,
    counts,
    confirmPhrase: CONFIRM_PHRASE,
    note: "GET retorna preview. Use POST com body { confirmPhrase } pra executar.",
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  let body: { confirmPhrase?: string; preserveSynced?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  if (body.confirmPhrase !== CONFIRM_PHRASE) {
    return NextResponse.json(
      {
        ok: false,
        error: `Frase de confirmacao incorreta. Envie exatamente: "${CONFIRM_PHRASE}"`,
      },
      { status: 400 }
    );
  }

  // CRITICO: garante que o schema esta up-to-date antes de deletar.
  // Sem isso, se uma coluna nova (ex: hotmartTransactionId) ainda nao
  // existir no banco, o delete com where: { hotmartTransactionId: null }
  // falha. Executa migrations idempotentes primeiro.
  const migrationSummary = await runSchemaMigrations();

  const preserveSynced = body.preserveSynced === true;
  const before = await countAll();
  const deleted: Counters = {};
  const errors: string[] = [];

  // Helper wrapper
  async function tryDelete(key: string, fn: () => Promise<{ count: number }>) {
    try {
      const res = await fn();
      deleted[key] = res.count;
    } catch (e) {
      deleted[key] = 0;
      errors.push(`${key}: ${(e as Error).message}`);
    }
  }

  // Ordem importa: child tables primeiro (cascade fallback), depois parents

  // AppUser related (cascade via FK deveria pegar, mas fazemos explicito)
  await tryDelete("appCheckins", () => prisma.appCheckin.deleteMany({}));
  await tryDelete("appWaterLogs", () => prisma.appWaterLog.deleteMany({}));
  await tryDelete("appWeightLogs", () => prisma.appWeightLog.deleteMany({}));
  await tryDelete("appMoodLogs", () => prisma.appMoodLog.deleteMany({}));
  await tryDelete("appUserAchievements", () =>
    prisma.appUserAchievement.deleteMany({})
  );
  await tryDelete("appUserLevels", () => prisma.appUserLevel.deleteMany({}));
  await tryDelete("appFavoriteRecipes", () =>
    prisma.appFavoriteRecipe.deleteMany({})
  );
  await tryDelete("appChallenges", () => prisma.appChallenge.deleteMany({}));
  await tryDelete("appMeasurements", () => prisma.appMeasurement.deleteMany({}));
  await tryDelete("appProfiles", () => prisma.appProfile.deleteMany({}));
  await tryDelete("appUsers", () => prisma.appUser.deleteMany({}));

  // Campaign metrics antes de Campaign (FK)
  await tryDelete("campaignMetrics", () => prisma.campaignMetric.deleteMany({}));
  await tryDelete("campaigns", () => prisma.campaign.deleteMany({}));

  // Orders — modo normal ou preserve synced
  if (preserveSynced) {
    await tryDelete("orders", () =>
      prisma.order.deleteMany({ where: { hotmartTransactionId: null } })
    );
  } else {
    await tryDelete("orders", () => prisma.order.deleteMany({}));
  }

  // Outras tabelas transacionais
  await tryDelete("abandoned", () => prisma.abandonedCheckout.deleteMany({}));
  await tryDelete("leads", () => prisma.lead.deleteMany({}));
  await tryDelete("pageviews", () => prisma.pageView.deleteMany({}));
  await tryDelete("mayaMessages", () => prisma.mayaMessage.deleteMany({}));

  // Reset VIP slots
  try {
    await prisma.appVipSlot.upsert({
      where: { id: "singleton" },
      update: { usedSlots: 0, totalSlots: 100 },
      create: { id: "singleton", usedSlots: 0, totalSlots: 100 },
    });
    deleted.vipSlotsReset = 1;
  } catch (e) {
    errors.push(`vipSlotReset: ${(e as Error).message}`);
  }

  const after = await countAll();

  return NextResponse.json({
    ok: errors.length === 0,
    mode: preserveSynced ? "preserve-synced" : "nuclear",
    before,
    deleted,
    after,
    errors: errors.length > 0 ? errors : undefined,
    migrations: {
      ran: migrationSummary.total,
      ok: migrationSummary.okCount,
      failed: migrationSummary.failCount,
    },
    note: "AdminUser, AppSetting, AgentKnowledge, AgentDecision, CreativeCollection, Creative NAO foram tocados.",
  });
}
