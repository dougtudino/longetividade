import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/campaigns/blueprint/[launchId]/export?download=1
//
// Gera markdown atualizado do blueprint a partir do estado atual do
// banco. Inclui metaIds pos-launch, ajustes feitos depois, etc — ao
// contrario do docs/blueprints/launch-001.md que e snapshot estatico.
//
// Serve como .md pra Doug baixar ou colar no chat.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const { launchId } = await ctx.params;
  const blueprint = await prisma.launchBlueprint.findUnique({
    where: { launchId },
    include: {
      audiences: { orderBy: { orderIndex: "asc" } },
      adSets: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!blueprint) {
    return NextResponse.json(
      { ok: false, error: "Blueprint nao encontrado" },
      { status: 404 }
    );
  }

  // Puxa CreativeCollections anexadas
  const collectionSlugs = Array.from(
    new Set(
      blueprint.adSets
        .map((a) => a.creativesCollectionId)
        .filter((s): s is string => !!s)
    )
  );
  const collections = collectionSlugs.length > 0
    ? await prisma.creativeCollection.findMany({
        where: { slug: { in: collectionSlugs } },
        include: {
          creatives: {
            where: { archived: false },
            include: { copies: { where: { active: true } } },
          },
        },
      })
    : [];

  const md = buildMarkdown(blueprint, collections);
  const download = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      ...(download
        ? { "Content-Disposition": `attachment; filename="${launchId.toLowerCase()}-snapshot.md"` }
        : {}),
    },
  });
}

type Blueprint = Awaited<ReturnType<typeof prisma.launchBlueprint.findUnique>>;
type Collection = Awaited<ReturnType<typeof prisma.creativeCollection.findMany>>[number] & {
  creatives: Array<{
    id: string;
    slug: string;
    name: string;
    format: string;
    width: number;
    height: number;
    tags: string[];
    metaImageHash: string | null;
    copies: Array<{
      label: string;
      headline: string;
      description: string | null;
      cta: string | null;
      primaryText: string | null;
    }>;
  }>;
};

function buildMarkdown(bp: NonNullable<Blueprint> & {
  audiences: Array<{
    orderIndex: number;
    audienceKey: string;
    audienceType: string;
    eventName: string | null;
    retentionDays: number | null;
    lookalikeSourceKey: string | null;
    lookalikeCountry: string | null;
    lookalikeRatio: number | null;
    metaAudienceId: string | null;
    status: string;
  }>;
  adSets: Array<{
    orderIndex: number;
    adSetKey: string;
    layer: string;
    activateOn: string;
    budgetDailyBrl: number;
    ageMin: number;
    ageMax: number;
    genders: string[];
    countries: string[];
    interests: unknown;
    customAudienceKeys: string[];
    excludedAudienceKeys: string[];
    creativesCollectionId: string | null;
    creativesAngles: string[];
    numAds: number;
    metaAdSetId: string | null;
    status: string;
  }>;
}, collections: Collection[]): string {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const totalAdSetBudget = bp.adSets.reduce((s, a) => s + a.budgetDailyBrl, 0);
  const totalAds = bp.adSets.reduce((s, a) => s + a.numAds, 0);

  const lines: string[] = [];

  lines.push(`# ${bp.name} — Snapshot`);
  lines.push("");
  lines.push(`> Gerado automaticamente a partir do banco em ${now}.`);
  lines.push(`> Para editar, use a UI em /admin/campanhas/launch-blueprint.`);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## 1. Produto e infra Meta");
  lines.push("");
  lines.push(`- **launchId:** \`${bp.launchId}\``);
  lines.push(`- **Status:** \`${bp.status}\``);
  lines.push(`- **Produto:** ${bp.productName}`);
  lines.push(`- **Preco:** R$ ${bp.productPriceBrl}`);
  lines.push(`- **Hotmart ID:** ${bp.productHotmartId ?? "(nao setado)"}`);
  lines.push(`- **Landing:** ${bp.landingUrl}`);
  lines.push(`- **Pixel ID:** \`${bp.pixelId}\``);
  lines.push(`- **Dataset:** ${bp.datasetName}`);
  lines.push(`- **Ad Account:** \`${bp.adAccountId}\``);
  lines.push(`- **Business Manager:** \`${bp.businessManagerId}\``);
  lines.push("");

  lines.push("## 2. Campanha Meta");
  lines.push("");
  lines.push(`- **Nome:** \`${bp.campaignName}\``);
  lines.push(`- **Objetivo:** \`${bp.campaignObjective}\``);
  lines.push(`- **Budget total:** R$ ${bp.budgetTotalBrl}/dia`);
  lines.push(`- **Soma ad sets:** R$ ${totalAdSetBudget}/dia${totalAdSetBudget > bp.budgetTotalBrl ? " ⚠ excede total" : ""}`);
  lines.push(`- **Total ads previstos:** ${totalAds}`);
  lines.push(`- **Advantage Budget:** ${bp.advantageBudget ? "sim" : "nao"}`);
  lines.push(`- **Meta Campaign ID:** ${bp.metaCampaignId ? `\`${bp.metaCampaignId}\`` : "(nao lancada)"}`);
  lines.push(`- **Lancada em:** ${bp.launchedAt ? new Date(bp.launchedAt).toISOString().slice(0, 19).replace("T", " ") : "—"}`);
  lines.push("");

  lines.push(`## 3. Audiencias (${bp.audiences.length})`);
  lines.push("");
  lines.push("| # | Key | Tipo | Evento/Source | Retencao | Status | Meta ID |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const a of bp.audiences) {
    const source = a.audienceType === "lookalike"
      ? `LAL ${a.lookalikeRatio}×${a.lookalikeCountry} ← ${a.lookalikeSourceKey}`
      : a.eventName ?? "—";
    const retention = a.retentionDays ? `${a.retentionDays}d` : "—";
    const metaId = a.metaAudienceId ? `\`${a.metaAudienceId}\`` : "—";
    lines.push(`| ${a.orderIndex + 1} | \`${a.audienceKey}\` | ${a.audienceType} | ${source} | ${retention} | ${a.status} | ${metaId} |`);
  }
  lines.push("");

  lines.push(`## 4. Ad sets (${bp.adSets.length})`);
  lines.push("");
  for (const aset of bp.adSets) {
    const interests = aset.interests as Array<{ id: string; name: string }> | null;
    const interestStr = interests && interests.length > 0
      ? interests.map((i) => `${i.name} (${i.id})`).join(", ")
      : "broad (sem interesses)";
    lines.push(`### ${aset.orderIndex + 1}. \`${aset.adSetKey}\``);
    lines.push("");
    lines.push(`- **Camada:** ${aset.layer} · **Ativa em:** ${aset.activateOn}`);
    lines.push(`- **Budget:** R$ ${aset.budgetDailyBrl}/dia`);
    lines.push(`- **Idade:** ${aset.ageMin}-${aset.ageMax} · **Genero:** ${aset.genders.join(", ")} · **Pais:** ${aset.countries.join(", ")}`);
    lines.push(`- **Interesses:** ${interestStr}`);
    if (aset.customAudienceKeys.length > 0) {
      lines.push(`- **Inclui audiences:** ${aset.customAudienceKeys.map((k) => `\`${k}\``).join(", ")}`);
    }
    if (aset.excludedAudienceKeys.length > 0) {
      lines.push(`- **Exclui audiences:** ${aset.excludedAudienceKeys.map((k) => `\`${k}\``).join(", ")}`);
    }
    lines.push(`- **Collection criativos:** ${aset.creativesCollectionId ? `\`${aset.creativesCollectionId}\`` : "(nao setada)"}`);
    lines.push(`- **Angles:** ${aset.creativesAngles.join(", ")}`);
    lines.push(`- **# ads:** ${aset.numAds}`);
    lines.push(`- **Status:** ${aset.status} · **Meta Ad Set ID:** ${aset.metaAdSetId ? `\`${aset.metaAdSetId}\`` : "(nao criado)"}`);
    lines.push("");
  }

  if (collections.length > 0) {
    lines.push("## 5. Criativos + copies");
    lines.push("");
    for (const col of collections) {
      lines.push(`### Collection \`${col.slug}\` (${col.creatives.length} creatives)`);
      lines.push("");
      for (const cr of col.creatives) {
        lines.push(`#### ${cr.name}`);
        lines.push("");
        lines.push(`- **Slug:** \`${cr.slug}\` · **Format:** ${cr.format} ${cr.width}×${cr.height}`);
        lines.push(`- **Tags:** ${cr.tags.join(", ") || "—"}`);
        lines.push(`- **Meta hash:** ${cr.metaImageHash ? `\`${cr.metaImageHash}\`` : "⚠ nao uploadado"}`);
        if (cr.copies.length > 0) {
          lines.push(`- **Copies (${cr.copies.length}):**`);
          for (const copy of cr.copies) {
            lines.push(`  - **${copy.label}** — Headline: "${copy.headline}"${copy.cta ? ` · CTA: ${copy.cta}` : ""}`);
            if (copy.primaryText) {
              const lines_copy = copy.primaryText.split("\n").map((l) => `    > ${l}`).join("\n");
              lines.push(lines_copy);
            }
          }
        } else {
          lines.push(`- **Copies:** ⚠ sem copies (rode seed-copies ou 🔧 Preparar)`);
        }
        lines.push("");
      }
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(`**Snapshot gerado em:** ${now}`);
  lines.push(`**Fonte:** \`/api/admin/campaigns/blueprint/${bp.launchId}/export\``);
  lines.push("");
  lines.push("Pra editar, use a UI: [/admin/campanhas/launch-blueprint](/admin/campanhas/launch-blueprint)");
  lines.push("");

  return lines.join("\n");
}
