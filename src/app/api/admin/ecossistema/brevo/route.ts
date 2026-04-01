import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "BREVO_API_KEY not configured" }, { status: 503 });
  }

  const headers = { "api-key": apiKey, Accept: "application/json" };

  try {
    const now = new Date();
    const endDate = now.toISOString().slice(0, 10);
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [listsRes, statsRes] = await Promise.all([
      fetch("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0", { headers }),
      fetch(`https://api.brevo.com/v3/smtp/statistics/aggregatedReport?startDate=${startDate}&endDate=${endDate}`, { headers }),
    ]);

    const listsData = listsRes.ok ? await listsRes.json() : { lists: [] };
    const statsData = statsRes.ok ? await statsRes.json() : null;

    return NextResponse.json({
      lists: (listsData.lists || []).map((l: { id: number; name: string; totalSubscribers: number }) => ({
        id: l.id,
        name: l.name,
        totalSubscribers: l.totalSubscribers,
      })),
      emailStats: statsData,
    });
  } catch (error) {
    console.error("Brevo API error:", error);
    return NextResponse.json({ error: "Failed to fetch Brevo data" }, { status: 500 });
  }
}
