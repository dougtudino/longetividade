import { NextResponse } from "next/server";
import { Pool } from "pg";

// One-time database setup route - creates tables if they don't exist
// Remove this file after first successful run
export async function POST(request: Request) {
  const authHeader = request.headers.get("x-setup-key");
  if (authHeader !== process.env.EBOOK_DOWNLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "plan" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "mpPaymentId" TEXT,
        "mpPreferenceId" TEXT,
        "downloadToken" TEXT,
        "downloadCount" INTEGER NOT NULL DEFAULT 0,
        "tokenExpiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Order_mpPaymentId_key" UNIQUE ("mpPaymentId"),
        CONSTRAINT "Order_mpPreferenceId_key" UNIQUE ("mpPreferenceId"),
        CONSTRAINT "Order_downloadToken_key" UNIQUE ("downloadToken")
      );

      CREATE INDEX IF NOT EXISTS "Order_email_idx" ON "Order"("email");
      CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
      CREATE INDEX IF NOT EXISTS "Order_downloadToken_idx" ON "Order"("downloadToken");
      CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

      CREATE TABLE IF NOT EXISTS "AbandonedCheckout" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "plan" TEXT,
        "step" TEXT NOT NULL DEFAULT 'checkout',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AbandonedCheckout_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "AbandonedCheckout_email_idx" ON "AbandonedCheckout"("email");
    `);

    return NextResponse.json({ ok: true, message: "Tables created successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
