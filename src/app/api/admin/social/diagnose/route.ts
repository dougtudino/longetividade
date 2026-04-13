import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

// GET /api/admin/social/diagnose
// Diagnostico completo do fluxo de postagem da Luna.
// Valida tudo que precisa estar OK pra auto-posting funcionar.

const GRAPH = "https://graph.facebook.com/v21.0";

type Check = {
  ok: boolean;
  label: string;
  detail: string;
  action?: string; // o que fazer se nao estiver ok
};

async function graphGet(path: string, token: string): Promise<{ ok: boolean; data: unknown; status: number }> {
  try {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(
      `${GRAPH}${path}${sep}access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return { ok: res.ok, data, status: res.status };
  } catch (e) {
    return { ok: false, data: { error: (e as Error).message }, status: 0 };
  }
}

type PermEntry = { permission: string; status: string };
type TokenDebug = { scopes?: string[]; expires_at?: number };

export async function GET() {
  const checks: Check[] = [];

  // 1. Token configurado?
  const pageToken =
    process.env.SOCIAL_PAGE_TOKEN ||
    (await getSetting("SOCIAL_PAGE_TOKEN")) ||
    null;

  checks.push({
    ok: !!pageToken && pageToken.length > 20,
    label: "Page Access Token",
    detail: pageToken
      ? `Configurado (${pageToken.slice(0, 12)}...)`
      : "Ausente",
    action: pageToken
      ? undefined
      : "Adicione SOCIAL_PAGE_TOKEN em /admin/configuracoes",
  });

  // 2. Page ID configurado?
  const pageId =
    (await getSetting("META_PAGE_ID")) || process.env.META_PAGE_ID || null;
  checks.push({
    ok: !!pageId,
    label: "Meta Page ID",
    detail: pageId || "Ausente",
    action: pageId ? undefined : "Adicione META_PAGE_ID em /admin/configuracoes",
  });

  // 3. Instagram Account ID?
  const igId =
    (await getSetting("INSTAGRAM_ACCOUNT_ID")) ||
    process.env.INSTAGRAM_ACCOUNT_ID ||
    null;
  checks.push({
    ok: !!igId,
    label: "Instagram Business Account ID",
    detail: igId || "Ausente",
    action: igId
      ? undefined
      : "Use o botao 'Descobrir IG ID' em /admin/social-media",
  });

  // So continua checks online se tem token
  if (!pageToken) {
    return NextResponse.json({
      ok: false,
      score: `${checks.filter((c) => c.ok).length}/${checks.length}`,
      checks,
      summary: "Token ausente — configure antes de continuar",
    });
  }

  // 4. Token valido? (chama /me)
  const meRes = await graphGet("/me?fields=id,name", pageToken);
  const meData = meRes.data as { id?: string; name?: string; error?: { message: string } };
  checks.push({
    ok: meRes.ok && !!meData.id,
    label: "Token valido (Graph /me)",
    detail: meRes.ok
      ? `${meData.name ?? "?"} (id ${meData.id ?? "?"})`
      : meData.error?.message ?? `HTTP ${meRes.status}`,
    action: meRes.ok
      ? undefined
      : "Token invalido ou expirado — gere novo no Graph API Explorer",
  });

  // 5. Permissoes do token
  const permRes = await graphGet("/me/permissions", pageToken);
  const permData = permRes.data as { data?: PermEntry[] };
  const granted = (permData.data ?? [])
    .filter((p) => p.status === "granted")
    .map((p) => p.permission);

  const needed = [
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
  ];
  const missing = needed.filter((n) => !granted.includes(n));
  checks.push({
    ok: missing.length === 0,
    label: "Permissoes do token",
    detail:
      missing.length === 0
        ? `Todas presentes: ${granted.filter((g) => needed.includes(g)).join(", ")}`
        : `Faltam: ${missing.join(", ")}`,
    action:
      missing.length === 0
        ? undefined
        : "Adicione essas permissoes ao App Facebook e gere novo token",
  });

  // 6. Token long-lived?
  const debugRes = await graphGet(
    `/debug_token?input_token=${encodeURIComponent(pageToken)}`,
    pageToken
  );
  const debugData = debugRes.data as { data?: TokenDebug };
  const expiresAt = debugData.data?.expires_at ?? 0;
  const daysLeft = expiresAt
    ? Math.floor((expiresAt * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
    : -1;
  checks.push({
    ok: expiresAt === 0 || daysLeft > 7,
    label: "Validade do token",
    detail:
      expiresAt === 0
        ? "Token nao expira (long-lived)"
        : daysLeft > 0
        ? `Expira em ${daysLeft} dias`
        : "Expirado ou invalido",
    action:
      daysLeft >= 0 && daysLeft <= 7
        ? "Gere novo token long-lived antes de expirar"
        : undefined,
  });

  // 7. IG vinculado a Page?
  if (pageId) {
    const linkRes = await graphGet(
      `/${pageId}?fields=instagram_business_account`,
      pageToken
    );
    const linkData = linkRes.data as {
      instagram_business_account?: { id: string };
    };
    const linkedIg = linkData.instagram_business_account?.id;
    checks.push({
      ok: !!linkedIg,
      label: "IG Business vinculado a Page",
      detail: linkedIg
        ? `Vinculado (id ${linkedIg})${igId && linkedIg !== igId ? " — ATENCAO: diferente do INSTAGRAM_ACCOUNT_ID salvo" : ""}`
        : "Nao vinculado",
      action: linkedIg
        ? undefined
        : "Vincule conta IG Business a Page no Business Suite",
    });
  }

  // 8. Posts "approved" prontos pra postar
  const approvedTotal = await prisma.socialPost.count({
    where: { status: "approved" },
  });
  const approvedWithImage = await prisma.socialPost.count({
    where: { status: "approved", imageUrl: { not: null } },
  });
  const approvedScheduledPast = await prisma.socialPost.count({
    where: {
      status: "approved",
      scheduledAt: { lte: new Date() },
    },
  });

  checks.push({
    ok: approvedTotal > 0,
    label: "Posts aprovados no banco",
    detail: `${approvedTotal} aprovados (${approvedWithImage} com imagem, ${approvedScheduledPast} com scheduledAt vencida)`,
    action:
      approvedTotal === 0
        ? "Aprove posts em /admin/social-media ou rode cron social-generate"
        : approvedWithImage === 0
        ? "Adicione imageUrl aos posts pra funcionar no Instagram"
        : undefined,
  });

  // 9. CRON_SECRET (pro auto-post rodar)
  checks.push({
    ok: !!process.env.CRON_SECRET,
    label: "CRON_SECRET (auto-post scheduler)",
    detail: process.env.CRON_SECRET
      ? "Configurado"
      : "Ausente — auto-post nao roda",
    action: process.env.CRON_SECRET
      ? undefined
      : "Adicione CRON_SECRET nas env vars Railway",
  });

  const okCount = checks.filter((c) => c.ok).length;
  const canPostFacebook =
    checks.find((c) => c.label === "Token valido (Graph /me)")?.ok &&
    checks.find((c) => c.label === "Meta Page ID")?.ok &&
    granted.includes("pages_manage_posts");

  const canPostInstagram =
    canPostFacebook &&
    checks.find((c) => c.label === "Instagram Business Account ID")?.ok &&
    granted.includes("instagram_content_publish");

  return NextResponse.json({
    ok: okCount === checks.length,
    score: `${okCount}/${checks.length}`,
    summary: {
      canPostFacebook: !!canPostFacebook,
      canPostInstagram: !!canPostInstagram,
      approvedReady: approvedWithImage,
    },
    checks,
    nextSteps:
      okCount === checks.length
        ? "Tudo pronto! Pode rodar POST /api/admin/social/diagnose?test=1 pra postar 1 post real de teste."
        : "Resolva os itens com action antes de tentar postar.",
  });
}

// POST /api/admin/social/diagnose?test=1
// Pega o 1o post approved com imageUrl e publica AGORA (teste real).
export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("test") !== "1") {
    return NextResponse.json(
      { ok: false, error: "Use ?test=1 pra confirmar postagem de teste real" },
      { status: 400 }
    );
  }

  const { postToAll } = await import("@/lib/social-poster");

  const post = await prisma.socialPost.findFirst({
    where: { status: "approved", imageUrl: { not: null } },
    orderBy: { createdAt: "asc" },
  });

  if (!post) {
    return NextResponse.json({
      ok: false,
      error: "Nenhum post 'approved' com imageUrl encontrado",
    });
  }

  const message = post.content + (post.hashtags ? "\n\n" + post.hashtags : "");
  const results = await postToAll(message, post.imageUrl ?? undefined);
  const anySuccess = results.some((r) => r.ok);

  if (anySuccess) {
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: "posted",
        postedAt: new Date(),
        engagementData: JSON.parse(JSON.stringify(results)),
      },
    });
  }

  return NextResponse.json({
    ok: anySuccess,
    postId: post.id,
    title: post.title,
    results,
    message: anySuccess
      ? "Post publicado! Verifique no Facebook/Instagram."
      : "Falha — veja results pra detalhes do erro.",
  });
}
