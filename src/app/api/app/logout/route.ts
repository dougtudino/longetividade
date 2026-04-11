import { NextResponse } from "next/server";

// POST /api/app/logout
// Limpa cookies app_token e app_email. Limpa AMBOS os paths (novo "/"
// e legacy "/app") pra garantir que sessoes antigas tambem sejam
// invalidadas, independente de qual path foi usado pra set.
export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Path novo (correto)
  response.headers.append("Set-Cookie", `app_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  response.headers.append("Set-Cookie", `app_email=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);

  // Path legacy (bug antigo) — clean-up de sessoes que foram criadas
  // antes do fix do Path=/
  response.headers.append("Set-Cookie", `app_token=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);
  response.headers.append("Set-Cookie", `app_email=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);

  return response;
}

export async function GET() {
  return POST();
}
