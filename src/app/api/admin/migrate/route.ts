import { NextResponse } from "next/server";
import pg from "pg";

export async function POST() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const sql = `
      CREATE TABLE IF NOT EXISTS "AppUser" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "plan" TEXT NOT NULL,
        "accessType" TEXT NOT NULL DEFAULT 'lifetime',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_email_key" ON "AppUser"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_orderId_key" ON "AppUser"("orderId");
      CREATE INDEX IF NOT EXISTS "AppUser_email_idx" ON "AppUser"("email");

      CREATE TABLE IF NOT EXISTS "AppProfile" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "objective" TEXT NOT NULL,
        "currentWeight" DOUBLE PRECISION,
        "height" DOUBLE PRECISION,
        "age" INTEGER,
        "goalType" TEXT NOT NULL,
        "goalCustom" TEXT,
        "goalWeight" DOUBLE PRECISION,
        "challenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppProfile_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppProfile_userId_key" ON "AppProfile"("userId");

      CREATE TABLE IF NOT EXISTS "AppCheckin" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "habits" JSONB NOT NULL DEFAULT '{}',
        "waterCount" INTEGER NOT NULL DEFAULT 0,
        "exerciseDone" BOOLEAN NOT NULL DEFAULT false,
        "exerciseMin" INTEGER NOT NULL DEFAULT 0,
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppCheckin_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppCheckin_userId_date_key" ON "AppCheckin"("userId", "date");
      CREATE INDEX IF NOT EXISTS "AppCheckin_userId_idx" ON "AppCheckin"("userId");
      CREATE INDEX IF NOT EXISTS "AppCheckin_date_idx" ON "AppCheckin"("date");

      CREATE TABLE IF NOT EXISTS "AppWaterLog" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "cups" INTEGER NOT NULL,
        "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppWaterLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppWaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "AppWaterLog_userId_idx" ON "AppWaterLog"("userId");

      CREATE TABLE IF NOT EXISTS "AppWeightLog" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "weight" DOUBLE PRECISION NOT NULL,
        "note" TEXT,
        "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppWeightLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppWeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "AppWeightLog_userId_idx" ON "AppWeightLog"("userId");

      CREATE TABLE IF NOT EXISTS "AppVipSlot" (
        "id" TEXT NOT NULL DEFAULT 'singleton',
        "totalSlots" INTEGER NOT NULL DEFAULT 100,
        "usedSlots" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppVipSlot_pkey" PRIMARY KEY ("id")
      );
      INSERT INTO "AppVipSlot" ("id", "totalSlots", "usedSlots", "updatedAt")
      VALUES ('singleton', 100, 0, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING;

      CREATE TABLE IF NOT EXISTS "AppSetting" (
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
      );
      INSERT INTO "AppSetting" ("key", "value", "updatedAt") VALUES
        ('HOTMART_WEBHOOK_SECRET', 'hyOski1wNdfIth7m857yQ3pUwbjb5s1611387', CURRENT_TIMESTAMP),
        ('HOTMART_OFFER_VIP', 'h84hak4e', CURRENT_TIMESTAMP),
        ('HOTMART_OFFER_COMPLETO', 'uzvdkzkf', CURRENT_TIMESTAMP),
        ('HOTMART_OFFER_BASICO', 'zxq5tgew', CURRENT_TIMESTAMP)
      ON CONFLICT ("key") DO NOTHING;
    `;

    await client.query(sql);
    await client.end();

    return NextResponse.json({ ok: true, message: "All app tables created successfully" });
  } catch (error: unknown) {
    await client.end().catch(() => {});
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
