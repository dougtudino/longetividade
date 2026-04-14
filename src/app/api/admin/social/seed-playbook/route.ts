import { NextResponse } from "next/server";
import { seedPlaybook, PLAYBOOK } from "@/lib/social-playbook";

// POST/GET /api/admin/social/seed-playbook
// Popula (ou atualiza) a "biblia da Luna" em AgentKnowledge:
// - Regras do algoritmo Instagram 2026
// - Metricas prioritarias (retencao, share, save, comment, like)
// - Estruturas de hook
// - Principios dos 5 creators (Vaynerchuk, Hormozi, Jasmine Star, Neil Patel, Brunson)
// - Templates de Story (enquete, pergunta, sequencia, bastidor)
//
// Idempotente — roda quantas vezes quiser.

export async function POST() {
  try {
    const result = await seedPlaybook();
    return NextResponse.json({
      ok: true,
      total: PLAYBOOK.length,
      ...result,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}
