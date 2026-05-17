// GET /api/app/broto
// Retorna o estado atual do Broto da usuária autenticada.
// Estado eh 100% derivado dos sinais existentes (checkin, streak, ciclos,
// hábitos, água, ausência). Nada eh persistido — reseta com /api/app/reset.
import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { getBrotoState } from "@/lib/broto";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const state = await getBrotoState(user.id);
    return NextResponse.json(state);
  } catch (e) {
    console.error("GET /api/app/broto error:", e);
    return NextResponse.json(
      { error: "broto_state_failed", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
