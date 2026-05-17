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

  // ─── LaunchBlueprint (Sprint 3 — tela editavel) ──
  {
    label: "LaunchBlueprint table",
    sql: `
      CREATE TABLE IF NOT EXISTS "LaunchBlueprint" (
        "id" TEXT NOT NULL,
        "launchId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "productName" TEXT NOT NULL,
        "productPriceBrl" INTEGER NOT NULL,
        "productHotmartId" TEXT,
        "landingUrl" TEXT NOT NULL,
        "pixelId" TEXT NOT NULL,
        "datasetName" TEXT NOT NULL,
        "adAccountId" TEXT NOT NULL,
        "businessManagerId" TEXT NOT NULL,
        "campaignName" TEXT NOT NULL,
        "campaignObjective" TEXT NOT NULL DEFAULT 'OUTCOME_SALES',
        "budgetTotalBrl" INTEGER NOT NULL,
        "advantageBudget" BOOLEAN NOT NULL DEFAULT false,
        "metaCampaignId" TEXT,
        "launchedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LaunchBlueprint_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "LaunchBlueprint launchId unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "LaunchBlueprint_launchId_key" ON "LaunchBlueprint"("launchId")`,
  },
  {
    label: "LaunchBlueprint status index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchBlueprint_status_idx" ON "LaunchBlueprint"("status")`,
  },
  {
    label: "LaunchBlueprint createdAt index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchBlueprint_createdAt_idx" ON "LaunchBlueprint"("createdAt")`,
  },

  // ─── LaunchAudience ──
  {
    label: "LaunchAudience table",
    sql: `
      CREATE TABLE IF NOT EXISTS "LaunchAudience" (
        "id" TEXT NOT NULL,
        "blueprintId" TEXT NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "audienceKey" TEXT NOT NULL,
        "audienceType" TEXT NOT NULL,
        "eventName" TEXT,
        "retentionDays" INTEGER,
        "lookalikeSourceKey" TEXT,
        "lookalikeCountry" TEXT,
        "lookalikeRatio" DOUBLE PRECISION,
        "metaAudienceId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "statusMessage" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LaunchAudience_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "LaunchAudience FK blueprintId",
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'LaunchAudience_blueprintId_fkey'
        ) THEN
          ALTER TABLE "LaunchAudience"
          ADD CONSTRAINT "LaunchAudience_blueprintId_fkey"
          FOREIGN KEY ("blueprintId") REFERENCES "LaunchBlueprint"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `,
  },
  {
    label: "LaunchAudience blueprintId+audienceKey unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "LaunchAudience_blueprintId_audienceKey_key" ON "LaunchAudience"("blueprintId", "audienceKey")`,
  },
  {
    label: "LaunchAudience blueprintId index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchAudience_blueprintId_idx" ON "LaunchAudience"("blueprintId")`,
  },
  {
    label: "LaunchAudience status index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchAudience_status_idx" ON "LaunchAudience"("status")`,
  },

  // ─── LaunchAdSet ──
  {
    label: "LaunchAdSet table",
    sql: `
      CREATE TABLE IF NOT EXISTS "LaunchAdSet" (
        "id" TEXT NOT NULL,
        "blueprintId" TEXT NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "adSetKey" TEXT NOT NULL,
        "layer" TEXT NOT NULL,
        "activateOn" TEXT NOT NULL,
        "budgetDailyBrl" INTEGER NOT NULL,
        "ageMin" INTEGER NOT NULL,
        "ageMax" INTEGER NOT NULL,
        "genders" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "countries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "interests" JSONB,
        "behaviors" JSONB,
        "customAudienceKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "excludedAudienceKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "optimizationGoal" TEXT NOT NULL DEFAULT 'OFFSITE_CONVERSIONS',
        "promotedObjectEvent" TEXT NOT NULL DEFAULT 'PURCHASE',
        "creativesCollectionId" TEXT,
        "creativesAngles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "numAds" INTEGER NOT NULL,
        "metaAdSetId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "statusMessage" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LaunchAdSet_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "LaunchAdSet FK blueprintId",
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'LaunchAdSet_blueprintId_fkey'
        ) THEN
          ALTER TABLE "LaunchAdSet"
          ADD CONSTRAINT "LaunchAdSet_blueprintId_fkey"
          FOREIGN KEY ("blueprintId") REFERENCES "LaunchBlueprint"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `,
  },
  {
    label: "LaunchAdSet blueprintId+adSetKey unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "LaunchAdSet_blueprintId_adSetKey_key" ON "LaunchAdSet"("blueprintId", "adSetKey")`,
  },
  {
    label: "LaunchAdSet blueprintId index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchAdSet_blueprintId_idx" ON "LaunchAdSet"("blueprintId")`,
  },
  {
    label: "LaunchAdSet layer index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchAdSet_layer_idx" ON "LaunchAdSet"("layer")`,
  },
  {
    label: "LaunchAdSet status index",
    sql: `CREATE INDEX IF NOT EXISTS "LaunchAdSet_status_idx" ON "LaunchAdSet"("status")`,
  },

  // ─── Campaign.source + launchId (Sprint 8 — isolar admin do sistema novo) ──
  {
    label: "Campaign.source column",
    sql: `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'legacy'`,
  },
  {
    label: "Campaign.launchId column",
    sql: `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "launchId" TEXT`,
  },
  {
    label: "Campaign.source index",
    sql: `CREATE INDEX IF NOT EXISTS "Campaign_source_idx" ON "Campaign"("source")`,
  },
  {
    label: "Campaign.launchId index",
    sql: `CREATE INDEX IF NOT EXISTS "Campaign_launchId_idx" ON "Campaign"("launchId")`,
  },
  // Backfill: marca como 'blueprint' campanhas que tem metaCampaignId
  // batendo com algum LaunchBlueprint.metaCampaignId. Roda 1x — depois
  // o launcher novo ja popula direto.
  {
    label: "Campaign backfill source=blueprint via metaCampaignId match",
    sql: `
      UPDATE "Campaign" c
      SET "source" = 'blueprint',
          "launchId" = lb."launchId"
      FROM "LaunchBlueprint" lb
      WHERE c."metaCampaignId" IS NOT NULL
        AND c."metaCampaignId" = lb."metaCampaignId"
        AND c."source" = 'legacy'
    `,
  },

  // ─── AppCycle (Desafio 21d com restart/pause) ──────────────
  // Adicionado 2026-05-16. Em prod o `prisma db push` do build do Railway
  // nao criou essas tabelas em alguns deploys — esse fallback SQL garante
  // a criacao via /api/admin/migrate/schema.
  {
    label: "AppCycle table",
    sql: `
      CREATE TABLE IF NOT EXISTS "AppCycle" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "cycleNumber" INTEGER NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'active',
        "daysCompleted" INTEGER NOT NULL DEFAULT 0,
        "pausedAt" TIMESTAMP(3),
        "resumedAt" TIMESTAMP(3),
        "completedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppCycle_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "AppCycle userId+cycleNumber unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AppCycle_userId_cycleNumber_key" ON "AppCycle"("userId", "cycleNumber")`,
  },
  {
    label: "AppCycle userId+status index",
    sql: `CREATE INDEX IF NOT EXISTS "AppCycle_userId_status_idx" ON "AppCycle"("userId", "status")`,
  },
  {
    label: "AppCycle userId index",
    sql: `CREATE INDEX IF NOT EXISTS "AppCycle_userId_idx" ON "AppCycle"("userId")`,
  },
  {
    label: "AppCycle FK to AppUser",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'AppCycle_userId_fkey' AND table_name = 'AppCycle'
        ) THEN
          ALTER TABLE "AppCycle"
            ADD CONSTRAINT "AppCycle_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$
    `,
  },
  {
    label: "AppChallenge cycleId column",
    sql: `ALTER TABLE "AppChallenge" ADD COLUMN IF NOT EXISTS "cycleId" TEXT`,
  },
  {
    label: "AppChallenge cycleId index",
    sql: `CREATE INDEX IF NOT EXISTS "AppChallenge_cycleId_idx" ON "AppChallenge"("cycleId")`,
  },
  {
    label: "AppChallenge FK to AppCycle",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'AppChallenge_cycleId_fkey' AND table_name = 'AppChallenge'
        ) THEN
          ALTER TABLE "AppChallenge"
            ADD CONSTRAINT "AppChallenge_cycleId_fkey"
            FOREIGN KEY ("cycleId") REFERENCES "AppCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$
    `,
  },
  {
    // Drop unique antigo [userId, day] que impedia day repetido entre ciclos.
    label: "AppChallenge drop old userId_day unique",
    sql: `ALTER TABLE "AppChallenge" DROP CONSTRAINT IF EXISTS "AppChallenge_userId_day_key"`,
  },
  {
    label: "AppChallenge userId+cycleId+day unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AppChallenge_userId_cycleId_day_key" ON "AppChallenge"("userId", "cycleId", "day")`,
  },
  {
    // S3.1: niveis de dificuldade no ciclo (easy/normal/hard)
    label: "AppCycle difficulty column",
    sql: `ALTER TABLE "AppCycle" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'normal'`,
  },

  // ─── S6: Web Push notifications ─────────────────────────
  {
    label: "AppPushSubscription table",
    sql: `
      CREATE TABLE IF NOT EXISTS "AppPushSubscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "deviceLabel" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppPushSubscription_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "AppPushSubscription endpoint unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AppPushSubscription_endpoint_key" ON "AppPushSubscription"("endpoint")`,
  },
  {
    label: "AppPushSubscription userId index",
    sql: `CREATE INDEX IF NOT EXISTS "AppPushSubscription_userId_idx" ON "AppPushSubscription"("userId")`,
  },
  {
    label: "AppPushSubscription active index",
    sql: `CREATE INDEX IF NOT EXISTS "AppPushSubscription_active_idx" ON "AppPushSubscription"("active")`,
  },
  {
    label: "AppPushSubscription FK to AppUser",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'AppPushSubscription_userId_fkey' AND table_name = 'AppPushSubscription'
        ) THEN
          ALTER TABLE "AppPushSubscription"
            ADD CONSTRAINT "AppPushSubscription_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$
    `,
  },
  {
    label: "AppNotificationPref table",
    sql: `
      CREATE TABLE IF NOT EXISTS "AppNotificationPref" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "water" BOOLEAN NOT NULL DEFAULT true,
        "challenge" BOOLEAN NOT NULL DEFAULT true,
        "cycle" BOOLEAN NOT NULL DEFAULT true,
        "weeklyRecap" BOOLEAN NOT NULL DEFAULT true,
        "generalMessages" BOOLEAN NOT NULL DEFAULT true,
        "quietHoursStart" INTEGER,
        "quietHoursEnd" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppNotificationPref_pkey" PRIMARY KEY ("id")
      )
    `,
  },
  {
    label: "AppNotificationPref userId unique",
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AppNotificationPref_userId_key" ON "AppNotificationPref"("userId")`,
  },
  {
    label: "AppNotificationPref FK to AppUser",
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'AppNotificationPref_userId_fkey' AND table_name = 'AppNotificationPref'
        ) THEN
          ALTER TABLE "AppNotificationPref"
            ADD CONSTRAINT "AppNotificationPref_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$
    `,
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
