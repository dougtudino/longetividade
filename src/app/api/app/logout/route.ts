import { NextResponse } from "next/server";

// POST /api/app/logout
// Clears cookies app_token and app_email, efectively loggging the user out.
// Chama do client apos o usuario clicar "Sair" no drawer/perfil.
export async function POST() {
  const response = NextResponse.json({ ok: true });
  const expired = "Path=/app; HttpOnly; SameSite=Lax; Max-Age=0";
  response.headers.append("Set-Cookie", `app_token=; ${expired}`);
  response.headers.append("Set-Cookie", `app_email=; ${expired}`);
  return response;
}

export async function GET() {
  return POST();
}
