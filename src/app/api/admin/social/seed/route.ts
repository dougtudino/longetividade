import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTENT_BANK } from "@/lib/social-content-bank";

// POST /api/admin/social/seed
// Popula o banco com os 10 posts pre-escritos do content bank.
// Idempotente: skip posts com mesmo titulo.
export async function POST() {
  let created = 0;
  let skipped = 0;

  try {
    for (const tmpl of CONTENT_BANK) {
      const existing = await prisma.socialPost.findFirst({
        where: { title: tmpl.title },
      });
      if (existing) {
        skipped += 1;
        continue;
      }

      // Agenda posts distribuidos nos proximos 14 dias
      const dayOffset = created * 2; // 1 post a cada 2 dias
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset + 1);
      scheduledDate.setHours(12, 0, 0, 0); // meio-dia BRT

      await prisma.socialPost.create({
        data: {
          title: tmpl.title,
          content: tmpl.content,
          platform: tmpl.platform,
          format: tmpl.format,
          pillar: tmpl.pillar,
          hashtags: tmpl.hashtags,
          imageBriefing: tmpl.imageBriefing,
          status: "draft",
          scheduledAt: scheduledDate,
        },
      });
      created += 1;
    }

    return NextResponse.json({
      ok: true,
      total: CONTENT_BANK.length,
      created,
      skipped,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: (e as Error).message,
      created,
      skipped,
    });
  }
}
