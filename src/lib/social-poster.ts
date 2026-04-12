// Auto-posting pra Facebook Page + Instagram via Graph API.
//
// Facebook: POST /{page_id}/photos (com imagem) ou /{page_id}/feed (sem)
// Instagram: POST /{ig_user_id}/media + /{ig_user_id}/media_publish
//
// Requer Page Access Token com:
//   - pages_manage_posts (pra Facebook)
//   - instagram_content_publish (pra Instagram)
//   - instagram_basic (pra pegar IG user ID)
//
// Credenciais lidas de AppSetting:
//   - SOCIAL_PAGE_TOKEN (Page Access Token com permissoes)
//   - META_PAGE_ID (ja existe)
//   - INSTAGRAM_ACCOUNT_ID (ig user id, obtido via API)

import { getSetting } from "./settings";

const GRAPH = "https://graph.facebook.com/v21.0";

type PostResult = {
  ok: boolean;
  platform: string;
  postId?: string;
  error?: string;
};

async function getPageToken(): Promise<string | null> {
  return (
    process.env.SOCIAL_PAGE_TOKEN ||
    (await getSetting("SOCIAL_PAGE_TOKEN")) ||
    null
  );
}

async function getPageId(): Promise<string | null> {
  return (
    (await getSetting("META_PAGE_ID")) ||
    process.env.META_PAGE_ID ||
    null
  );
}

async function getInstagramId(): Promise<string | null> {
  return (
    (await getSetting("INSTAGRAM_ACCOUNT_ID")) ||
    process.env.INSTAGRAM_ACCOUNT_ID ||
    null
  );
}

// ─── Facebook Page Post ──────────────────────────────────

export async function postToFacebook(
  message: string,
  imageUrl?: string
): Promise<PostResult> {
  const token = await getPageToken();
  const pageId = await getPageId();

  if (!token || !pageId) {
    return {
      ok: false,
      platform: "facebook",
      error: "SOCIAL_PAGE_TOKEN ou META_PAGE_ID nao configurado em /admin/configuracoes",
    };
  }

  try {
    const endpoint = imageUrl
      ? `${GRAPH}/${pageId}/photos`
      : `${GRAPH}/${pageId}/feed`;

    const params = new URLSearchParams({
      access_token: token,
      message,
    });
    if (imageUrl) params.set("url", imageUrl);

    const res = await fetch(endpoint, {
      method: "POST",
      body: params,
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        ok: false,
        platform: "facebook",
        error: data.error?.error_user_msg ?? data.error?.message ?? `HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      platform: "facebook",
      postId: data.id ?? data.post_id,
    };
  } catch (e) {
    return { ok: false, platform: "facebook", error: (e as Error).message };
  }
}

// ─── Instagram Post ──────────────────────────────────────

// Instagram Content Publishing API (2 steps):
// 1. Create media container: POST /{ig_user_id}/media
// 2. Publish: POST /{ig_user_id}/media_publish
//
// Para feed posts: precisa de image_url (URL publica da imagem)
// Para carrosseis: precisa de children (array de media containers)

export async function postToInstagram(
  caption: string,
  imageUrl: string
): Promise<PostResult> {
  const token = await getPageToken();
  const igId = await getInstagramId();

  if (!token || !igId) {
    return {
      ok: false,
      platform: "instagram",
      error: "SOCIAL_PAGE_TOKEN ou INSTAGRAM_ACCOUNT_ID nao configurado",
    };
  }

  try {
    // Step 1: Create media container
    const createParams = new URLSearchParams({
      access_token: token,
      caption,
      image_url: imageUrl,
    });

    const createRes = await fetch(`${GRAPH}/${igId}/media`, {
      method: "POST",
      body: createParams,
      cache: "no-store",
    });
    const createData = await createRes.json();

    if (!createRes.ok || createData.error) {
      return {
        ok: false,
        platform: "instagram",
        error: createData.error?.error_user_msg ?? createData.error?.message ?? "Falha ao criar container",
      };
    }

    const containerId = createData.id;

    // Step 2: Publish
    const publishParams = new URLSearchParams({
      access_token: token,
      creation_id: containerId,
    });

    const publishRes = await fetch(`${GRAPH}/${igId}/media_publish`, {
      method: "POST",
      body: publishParams,
      cache: "no-store",
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      return {
        ok: false,
        platform: "instagram",
        error: publishData.error?.error_user_msg ?? publishData.error?.message ?? "Falha ao publicar",
      };
    }

    return {
      ok: true,
      platform: "instagram",
      postId: publishData.id,
    };
  } catch (e) {
    return { ok: false, platform: "instagram", error: (e as Error).message };
  }
}

// ─── Descobrir Instagram Account ID ──────────────────────

// O IG Account ID vem vinculado a Page. Busca via:
// GET /{page_id}?fields=instagram_business_account
export async function discoverInstagramId(): Promise<{
  ok: boolean;
  igId?: string;
  error?: string;
}> {
  const token = await getPageToken();
  const pageId = await getPageId();

  if (!token || !pageId) {
    return { ok: false, error: "Token ou Page ID ausente" };
  }

  try {
    const res = await fetch(
      `${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.instagram_business_account?.id) {
      return { ok: true, igId: data.instagram_business_account.id };
    }

    return {
      ok: false,
      error: "Instagram Business Account nao vinculado a esta Page. Vincule em Business Suite → Instagram.",
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─── Post em ambas plataformas ───────────────────────────

export async function postToAll(
  message: string,
  imageUrl?: string
): Promise<PostResult[]> {
  const results: PostResult[] = [];

  // Facebook (sempre tenta)
  const fbResult = await postToFacebook(message, imageUrl);
  results.push(fbResult);

  // Instagram (so se tiver imagem — IG exige)
  if (imageUrl) {
    const igResult = await postToInstagram(message, imageUrl);
    results.push(igResult);
  }

  return results;
}
