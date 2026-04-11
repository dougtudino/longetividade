import { NextResponse } from "next/server";
import { runSchemaMigrations } from "@/lib/db-migrations";

// POST/GET /api/admin/migrate/schema
// Aplica todas as migrations SQL raw do lib/db-migrations.ts.
// Idempotente: CREATE TABLE/INDEX IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS.
//
// Auth: passa pelo middleware porque o path comeca com /api/admin/migrate
// (excecao nao exige cookie admin). Fallback robusto pra quando `prisma
// db push` nao roda no build do Railway.

export async function POST() {
  const summary = await runSchemaMigrations();
  return NextResponse.json(summary);
}

export async function GET() {
  const summary = await runSchemaMigrations();
  return NextResponse.json(summary);
}
