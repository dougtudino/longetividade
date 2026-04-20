import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { seedCopiesForCollection } from "@/lib/creative-copies-seed";

// POST /api/admin/creatives/collections/[slug]/seed-copies
// Popula CreativeCopy default pra cada Creative da collection.
// Idempotente — pula creatives que ja tem copy.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const result = await seedCopiesForCollection(slug);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
