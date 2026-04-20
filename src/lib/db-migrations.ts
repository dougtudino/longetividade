// Migrations SQL raw compartilhadas.
// Usadas por /api/admin/migrate/schema (trigger manual) e tambem
// chamadas automaticamente por outros endpoints que precisam garantir
// que o schema esta up-to-date (ex: reset-test-data).
//
// Tudo idempotente: CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
// ALTER TABLE ADD COLUMN IF NOT EXISTS.

import { prisma } from "./prisma";

export type MigrationStatement = { label: string; sql: string };

export const SCHEMA_STATEMENTS: MigrationStatement[] = [
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
  {
    label: "Creative.imageUrl column",
    sql: `ALTER TABLE "Creative" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
  },
  {
    label: "Creative.aiGenerated column",
    sql: `ALTER TABLE "Creative" ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN NOT NULL DEFAULT false`,
  },

  // ─── CreativeCopy (A/B variantes de texto) ──────────────
  {
    label: "CreativeCopy table",
    sql: `
      CREATE TABLE IF NOT EXISTS "CreativeCopy" (
        "id" TEXT NOT NULL,
        "creativeId" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "headline" TEXT NOT NULL,
        "description" TEXT,
        "cta" TEXT,
        "primaryText" TEXT,
        "impressions" INTEGER NOT NULL DEFAULT 0,
        "clicks" INTEGER NOT NULL DEFAULT 0,
        "spendCents" INTEGER NOT NULL DEFAULT 0,
        "conversions" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CreativeCopy_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "CreativeCopy creativeId+label unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "CreativeCopy_creativeId_label_key" ON "CreativeCopy"("creativeId", "label")`,
  },
  {
    label: "CreativeCopy creativeId index",
    sql: `CREATE INDEX IF NOT EXISTS "CreativeCopy_creativeId_idx" ON "CreativeCopy"("creativeId")`,
  },
  {
    label: "CreativeCopy active index",
    sql: `CREATE INDEX IF NOT EXISTS "CreativeCopy_active_idx" ON "CreativeCopy"("active")`,
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

  // ─── AppUser: auth password + google ──
  {
    label: "AppUser.passwordHash column",
    sql: `ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT`,
  },
  {
    label: "AppUser.googleId column",
    sql: `ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "googleId" TEXT`,
  },
  {
    label: "AppUser.googleId unique partial",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_googleId_key" ON "AppUser"("googleId") WHERE "googleId" IS NOT NULL`,
  },

  // ─── AdminUser: google login ──
  {
    label: "AdminUser.googleId column",
    sql: `ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "googleId" TEXT`,
  },
  {
    label: "AdminUser.googleId unique partial",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_googleId_key" ON "AdminUser"("googleId") WHERE "googleId" IS NOT NULL`,
  },

  // ─── SocialPost ─────────────────────────────────────────
  {
    label: "SocialPost table",
    sql: `
      CREATE TABLE IF NOT EXISTS "SocialPost" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "format" TEXT NOT NULL,
        "pillar" TEXT NOT NULL,
        "hashtags" TEXT,
        "imageUrl" TEXT,
        "imageBriefing" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "reviewNote" TEXT,
        "scheduledAt" TIMESTAMP(3),
        "postedAt" TIMESTAMP(3),
        "engagementData" JSONB,
        "createdBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "SocialPost status index",
    sql: `CREATE INDEX IF NOT EXISTS "SocialPost_status_idx" ON "SocialPost"("status")`,
  },
  {
    label: "SocialPost scheduledAt index",
    sql: `CREATE INDEX IF NOT EXISTS "SocialPost_scheduledAt_idx" ON "SocialPost"("scheduledAt")`,
  },

  // ─── Order: novas colunas (CRITICO — reset-test-data depende delas) ──
  {
    label: "Order.hotmartTransactionId column",
    sql: `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "hotmartTransactionId" TEXT`,
  },
  {
    label: "Order.hotmartTransactionId unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Order_hotmartTransactionId_key" ON "Order"("hotmartTransactionId")`,
  },
  {
    label: "Order.syncedFromApiAt column",
    sql: `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "syncedFromApiAt" TIMESTAMP(3)`,
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

  // ─── MayaMessage ────────────────────────────────────────
  {
    label: "MayaMessage table",
    sql: `
      CREATE TABLE IF NOT EXISTS "MayaMessage" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MayaMessage_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "MayaMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE
      )
    `,
  },
  {
    label: "MayaMessage adminId index",
    sql: `CREATE INDEX IF NOT EXISTS "MayaMessage_adminId_idx" ON "MayaMessage"("adminId")`,
  },
  {
    label: "MayaMessage createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "MayaMessage_createdAt_idx" ON "MayaMessage"("createdAt")`,
  },

  // ─── SocialPost.createdBy column ────────────────────────
  {
    label: "SocialPost.createdBy column",
    sql: `ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "createdBy" TEXT`,
  },

  // ─── SocialPost.slot column + index (multi-slot agenda) ─
  {
    label: "SocialPost.slot column",
    sql: `ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "slot" TEXT NOT NULL DEFAULT 'FEED_AM'`,
  },
  {
    label: "SocialPost.slot backfill from format",
    sql: `UPDATE "SocialPost" SET "slot" = CASE
            WHEN "format" = 'reels' THEN 'REEL'
            WHEN "format" = 'stories' THEN 'STORY'
            ELSE 'FEED_AM'
          END WHERE "slot" = 'FEED_AM' AND "createdAt" < NOW() - INTERVAL '1 minute'`,
  },
  {
    label: "SocialPost.slot index",
    sql: `CREATE INDEX IF NOT EXISTS "SocialPost_slot_idx" ON "SocialPost"("slot")`,
  },

  // ─── Creative.archived (commit c04f479 — soft archive) ──
  {
    label: "Creative.archived column",
    sql: `ALTER TABLE "Creative" ADD COLUMN IF NOT EXISTS "archived" BOOLEAN NOT NULL DEFAULT false`,
  },
  {
    label: "Creative.archived index",
    sql: `CREATE INDEX IF NOT EXISTS "Creative_archived_idx" ON "Creative"("archived")`,
  },

  // ─── AgentDecision.progressStatus (commit 7485242 — checklist tabs) ──
  {
    label: "AgentDecision.progressStatus column",
    sql: `ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "progressStatus" TEXT NOT NULL DEFAULT 'proposed'`,
  },
  {
    label: "AgentDecision.progressStatus index",
    sql: `CREATE INDEX IF NOT EXISTS "AgentDecision_progressStatus_idx" ON "AgentDecision"("progressStatus")`,
  },

  // ─── DecisionChecklistItem (commit 7485242 — checklist DIAGNOSE_FUNNEL) ──
  {
    label: "DecisionChecklistItem table",
    sql: `
      CREATE TABLE IF NOT EXISTS "DecisionChecklistItem" (
        "id" TEXT NOT NULL,
        "decisionId" TEXT NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "assignedAgents" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "status" TEXT NOT NULL DEFAULT 'pending',
        "approvedAt" TIMESTAMP(3),
        "completedAt" TIMESTAMP(3),
        "artifactPath" TEXT,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DecisionChecklistItem_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "DecisionChecklistItem decisionId FK",
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'DecisionChecklistItem_decisionId_fkey'
        ) THEN
          ALTER TABLE "DecisionChecklistItem"
          ADD CONSTRAINT "DecisionChecklistItem_decisionId_fkey"
          FOREIGN KEY ("decisionId") REFERENCES "AgentDecision"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `,
  },
  {
    label: "DecisionChecklistItem.decisionId index",
    sql: `CREATE INDEX IF NOT EXISTS "DecisionChecklistItem_decisionId_idx" ON "DecisionChecklistItem"("decisionId")`,
  },
  {
    label: "DecisionChecklistItem.status index",
    sql: `CREATE INDEX IF NOT EXISTS "DecisionChecklistItem_status_idx" ON "DecisionChecklistItem"("status")`,
  },
];

export type MigrationResult = {
  label: string;
  ok: boolean;
  error?: string;
};

export type MigrationSummary = {
  ok: boolean;
  total: number;
  okCount: number;
  failCount: number;
  results: MigrationResult[];
};

export async function runSchemaMigrations(): Promise<MigrationSummary> {
  const results: MigrationResult[] = [];

  for (const stmt of SCHEMA_STATEMENTS) {
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
