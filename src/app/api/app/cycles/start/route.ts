import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { startNewCycle } from "@/lib/cycles";

// POST /api/app/cycles/start
// Inicia o proximo ciclo (cycleNumber = ultimo + 1). Erro 409 se ja existe
// ciclo active/paused pendente.
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const cycle = await startNewCycle(user.id);
    return NextResponse.json({ ok: true, cycle });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
