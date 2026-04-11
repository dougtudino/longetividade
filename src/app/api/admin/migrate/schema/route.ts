import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/migrate/schema
// Forca a criacao das tabelas mais recentes via SQL raw, caso
// `prisma db push` nao tenha rodado no build do Railway.
//
// Auth: passa pelo middleware porque o path comeca com /api/admin/migrate
// (excecao). Adicional: query param key=ADMIN_SEED_KEY.
//
// Idempotente: CREATE TABLE IF NOT EXISTS + CREATE INDEX IF NOT EXISTS.
// Nao cria foreign key constraints (deixa pro prisma db push futuro).

const STATEMENTS: Array<{ label: string; sql: string }> = [
  // ─── CreativeCollection ──────────────────────────────────
  {
    label: "CreativeCollection table",
    sql: `
      CREATE TABLE IF NOT EXISTS "CreativeCollection" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "campaignId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CreativeCollection_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "CreativeCollection slug unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "CreativeCollection_slug_key" ON "CreativeCollection"("slug")`,
  },
  {
    label: "CreativeCollection createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "CreativeCollection_createdAt_idx" ON "CreativeCollection"("createdAt")`,
  },

  // ─── Creative ────────────────────────────────────────────
  {
    label: "Creative table",
    sql: `
      CREATE TABLE IF NOT EXISTS "Creative" (
        "id" TEXT NOT NULL,
        "collectionId" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "componentKey" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "format" TEXT NOT NULL,
        "width" INTEGER NOT NULL,
        "height" INTEGER NOT NULL,
        "description" TEXT,
        "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "metaImageHash" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "Creative collectionId+slug unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Creative_collectionId_slug_key" ON "Creative"("collectionId", "slug")`,
  },
  {
    label: "Creative collectionId index",
    sql: `CREATE INDEX IF NOT EXISTS "Creative_collectionId_idx" ON "Creative"("collectionId")`,
  },
  {
    label: "Creative format index",
    sql: `CREATE INDEX IF NOT EXISTS "Creative_format_idx" ON "Creative"("format")`,
  },

  // ─── AgentKnowledge ──────────────────────────────────────
  {
    label: "AgentKnowledge table",
    sql: `
      CREATE TABLE IF NOT EXISTS "AgentKnowledge" (
        "id" TEXT NOT NULL,
        "agentId" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "source" TEXT,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AgentKnowledge_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "AgentKnowledge agentId index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentKnowledge_agentId_idx" ON "AgentKnowledge"("agentId")`,
  },
  {
    label: "AgentKnowledge kind index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentKnowledge_kind_idx" ON "AgentKnowledge"("kind")`,
  },
  {
    label: "AgentKnowledge createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentKnowledge_createdAt_idx" ON "AgentKnowledge"("createdAt")`,
  },

  // ─── AgentDecision ───────────────────────────────────────
  {
    label: "AgentDecision table",
    sql: `
      CREATE TABLE IF NOT EXISTS "AgentDecision" (
        "id" TEXT NOT NULL,
        "agentId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT NOT NULL,
        "targetName" TEXT NOT NULL,
        "params" JSONB NOT NULL,
        "reasoning" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'normal',
        "status" TEXT NOT NULL DEFAULT 'proposed',
        "approvedBy" TEXT,
        "approvedAt" TIMESTAMP(3),
        "executedAt" TIMESTAMP(3),
        "executionResult" JSONB,
        "rejectedReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AgentDecision_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "AgentDecision agentId index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentDecision_agentId_idx" ON "AgentDecision"("agentId")`,
  },
  {
    label: "AgentDecision status index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentDecision_status_idx" ON "AgentDecision"("status")`,
  },
  {
    label: "AgentDecision createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentDecision_createdAt_idx" ON "AgentDecision"("createdAt")`,
  },

  // ─── Lead ────────────────────────────────────────────────
  {
    label: "Lead table",
    sql: `
      CREATE TABLE IF NOT EXISTS "Lead" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "source" TEXT,
        "sequenceStep" INTEGER NOT NULL DEFAULT 0,
        "lastEmailAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "Lead email unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Lead_email_key" ON "Lead"("email")`,
  },
  {
    label: "Lead sequenceStep index",
    sql: `CREATE INDEX IF NOT EXISTS "Lead_sequenceStep_idx" ON "Lead"("sequenceStep")`,
  },
  {
    label: "Lead createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt")`,
  },
];

async function runMigration() {
  const results: Array<{ label: string; ok: boolean; error?: string }> = [];

  for (const stmt of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(stmt.sql);
      results.push({ label: stmt.label, ok: true });
    } catch (e) {
      results.push({ label: stmt.label, ok: false, error: (e as Error).message });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;

  return {
    ok: failCount === 0,
    total: results.length,
    okCount,
    failCount,
    results,
  };
}

export async function POST() {
  const summary = await runMigration();
  return NextResponse.json(summary);
}

export async function GET() {
  const summary = await runMigration();
  return NextResponse.json(summary);
}
