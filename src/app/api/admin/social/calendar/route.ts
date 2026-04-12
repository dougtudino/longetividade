import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingDates, getDatesForMonth, COMMEMORATIVE_DATES } from "@/lib/social-calendar-dates";

// GET /api/admin/social/calendar?days=30&month=4
// Retorna: posts agendados + datas comemorativas proximas + sugestoes
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") ?? "30", 10);
  const month = url.searchParams.get("month")
    ? parseInt(url.searchParams.get("month")!, 10)
    : undefined;

  try {
    // Posts agendados pros proximos N dias
    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const scheduledPosts = await prisma.socialPost.findMany({
      where: {
        scheduledAt: { gte: now, lte: endDate },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Datas comemorativas proximas
    const upcomingDates = getUpcomingDates(days);

    // Datas do mes (se pedido)
    const monthDates = month ? getDatesForMonth(month) : [];

    // Calendario: agrupa posts por data
    const calendarMap: Record<string, {
      posts: typeof scheduledPosts;
      commemorative: typeof upcomingDates;
    }> = {};

    for (const post of scheduledPosts) {
      const dateKey = post.scheduledAt!.toISOString().slice(0, 10);
      if (!calendarMap[dateKey]) calendarMap[dateKey] = { posts: [], commemorative: [] };
      calendarMap[dateKey].posts.push(post);
    }

    for (const cd of upcomingDates) {
      if (!calendarMap[cd.fullDate]) calendarMap[cd.fullDate] = { posts: [], commemorative: [] };
      calendarMap[cd.fullDate].commemorative.push(cd);
    }

    // Dias sem conteudo (gaps)
    const gaps: string[] = [];
    for (let i = 0; i < Math.min(days, 14); i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      // Seg-Sab (0=dom, 6=sab) — domingo e OFF
      if (dayOfWeek !== 0 && !calendarMap[key]?.posts.length) {
        gaps.push(key);
      }
    }

    return NextResponse.json({
      ok: true,
      calendar: calendarMap,
      upcomingDates,
      monthDates,
      totalScheduled: scheduledPosts.length,
      gaps,
      totalDatesYear: COMMEMORATIVE_DATES.length,
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      calendar: {},
      upcomingDates: getUpcomingDates(days),
      gaps: [],
      warning: (e as Error).message,
    });
  }
}
