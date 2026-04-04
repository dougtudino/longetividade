import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  return NextResponse.json({ email: user.email });
}
