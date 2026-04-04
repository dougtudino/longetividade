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

      -- ─── Sprint 2: New tables ─────────────────────

      CREATE TABLE IF NOT EXISTS "AppMoodLog" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "mood" TEXT NOT NULL,
        "note" TEXT,
        "triggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppMoodLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppMoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "AppMoodLog_userId_idx" ON "AppMoodLog"("userId");
      CREATE INDEX IF NOT EXISTS "AppMoodLog_loggedAt_idx" ON "AppMoodLog"("loggedAt");

      CREATE TABLE IF NOT EXISTS "AppAchievement" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "condition" TEXT NOT NULL,
        "xp" INTEGER NOT NULL DEFAULT 10,
        CONSTRAINT "AppAchievement_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "AppUserAchievement" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "achievementId" TEXT NOT NULL,
        "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppUserAchievement_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppUserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "AppUserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AppAchievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppUserAchievement_userId_achievementId_key" ON "AppUserAchievement"("userId", "achievementId");
      CREATE INDEX IF NOT EXISTS "AppUserAchievement_userId_idx" ON "AppUserAchievement"("userId");

      CREATE TABLE IF NOT EXISTS "AppUserLevel" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "xp" INTEGER NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 1,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppUserLevel_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppUserLevel_userId_key" ON "AppUserLevel"("userId");

      CREATE TABLE IF NOT EXISTS "AppRecipe" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "pillar" TEXT NOT NULL,
        "prepTime" INTEGER NOT NULL,
        "serves" INTEGER NOT NULL,
        "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "tip" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppRecipe_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "AppFavoriteRecipe" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "recipeId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppFavoriteRecipe_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppFavoriteRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "AppFavoriteRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "AppRecipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppFavoriteRecipe_userId_recipeId_key" ON "AppFavoriteRecipe"("userId", "recipeId");

      CREATE TABLE IF NOT EXISTS "AppChallenge" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "day" INTEGER NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppChallenge_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "AppChallenge_userId_day_key" ON "AppChallenge"("userId", "day");
      CREATE INDEX IF NOT EXISTS "AppChallenge_userId_idx" ON "AppChallenge"("userId");

      CREATE TABLE IF NOT EXISTS "AppMeasurement" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "waist" DOUBLE PRECISION,
        "hip" DOUBLE PRECISION,
        "note" TEXT,
        "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppMeasurement_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AppMeasurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "AppMeasurement_userId_idx" ON "AppMeasurement"("userId");

      -- ─── Seed: 25 Achievement Definitions ─────────

      INSERT INTO "AppAchievement" ("id", "name", "description", "icon", "category", "condition", "xp") VALUES
        ('agua_primeiro_copo', 'Primeiro Copo', 'Registrou seu primeiro copo de agua', '💧', 'agua', 'total_water_logs >= 1', 10),
        ('agua_hidratada', 'Hidratada', 'Bebeu 8 copos em um unico dia', '🚰', 'agua', 'daily_water >= 8', 15),
        ('agua_oceano', 'Oceano', '7 dias consecutivos batendo a meta de agua', '🌊', 'agua', 'water_streak_days >= 7', 30),
        ('habitos_primeiro', 'Primeiro Habito', 'Marcou seu primeiro habito', '✅', 'habitos', 'total_habits_checked >= 1', 10),
        ('habitos_dia_perfeito', 'Dia Perfeito', 'Completou todos os 10 habitos em um dia', '⭐', 'habitos', 'perfect_day >= 1', 25),
        ('habitos_semana_perfeita', 'Semana Perfeita', '7 dias consecutivos com todos os habitos', '🏆', 'habitos', 'perfect_streak_days >= 7', 50),
        ('movimento_primeiro_passo', 'Primeiro Passo', 'Registrou seu primeiro exercicio', '👟', 'movimento', 'total_exercise_days >= 1', 10),
        ('movimento_ativa', 'Ativa', '7 dias com exercicio registrado', '💪', 'movimento', 'total_exercise_days >= 7', 25),
        ('movimento_maratonista', 'Maratonista', '30 dias com exercicio registrado', '🏃‍♀️', 'movimento', 'total_exercise_days >= 30', 50),
        ('peso_coragem', 'Coragem', 'Registrou seu peso pela primeira vez', '⚖️', 'peso', 'total_weight_logs >= 1', 10),
        ('peso_primeiro_kg', 'Primeiro Kg', 'Perdeu 1kg desde o inicio', '🎯', 'peso', 'weight_lost >= 1', 25),
        ('peso_5kg_club', '5kg Club', 'Perdeu 5kg desde o inicio', '🥇', 'peso', 'weight_lost >= 5', 50),
        ('streak_3_dias', '3 Dias', '3 dias seguidos fazendo check-in', '🔥', 'streak', 'streak_days >= 3', 15),
        ('streak_7_dias', '7 Dias', '7 dias seguidos fazendo check-in', '🔥', 'streak', 'streak_days >= 7', 25),
        ('streak_14_dias', '14 Dias', '14 dias seguidos fazendo check-in', '🔥', 'streak', 'streak_days >= 14', 35),
        ('streak_21_dias', '21 Dias', '21 dias seguidos — habito formado!', '🔥', 'streak', 'streak_days >= 21', 50),
        ('streak_30_dias', '30 Dias', '30 dias seguidos — voce e imparavel!', '💎', 'streak', 'streak_days >= 30', 75),
        ('especial_comeco', 'Comeco', 'Completou o onboarding', '🌱', 'especial', 'onboarding_done == true', 10),
        ('especial_explorador', 'Exploradora', 'Visitou todas as telas do app', '🧭', 'especial', 'screens_visited >= 5', 15),
        ('especial_fenix', 'Fenix', 'Voltou apos 7+ dias inativa — nunca e tarde!', '🦅', 'especial', 'returned_after_days >= 7', 25),
        ('especial_10_checkins', 'Dedicada', 'Completou 10 check-ins', '📋', 'especial', 'total_checkins >= 10', 20),
        ('especial_50_checkins', 'Comprometida', 'Completou 50 check-ins', '📝', 'especial', 'total_checkins >= 50', 40),
        ('especial_100_checkins', 'Centenaria', 'Completou 100 check-ins', '💯', 'especial', 'total_checkins >= 100', 75),
        ('especial_primeiro_mood', 'Autoconhecimento', 'Registrou seu primeiro humor', '😊', 'especial', 'total_mood_logs >= 1', 10),
        ('especial_primeira_medida', 'Fita Metrica', 'Registrou suas medidas pela primeira vez', '📏', 'especial', 'total_measurements >= 1', 10)
      ON CONFLICT ("id") DO NOTHING;

      -- ─── Seed: 30 Recipe Definitions (for FK on favorites) ─────────

      INSERT INTO "AppRecipe" ("id", "name", "category", "pillar", "prepTime", "serves", "ingredients", "steps", "tip") VALUES
        ('r01', 'Tapioca Cremosa de Banana com Canela', 'cafe', 'S', 8, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r02', 'Ovo Mexido Cremoso com Tomate e Ervas', 'cafe', 'S', 7, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r03', 'Vitamina Sustentona de Banana e Aveia', 'cafe', 'E', 5, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r04', 'Pao na Chapa com Queijo e Oregano', 'cafe', 'S', 5, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r05', 'Mingau de Aveia Rapido', 'cafe', 'E', 8, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r06', 'Sanduiche Natural Pratico', 'cafe', 'S', 7, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r07', 'Iogurte com Granola e Fruta da Estacao', 'cafe', 'S', 3, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r08', 'Crepioca Rapida de Queijo', 'cafe', 'M', 10, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r09', 'Panqueca de Banana', 'cafe', 'E', 12, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r10', 'Torrada com Pasta de Amendoim e Banana', 'cafe', 'M', 5, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r11', 'Frango Desfiado Rapido com Legumes', 'almoco_jantar', 'S', 20, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r12', 'Omelete de Forno Joga Tudo', 'almoco_jantar', 'S', 18, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r13', 'Macarrao Alho e Oleo com Frango', 'almoco_jantar', 'E', 15, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r14', 'Sopa Cremosa de Legumes', 'almoco_jantar', 'E', 20, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r15', 'Arroz de Forno com Sobras', 'almoco_jantar', 'S', 20, 3, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r16', 'Carne Moida Refogada com Batata', 'almoco_jantar', 'M', 20, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r17', 'Wrap de Atum Rapido', 'almoco_jantar', 'S', 10, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r18', 'Escondidinho Rapido de Frango', 'almoco_jantar', 'E', 20, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r19', 'Strogonoff Simples de Frango', 'almoco_jantar', 'M', 18, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r20', 'Risoto Pratico de Legumes', 'almoco_jantar', 'S', 20, 3, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r21', 'Bolinho de Banana e Aveia', 'lanche', 'S', 10, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r22', 'Pate de Atum com Torradinhas', 'lanche', 'E', 8, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r23', 'Banana Amassada com Aveia e Pasta de Amendoim', 'lanche', 'M', 5, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r24', 'Mix de Castanhas e Frutas Secas', 'lanche', 'S', 5, 5, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r25', 'Espetinho de Frutas com Iogurte', 'lanche', 'E', 8, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r26', 'Mousse de Banana', 'sobremesa', 'S', 5, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r27', 'Brigadeiro de Colher Saudavel', 'sobremesa', 'E', 10, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r28', 'Maca Assada com Canela e Mel', 'sobremesa', 'M', 15, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r29', 'Sorvete Caseiro de Morango', 'sobremesa', 'S', 5, 2, ARRAY[]::TEXT[], ARRAY[]::TEXT[], ''),
        ('r30', 'Pudim de Caneca', 'sobremesa', 'E', 8, 1, ARRAY[]::TEXT[], ARRAY[]::TEXT[], '')
      ON CONFLICT ("id") DO NOTHING;
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
