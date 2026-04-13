import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/social/reset
// Apaga SOMENTE os SocialPosts. Não mexe em nada mais (orders, users, etc).
export async function DELETE() {
  try {
    const deleted = await prisma.socialPost.deleteMany({});
    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
