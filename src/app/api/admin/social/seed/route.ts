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
    const existingTitles = new Set(
      (
        await prisma.socialPost.findMany({
          where: { title: { in: CONTENT_BANK.map((t) => t.title) } },
          select: { title: true },
        })
      ).map((p) => p.title),
    );

    for (const tmpl of CONTENT_BANK) {
      if (existingTitles.has(tmpl.title)) {
        skipped += 1;
        continue;
      }

      const dayOffset = created * 2;
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset + 1);
      scheduledDate.setHours(12, 0, 0, 0);

      const slot = tmpl.format === "reels" ? "REEL" : tmpl.format === "stories" ? "STORY" : "FEED_AM";

      await prisma.socialPost.create({
        data: {
          title: tmpl.title,
          content: tmpl.content,
          platform: tmpl.platform,
          format: tmpl.format,
          pillar: tmpl.pillar,
          slot,
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
