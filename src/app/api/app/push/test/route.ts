import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { sendPushToUser } from "@/lib/push";

// POST /api/app/push/test
// Dispara um push de teste pra propria usuaria. Util pra validar setup.
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const result = await sendPushToUser(user.id, "generalMessages", {
    title: "Funcionando! 🎉",
    body: "Seu app esta pronto pra mandar lembretes. Voce pode personalizar nas configuracoes.",
    url: "/app/notificacoes",
    tag: "test",
  });

  return NextResponse.json({ ok: true, ...result });
}
