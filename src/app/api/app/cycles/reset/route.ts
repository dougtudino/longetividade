import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { resetCycle, type CycleDifficulty } from "@/lib/cycles";

// POST /api/app/cycles/reset
// Body opcional: { difficulty?: "easy" | "normal" | "hard" }
// Abandona o ciclo atual (preserva no historico com status="abandoned")
// e cria um novo zerado com cycleNumber+1.
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  let difficulty: CycleDifficulty | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.difficulty && ["easy", "normal", "hard"].includes(body.difficulty)) {
      difficulty = body.difficulty;
    }
  } catch {
    /* body opcional */
  }

  try {
    const cycle = await resetCycle(user.id, difficulty);
    return NextResponse.json({ ok: true, cycle });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
