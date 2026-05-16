import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { listCycles, getCurrentCycle, getCycleStats } from "@/lib/cycles";

// GET /api/app/cycles
// Retorna todos os ciclos do user + ciclo atual + stats agregadas.
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const [cycles, current, stats] = await Promise.all([
      listCycles(user.id),
      getCurrentCycle(user.id),
      getCycleStats(user.id),
    ]);

    return NextResponse.json({ cycles, current, stats });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("GET /api/app/cycles error:", msg);
    return NextResponse.json(
      { error: "cycles_failed", detail: msg },
      { status: 500 }
    );
  }
}
