import { NextRequest, NextResponse } from "next/server";
import { getLauncherCreds } from "@/lib/meta-launcher";

// GET /api/admin/campaigns/meta-interests/search?q=emagrec
//
// Wrapper pra Meta Graph Targeting Search API. Retorna IDs de interesse
// validos pra conta do usuario — Meta mantem banco proprio que evolui
// ao longo do tempo. IDs de treinamento de LLM ficam defasados.
//
// Referencia: https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search

const GRAPH_API_VERSION = "v21.0";

type MetaInterestHit = {
  id: string;
  name: string;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  path?: string[];
  topic?: string;
};

type NormalizedHit = {
  id: string;
  name: string;
  audienceSize: number | null;
  path: string | null;
  topic: string | null;
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ ok: true, results: [], hint: "min 2 chars" });
  }

  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "Credenciais Meta nao configuradas" },
      { status: 400 }
    );
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/search`);
  url.searchParams.set("type", "adinterest");
  url.searchParams.set("q", q);
  url.searchParams.set("locale", "pt_BR");
  url.searchParams.set("limit", "15");
  url.searchParams.set("access_token", creds.token);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = (await res.json()) as
      | { data: MetaInterestHit[] }
      | { error: { message: string; code?: number } };

    if (!res.ok || "error" in data) {
      const message =
        "error" in data ? data.error.message : `HTTP ${res.status}`;
      return NextResponse.json(
        { ok: false, error: `Meta Graph: ${message}` },
        { status: res.status === 401 ? 401 : 502 }
      );
    }

    const results: NormalizedHit[] = (data.data ?? []).map((h) => ({
      id: h.id,
      name: h.name,
      audienceSize:
        h.audience_size_lower_bound && h.audience_size_upper_bound
          ? Math.round(
              (h.audience_size_lower_bound + h.audience_size_upper_bound) / 2
            )
          : null,
      path: h.path && h.path.length > 0 ? h.path.join(" > ") : null,
      topic: h.topic ?? null,
    }));

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
