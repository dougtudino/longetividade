import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { pauseCycle } from "@/lib/cycles";

// POST /api/app/cycles/pause
// Pausa o ciclo ativo. Erro 409 se nao ha ciclo ativo.
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const cycle = await pauseCycle(user.id);
    return NextResponse.json({ ok: true, cycle });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
