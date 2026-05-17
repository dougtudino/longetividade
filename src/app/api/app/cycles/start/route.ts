import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { startNewCycle, type CycleDifficulty } from "@/lib/cycles";

// POST /api/app/cycles/start
// Body opcional: { difficulty: "easy" | "normal" | "hard" }
// Se nao informado, usa sugestao baseada em historico.
// Erro 409 se ja existe ciclo active/paused pendente.
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
    const cycle = await startNewCycle(user.id, difficulty);
    return NextResponse.json({ ok: true, cycle });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
