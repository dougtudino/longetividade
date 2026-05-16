import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function runQuery(label: string, sql: string) {
  console.log(`\n========================================`);
  console.log(`QUERY ${label}`);
  console.log(`========================================`);
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(sql);
    console.log(`Rows: ${rows.length}`);
    console.log(JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2));
  } catch (err: any) {
    console.log(`ERROR: ${err.message}`);
  }
}

async function main() {
  // Q1/Q2/Q3 — tables don't exist locally
  await runQuery(
    "1 — Launch by slug (REPORT)",
    `SELECT id, slug, name, status, "createdAt", "updatedAt"
     FROM "Launch"
     WHERE slug ILIKE '%launch-001%' OR slug ILIKE '%pioneer%'
     ORDER BY "createdAt" ASC`,
  );

  await runQuery(
    "2 — LaunchAsset (REPORT)",
    `SELECT la.id, la.type, la.name, la."metaImageHash", la.tags, la."createdAt"
     FROM "LaunchAsset" la
     JOIN "Launch" l ON la."launchId" = l.id
     WHERE l.slug ILIKE '%launch-001%' OR l.slug ILIKE '%pioneer%'
     ORDER BY la."createdAt" ASC`,
  );

  await runQuery(
    "3 — AgentRun (REPORT)",
    `SELECT agent, "runType", status, "createdAt", metadata
     FROM "AgentRun"
     WHERE metadata::text ILIKE '%launch-001%' OR metadata::text ILIKE '%pioneer%'
     ORDER BY "createdAt" ASC LIMIT 50`,
  );

  // Q4 — adjusted to match real schema (agentId, action, reasoning, params)
  await runQuery(
    "4 — AgentDecision (adjusted to real schema)",
    `SELECT id, "agentId", action, "targetType", "targetName", status, priority,
            reasoning, "createdAt", "executedAt", "approvedBy"
     FROM "AgentDecision"
     WHERE reasoning ILIKE '%launch-001%'
        OR reasoning ILIKE '%pioneer%'
        OR "targetName" ILIKE '%launch-001%'
        OR "targetName" ILIKE '%pioneer%'
        OR params::text ILIKE '%launch-001%'
        OR params::text ILIKE '%pioneer%'
     ORDER BY "createdAt" ASC`,
  );

  // Q5 — Launch table doesn't exist; show the closest thing (Campaign + AgentKnowledge with launch refs)
  await runQuery(
    "5a — information_schema.tables matching launch/pioneer",
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND (table_name ILIKE '%launch%' OR table_name ILIKE '%pioneer%')`,
  );

  await runQuery(
    "5b — Launch column schema (will be empty if table missing)",
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'Launch'
     ORDER BY ordinal_position`,
  );

  // Bonus: hunt for launch-001/pioneer references across other tables that DO exist
  await runQuery(
    "B1 — AgentKnowledge with launch-001/pioneer",
    `SELECT id, kind, source, LEFT(body, 200) as body_preview, metadata, "createdAt"
     FROM "AgentKnowledge"
     WHERE body ILIKE '%launch-001%' OR body ILIKE '%pioneer%'
        OR source ILIKE '%launch-001%' OR source ILIKE '%pioneer%'
        OR metadata::text ILIKE '%launch-001%' OR metadata::text ILIKE '%pioneer%'
     ORDER BY "createdAt" ASC LIMIT 30`,
  );

  await runQuery(
    "B2 — Campaign with launch-001/pioneer",
    `SELECT id, name, platform, objective, status, "createdAt"
     FROM "Campaign"
     WHERE name ILIKE '%launch-001%' OR name ILIKE '%pioneer%'
     ORDER BY "createdAt" ASC`,
  );

  await runQuery(
    "B3 — Creative/CreativeCollection with launch-001/pioneer",
    `SELECT 'collection' AS kind, id, name, "createdAt", NULL AS extra
     FROM "CreativeCollection"
     WHERE name ILIKE '%launch-001%' OR name ILIKE '%pioneer%'
     UNION ALL
     SELECT 'creative' AS kind, id, name, "createdAt", "headline" AS extra
     FROM "Creative"
     WHERE name ILIKE '%launch-001%' OR name ILIKE '%pioneer%'
        OR headline ILIKE '%launch-001%' OR headline ILIKE '%pioneer%'
     ORDER BY 4 ASC LIMIT 30`,
  );

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("FATAL:", e);
  await prisma.$disconnect();
  process.exit(1);
});
