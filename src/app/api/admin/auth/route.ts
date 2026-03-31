import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET || "longetividade-admin-2024";
  const token = btoa(`${adminPassword}:${secret}`);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
