import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingDates, getDatesForMonth, COMMEMORATIVE_DATES, MOVABLE_DATES } from "@/lib/social-calendar-dates";

// GET /api/admin/social/calendar?month=YYYY-MM  (default: mes atual)
// GET /api/admin/social/calendar?days=30         (modo legado: proximos N dias)
//
// Retorna:
//   - calendar: mapa dateKey -> { posts, commemorative }
//   - posts completos (includes status=posted/approved/draft/review)
//   - gaps (dias uteis sem post aprovado/publicado)
//   - upcomingDates (commem proximos dias ou do mes)
//   - totals: { total, posted, approved, draft, review, likes, reach }
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month"); // "2026-04"
  const daysParam = url.searchParams.get("days");

  try {
    const now = new Date();
    let from: Date;
    let to: Date;
    let monthMode = false;
    let monthNum: number | undefined;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      monthMode = true;
      const [yy, mm] = monthParam.split("-").map(Number);
      monthNum = mm;
      from = new Date(yy, mm - 1, 1, 0, 0, 0, 0);
      to = new Date(yy, mm, 0, 23, 59, 59, 999); // ultimo dia do mes
    } else {
      const days = parseInt(daysParam ?? "30", 10);
      from = now;
      to = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Todos os posts no intervalo — incluindo posted (executado)
    const posts = await prisma.socialPost.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Datas comemorativas — se mode mes, pega fixas do mes + moveis do ano que caem no mes
    let upcomingDates: ReturnType<typeof getUpcomingDates>;
    if (monthMode && monthNum) {
      const yy = from.getFullYear();
      const fixed = getDatesForMonth(monthNum).map((d) => {
        const day = Number(d.date.split("-")[1]);
        const fullDate = new Date(yy, monthNum! - 1, day).toISOString().slice(0, 10);
        return { ...d, fullDate };
      });
      const movable = MOVABLE_DATES
        .map((m) => {
          const mmdd = m.compute(yy);
          const mon = Number(mmdd.split("-")[0]);
          if (mon !== monthNum) return null;
          const { compute: _c, dateId: _id, ...rest } = m;
          void _c; void _id;
          return { ...rest, date: mmdd, fullDate: `${yy}-${mmdd}` };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      upcomingDates = [...fixed, ...movable].sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    } else {
      const days = parseInt(daysParam ?? "30", 10);
      upcomingDates = getUpcomingDates(days);
    }

    // Agrupa por data
    const calendarMap: Record<string, {
      posts: typeof posts;
      commemorative: typeof upcomingDates;
    }> = {};

    for (const post of posts) {
      if (!post.scheduledAt) continue;
      const dateKey = post.scheduledAt.toISOString().slice(0, 10);
      if (!calendarMap[dateKey]) calendarMap[dateKey] = { posts: [], commemorative: [] };
      calendarMap[dateKey].posts.push(post);
    }
    for (const cd of upcomingDates) {
      if (!calendarMap[cd.fullDate]) calendarMap[cd.fullDate] = { posts: [], commemorative: [] };
      calendarMap[cd.fullDate].commemorative.push(cd);
    }

    // Gaps — dias uteis sem post "produtivo" (aprovado ou publicado)
    const gaps: string[] = [];
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    for (let i = 0; i < Math.min(totalDays, 40); i++) {
      const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
      if (d > to) break;
      const key = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      const productive = (calendarMap[key]?.posts ?? []).filter(
        (p) => p.status === "approved" || p.status === "posted",
      );
      if (dow !== 0 && productive.length === 0) {
        // So marca gap pra dias passados/futuros no range (nao pra dias pre-range)
        gaps.push(key);
      }
    }

    // Totalizadores
    type EngagementRecord = { platform?: string; reach?: number; impressions?: number; likes?: number; comments?: number };
    let totalLikes = 0;
    let totalReach = 0;
    let topPost: { id: string; title: string; likes: number } | null = null;
    const byStatus: Record<string, number> = { draft: 0, review: 0, approved: 0, posted: 0, rejected: 0 };

    for (const p of posts) {
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
      if (p.status !== "posted" || !p.engagementData) continue;

      const eng = Array.isArray(p.engagementData) ? (p.engagementData as EngagementRecord[]) : [];
      let postLikes = 0;
      let postReach = 0;
      for (const e of eng) {
        if (typeof e?.likes === "number") postLikes += e.likes;
        if (typeof e?.reach === "number") postReach += e.reach;
        else if (typeof e?.impressions === "number") postReach += e.impressions;
      }
      totalLikes += postLikes;
      totalReach += postReach;
      if (!topPost || postLikes > topPost.likes) {
        topPost = { id: p.id, title: p.title, likes: postLikes };
      }
    }

    const totals = {
      total: posts.length,
      draft: byStatus.draft,
      review: byStatus.review,
      approved: byStatus.approved,
      posted: byStatus.posted,
      rejected: byStatus.rejected,
      likes: totalLikes,
      reach: totalReach,
      topPost,
      postedRate: posts.length > 0 ? Math.round((byStatus.posted / posts.length) * 100) : 0,
    };

    return NextResponse.json({
      ok: true,
      mode: monthMode ? "month" : "days",
      month: monthParam ?? null,
      range: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
      calendar: calendarMap,
      upcomingDates,
      totalScheduled: posts.length,
      gaps,
      totalDatesYear: COMMEMORATIVE_DATES.length + MOVABLE_DATES.length,
      totals,
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      calendar: {},
      upcomingDates: [],
      gaps: [],
      totals: { total: 0, draft: 0, review: 0, approved: 0, posted: 0, rejected: 0, likes: 0, reach: 0, topPost: null, postedRate: 0 },
      warning: (e as Error).message,
    });
  }
}
