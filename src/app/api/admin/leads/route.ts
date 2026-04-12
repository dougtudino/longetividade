import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leads?status=all|new|d2|d5|done
// Lista leads com metadata enriquecida pra dashboard email marketing
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const stepFilter = url.searchParams.get("step");

    const where: Record<string, unknown> = {};
    if (stepFilter === "new") where.sequenceStep = 0;
    else if (stepFilter === "d2") where.sequenceStep = 1;
    else if (stepFilter === "d5") where.sequenceStep = 2;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Stats agregadas
    const total = await prisma.lead.count();
    const byStep = await prisma.lead.groupBy({
      by: ["sequenceStep"],
      _count: true,
    });
    const stepCounts: Record<number, number> = {};
    for (const s of byStep) stepCounts[s.sequenceStep] = s._count;

    // Quantos leads viraram compradores (tem Order aprovada com mesmo email)
    let converted = 0;
    try {
      const leadEmails = leads.map((l) => l.email);
      if (leadEmails.length > 0) {
        const buyers = await prisma.order.findMany({
          where: { email: { in: leadEmails }, status: "approved" },
          select: { email: true },
        });
        converted = new Set(buyers.map((b) => b.email)).size;
      }
    } catch {
      /* silent */
    }

    // Abandonos
    let abandonedTotal = 0;
    let abandonedToday = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      abandonedTotal = await prisma.abandonedCheckout.count();
      abandonedToday = await prisma.abandonedCheckout.count({
        where: { createdAt: { gte: today } },
      });
    } catch {
      /* silent */
    }

    return NextResponse.json({
      ok: true,
      leads,
      stats: {
        total,
        step0_welcome: stepCounts[0] ?? 0,
        step1_d2: stepCounts[1] ?? 0,
        step2_d5: stepCounts[2] ?? 0,
        converted,
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
        abandonedTotal,
        abandonedToday,
      },
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      leads: [],
      stats: {
        total: 0, step0_welcome: 0, step1_d2: 0, step2_d5: 0,
        converted: 0, conversionRate: "0",
        abandonedTotal: 0, abandonedToday: 0,
      },
      warning: (e as Error).message,
    });
  }
}
