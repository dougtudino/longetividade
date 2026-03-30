import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email(),
  plan: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.abandonedCheckout.create({
      data: {
        email: parsed.data.email,
        plan: parsed.data.plan ?? null,
        step: "checkout",
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error: unknown) {
    console.error("Abandoned checkout error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
