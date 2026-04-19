// Cliente Blotato — publish/schedule + AI image/video via templates.
// Docs: https://help.blotato.com/api/start
//
// Auth: header `blotato-api-key: <KEY>`
// Base: https://backend.blotato.com/v2
// Rate: 30/min posts, 60/min polling, 120/min uploads
//
// Envs:
//   BLOTATO_API_KEY — a key do dashboard (obrigatoria)
//   META_PAGE_ID    — reaproveitado pra target.pageId no Facebook

import { getSetting } from "./settings";

const BASE = "https://backend.blotato.com/v2";

// ─── Source Resolutions (extrair conteudo de URL/texto/perplexity) ──
// POST /v2/source-resolutions-v3
// sourceType: text | article | youtube | twitter | tiktok | perplexity-query | audio | pdf

export type BlotatoSourceType =
  | "text"
  | "article"
  | "youtube"
  | "twitter"
  | "tiktok"
  | "perplexity-query"
  | "audio"
  | "pdf";

export interface ResolveSourceInput {
  sourceType: BlotatoSourceType;
  url?: string; // pra youtube, tiktok, article, pdf, audio, twitter
  text?: string; // pra text, perplexity-query
  customInstructions?: string;
}

export interface SourceResolution {
  id: string;
  status?: "queued" | "processing" | "completed" | "failed" | string;
  content?: string;
  title?: string;
}

export class BlotatoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

async function getApiKey(): Promise<string> {
  const key = process.env.BLOTATO_API_KEY || (await getSetting("BLOTATO_API_KEY"));
  if (!key) throw new BlotatoError("BLOTATO_API_KEY nao configurada", 500);
  return key;
}

async function request<T>(
  path: string,
  init: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {},
): Promise<T> {
  const key = await getApiKey();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "blotato-api-key": key,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    // mantem texto cru
  }
  if (!res.ok) {
    const msg = typeof body === "object" && body && "message" in body ? String((body as { message: unknown }).message) : text;
    throw new BlotatoError(`Blotato ${res.status}: ${msg}`, res.status, body);
  }
  return body as T;
}

export async function resolveSource(
  input: ResolveSourceInput
): Promise<SourceResolution> {
  const body: Record<string, unknown> = {
    source: {
      sourceType: input.sourceType,
      ...(input.url ? { url: input.url } : {}),
      ...(input.text ? { text: input.text } : {}),
    },
    ...(input.customInstructions
      ? { customInstructions: input.customInstructions }
      : {}),
  };
  return request<SourceResolution>("/source-resolutions-v3", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getSourceResolution(id: string): Promise<SourceResolution> {
  return request<SourceResolution>(`/source-resolutions-v3/${id}`, { method: "GET" });
}

// Polling ate completed
export async function waitForSourceResolution(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<SourceResolution> {
  const interval = opts.intervalMs ?? 3000;
  const timeout = opts.timeoutMs ?? 2 * 60_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await getSourceResolution(id);
    if (r.status === "completed") return r;
    if (r.status === "failed") {
      throw new BlotatoError(`source ${id} falhou`, 500, r);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new BlotatoError(`source ${id} timeout`, 504);
}

// ─── Accounts ──────────────────────────────────────────

export interface BlotatoAccount {
  id: string;
  platform: "instagram" | "facebook" | "tiktok" | "youtube" | "threads" | "linkedin" | "twitter" | "pinterest" | "bluesky";
  fullname?: string;
  username?: string;
}

export async function listAccounts(): Promise<BlotatoAccount[]> {
  const res = await request<{ items?: BlotatoAccount[]; accounts?: BlotatoAccount[] } | BlotatoAccount[]>(
    "/users/me/accounts",
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.items ?? res.accounts ?? [];
}

// ─── Media upload (presigned) ──────────────────────────

export interface PresignedUpload {
  presignedUrl: string;
  publicUrl: string;
}

export async function createPresignedUpload(filename: string): Promise<PresignedUpload> {
  return request<PresignedUpload>("/media/uploads", {
    method: "POST",
    body: JSON.stringify({ filename }),
  });
}

export async function uploadToPresigned(
  presignedUrl: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: data as unknown as BodyInit,
  });
  if (!res.ok) {
    throw new BlotatoError(`upload PUT falhou: ${res.status}`, res.status);
  }
}

// ─── Templates + create visual (AI image/video) ────────

export interface BlotatoTemplate {
  id: string;
  name: string;
  type?: "image" | "video" | string;
  description?: string;
  inputs?: Record<string, unknown>;
  aspectRatio?: string;
  category?: string;
}

// Lista templates reais do plano. Aceita parametro fields pra filtrar payload.
export async function listTemplates(opts?: { fields?: string[] }): Promise<BlotatoTemplate[]> {
  const query = opts?.fields?.length ? `?fields=${opts.fields.join(",")}` : "";
  const res = await request<
    { items?: BlotatoTemplate[]; templates?: BlotatoTemplate[] } | BlotatoTemplate[]
  >(`/videos/templates${query}`, { method: "GET" });
  if (Array.isArray(res)) return res;
  return res.items ?? res.templates ?? [];
}

export interface CreateVisualInput {
  templateId: string;
  inputs?: Record<string, unknown>;
  prompt?: string;
  title?: string; // nome pro rastreio no dashboard Blotato
}

// Helper especifico pra carrossel multi-slide via inputs.quotes
// Descoberto via doc: template Quote Card Carousel aceita array `quotes`
// em inputs, gerando N slides reais de uma vez.
export interface CreateCarouselInput {
  templateId: string; // tipicamente Quote Card Carousel with Paper Background
  quotes: string[]; // 3-10 quotes curtas — 1 por slide
  title?: string;
  extraInputs?: Record<string, unknown>; // outros inputs especificos do template
}

// Voice padrao pro AI Video with AI Voice template.
// Catalog completo de vozes em help.blotato.com/api/voice-ids
// Pra Longetividade (mulher 35-55 acolhedora):
//   - Matilda (American friendly narration, middle-aged)
//   - Lily (British warm narration, middle-aged)
//   - Sarah (American soft news, young)
// Default = Matilda (mais alinhada ao tom).
export const DEFAULT_VOICE_NAME = "Matilda";

// AI Video with AI Voice — narracao + cenas multiplas.
// Diferente do AI Selfie Talking (que precisa avatar pre-setup), esse
// gera voiceover + imagens AI por cena. Funciona com texto puro.
export interface AiVideoScene {
  mediaSource: string; // prompt visual da cena (em ingles)
  script: string; // narracao (PT funciona)
}

export interface CreateAiVideoInput {
  templateId: string; // tipicamente AI Video AI Voice 5903fe43
  scenes: AiVideoScene[];
  voiceName?: string; // default Matilda
  aspectRatio?: "9:16" | "1:1" | "4:5";
  title?: string;
}

export async function createAiVideo(
  input: CreateAiVideoInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(`[blotato] createAiVideo raw="${input.templateId}" → "${templateId}" scenes=${input.scenes.length}`);
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          scenes: input.scenes,
          voiceName: input.voiceName ?? DEFAULT_VOICE_NAME,
          aspectRatio: input.aspectRatio ?? "9:16",
          trimToVoiceover: true,
        },
        isDraft: false,
        render: true,
        ...(input.title ? { title: input.title } : {}),
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `AiVideo 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

// Talking head — AI Selfie Talking (consistent character).
// Aceita scenes[] (description visual + narration verbal) + characterDescription
// (texto OU URL de imagem referencia). Se passar so texto, Blotato gera
// avatar consistente pelas cenas baseado na descricao.
export interface TalkingHeadScene {
  description: string; // descricao visual da cena (em ingles, da pra Blotato)
  narration: string; // texto que a personagem fala (portugues OK)
}

export interface CreateTalkingHeadInput {
  templateId: string; // tipicamente AI Selfie Talking 57f5a565
  scenes: TalkingHeadScene[];
  characterDescription: string; // descricao textual da personagem OU URL imagem
  style?: "realistic" | "cartoon" | "anime" | "watercolor" | "oil-painting" | "sketch" | "cyberpunk" | "fantasy" | "minimalist";
  aspectRatio?: "9:16" | "1:1" | "4:5";
  title?: string;
}

export async function createTalkingHead(
  input: CreateTalkingHeadInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createTalkingHead raw="${input.templateId}" → "${templateId}" scenes=${input.scenes.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          scenes: input.scenes,
          characterDescription: input.characterDescription,
          style: input.style ?? "realistic",
          aspectRatio: input.aspectRatio ?? "9:16",
        },
        ...(input.title ? { title: input.title } : {}),
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `TalkingHead 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

// Slideshow de imagens com texto por slide — cada slide tem imagePrompt
// (Blotato gera via AI) + textOverlay. Template: Image Slideshow with Text.
// Output: mp4 animado com N cenas distintas, cada uma com imagem real.
export interface SlideshowSlide {
  imagePrompt: string; // prompt pra AI gerar a cena
  textOverlay: string; // texto sobreposto (< 40 chars ideal)
}

export interface CreateImageSlideshowInput {
  templateId: string;
  slides: SlideshowSlide[];
  title?: string;
  textPosition?: "top" | "center" | "bottom";
  textColor?: string;
  aspectRatio?: "16:9" | "1:1" | "4:5" | "9:16"; // FEED=1:1, STORY/REEL=9:16
  useBrandKit?: boolean;
  textStyle?: "minimal" | "elegant" | "modern";
  slideDuration?: number; // 1-10s
}

export async function createImageSlideshow(
  input: CreateImageSlideshowInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createImageSlideshow raw="${input.templateId}" → normalized="${templateId}" slides=${input.slides.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          slides: input.slides.map((s) => ({
            imageSource: s.imagePrompt,
            imagePrompt: s.imagePrompt,
            textOverlay: s.textOverlay,
            text: s.textOverlay,
          })),
          ...(input.textPosition ? { textPosition: input.textPosition } : {}),
          ...(input.textColor ? { textColor: input.textColor } : {}),
          ...(input.textStyle ? { textStyle: input.textStyle } : {}),
          ...(input.slideDuration ? { slideDuration: input.slideDuration } : {}),
          aspectRatio: input.aspectRatio ?? "9:16",
        },
        isDraft: false,
        render: true,
        ...(input.useBrandKit ? { useBrandKit: true } : {}),
        ...(input.title ? { title: input.title } : {}),
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Slideshow 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export async function createCarousel(
  input: CreateCarouselInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createCarousel raw="${input.templateId}" → normalized="${templateId}" slides=${input.quotes.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          quotes: input.quotes,
          ...(input.extraInputs ?? {}),
        },
        ...(input.title ? { title: input.title } : {}),
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Carrossel 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

// Infographic Legacy — shape simples {description, footerText}.
// Templates: Newspaper, Breaking News, Billboard, Whiteboard, Chalkboard,
// Book Page, Trail Marker, TV Wall, Movie Theater, Graffiti, Bus Ad, etc.
// description: titulo principal (max 480 chars defensivo)
// footerText: rodape opcional (autor, fonte, CTA)
export interface CreateSimpleInfographicInput {
  templateId: string;
  description: string;
  footerText?: string;
  title?: string;
  aspectRatio?: "9:16" | "1:1" | "4:5" | "16:9";
}

export async function createSimpleInfographic(
  input: CreateSimpleInfographicInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  // Trunca defensivo — varios Legacy aceitam max 500 chars no description
  const description = input.description.slice(0, 480);
  const footerText = input.footerText?.slice(0, 120) ?? "";
  console.log(
    `[blotato] createSimpleInfographic raw="${input.templateId}" → "${templateId}" desc=${description.length}c footer=${footerText.length}c`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          description,
          ...(footerText ? { footerText } : {}),
          ...(input.aspectRatio ? { aspectRatio: input.aspectRatio } : {}),
        },
        isDraft: false,
        render: true,
        ...(input.title ? { title: input.title } : {}),
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Infographic 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export interface BlotatoCreation {
  id: string;
  status: "queueing" | "generating-media" | "done" | "failed" | string;
  imageUrls?: string[] | null;
  mediaUrl?: string | null;
  error?: string;
  createdAt?: string;
}

// Blotato respostas de creations vem envelopadas: { item: { ... } }
async function unwrap<T>(res: { item?: T } | T): Promise<T> {
  return (res && typeof res === "object" && "item" in res ? (res as { item: T }).item : res) as T;
}

// Blotato EXIGE path completo "/base/v2/<category>/<uuid>/v1" pra templates
// da biblioteca base. UUID puro retorna 404 (testado empiricamente).
// Doc publica diz "use UUID" — esta errada pro plano base.
//
// Mapeamento UUID → path completo pros templates conhecidos. Se vier UUID
// e existir mapeamento, converte. Se vier path, deixa passar.
// Mapeamento UUID → path. 2 namespaces:
// - Modernos: /base/v2/<category>/<uuid>/v1 (slideshow, video, ai-*)
// - Legacy infographics: /video-template/<uuid> (Newspaper, Billboard, etc)
const UUID_TO_PATH: Record<string, string> = {
  // ─── MODERNOS ────────────────────────────────────────
  "5903b592-1255-43b4-b9ac-f8ed7cbf6a5f": "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1",
  "0ddb8655-c3da-43da-9f7d-be1915ca7818": "/base/v2/images-with-text/0ddb8655-c3da-43da-9f7d-be1915ca7818/v1",
  "c9892c3b-fa75-4ade-821a-a50ff8456230": "/base/v2/images-with-text/c9892c3b-fa75-4ade-821a-a50ff8456230/v1",
  "3ed4bb92-dbfe-45e6-9dc8-605b77f70506": "/base/v2/images-with-text/3ed4bb92-dbfe-45e6-9dc8-605b77f70506/v1",
  "f941e306-76f7-45da-b3d9-7463af630e91": "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1",
  "77f65d2b-48cc-4adb-bfbb-5bc86f8c01bd": "/base/v2/quote-card/77f65d2b-48cc-4adb-bfbb-5bc86f8c01bd/v1",
  "ba413be6-a840-4e60-8fd6-0066d3b427df": "/base/v2/tweet-card/ba413be6-a840-4e60-8fd6-0066d3b427df/v1",
  "9714ae5c-7e6b-4878-be4a-4b1ba5d0cd66": "/base/v2/tweet-card/9714ae5c-7e6b-4878-be4a-4b1ba5d0cd66/v1",
  "53cfec04-2500-41cf-8cc1-ba670d2c341a": "/base/v2/instagram-carousel/53cfec04-2500-41cf-8cc1-ba670d2c341a/v1",
  "2491f97b-1b47-4efa-8b96-8c651fa7b3d5": "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1",
  "e095104b-e6c5-4a81-a89d-b0df3d7c5baf": "/base/v2/tutorial-carousel/e095104b-e6c5-4a81-a89d-b0df3d7c5baf/v1",
  "5903fe43-514d-40ee-a060-0d6628c5f8fd": "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1",
  "57f5a565-fd17-458b-be43-4a2d8ccaca75": "/base/v2/ai-selfie-video/57f5a565-fd17-458b-be43-4a2d8ccaca75/v1",
  "7c26a1cd-d5b3-42da-9c73-2413333873b3": "/base/v2/ai-avatar-broll/7c26a1cd-d5b3-42da-9c73-2413333873b3/v1",
  "c306ae43-1dcc-4f45-ac2b-88e75430ffd8": "/base/v2/combine-clips/c306ae43-1dcc-4f45-ac2b-88e75430ffd8/v1",
  // ─── LEGACY INFOGRAPHICS — todos shape {description, footerText} ──
  "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0": "/video-template/9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", // Single Centered Quote
  "013904bf-6b3b-43f4-bb1f-f1964a38c29b": "/video-template/013904bf-6b3b-43f4-bb1f-f1964a38c29b", // TV Wall
  "07a5b5c5-387c-49e3-86b1-de822cd2dfc7": "/video-template/07a5b5c5-387c-49e3-86b1-de822cd2dfc7", // Newspaper
  "8800be71-52df-4ac7-ac94-df9d8a494d0f": "/video-template/8800be71-52df-4ac7-ac94-df9d8a494d0f", // Breaking News
  "f8f1ebe4-a9f5-4ec8-be63-21214656cd4b": "/video-template/f8f1ebe4-a9f5-4ec8-be63-21214656cd4b", // Movie Theater
  "3598483b-c148-4276-a800-eede85c1c62f": "/video-template/3598483b-c148-4276-a800-eede85c1c62f", // Graffiti
  "f9c0e470-9288-4958-8cdd-64772ed93c05": "/video-template/f9c0e470-9288-4958-8cdd-64772ed93c05", // Bus Ad
  "76b3b959-bdbe-440d-8428-984219353f18": "/video-template/76b3b959-bdbe-440d-8428-984219353f18", // Billboard
  "d9495026-3945-44f6-8b44-07c28c492e6d": "/video-template/d9495026-3945-44f6-8b44-07c28c492e6d", // Classroom Chalkboard
  "ae868019-820d-434c-8fe1-74c9da99129a": "/video-template/ae868019-820d-434c-8fe1-74c9da99129a", // Whiteboard
  "fcd64907-b103-46f8-9f75-51b9d1a522f5": "/video-template/fcd64907-b103-46f8-9f75-51b9d1a522f5", // Chalkboard
  "29ebb2bd-02b7-4317-8bb8-c30eb938e47c": "/video-template/29ebb2bd-02b7-4317-8bb8-c30eb938e47c", // Trail Marker
  "5307053e-046b-4c9b-b1ca-38725d2ddcdd": "/video-template/5307053e-046b-4c9b-b1ca-38725d2ddcdd", // Constellation
  "49c61370-a706-4b82-98f7-62d557d1c66d": "/video-template/49c61370-a706-4b82-98f7-62d557d1c66d", // Manga
  "476f8920-8749-4ff7-9c91-470d54c3c03e": "/video-template/476f8920-8749-4ff7-9c91-470d54c3c03e", // T-Shirt
  "8fa8545e-8955-4a89-a868-cf45023d6cc5": "/video-template/8fa8545e-8955-4a89-a868-cf45023d6cc5", // Futuristic Flyer
  "b88c8273-6406-48c6-85e7-096119aefe30": "/video-template/b88c8273-6406-48c6-85e7-096119aefe30", // Book Page
  "7b7104f1-d277-4993-ad3a-e5883c4b776d": "/video-template/7b7104f1-d277-4993-ad3a-e5883c4b776d", // Steampunk
  "b8707b58-a106-44af-bb12-e30507e561af": "/video-template/b8707b58-a106-44af-bb12-e30507e561af", // Top Secret
  "a7b0d128-8478-4b34-9647-a0778b6517d0": "/video-template/a7b0d128-8478-4b34-9647-a0778b6517d0", // Egyptian
  "82ee75b6-597b-43a8-86bc-e4395e7c9c44": "/video-template/82ee75b6-597b-43a8-86bc-e4395e7c9c44", // Cave Painting
};

// Templates Legacy Infographics — todos aceitam shape {description, footerText}
export const LEGACY_INFOGRAPHIC_UUIDS = new Set([
  "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0",
  "013904bf-6b3b-43f4-bb1f-f1964a38c29b",
  "07a5b5c5-387c-49e3-86b1-de822cd2dfc7",
  "8800be71-52df-4ac7-ac94-df9d8a494d0f",
  "f8f1ebe4-a9f5-4ec8-be63-21214656cd4b",
  "3598483b-c148-4276-a800-eede85c1c62f",
  "f9c0e470-9288-4958-8cdd-64772ed93c05",
  "76b3b959-bdbe-440d-8428-984219353f18",
  "d9495026-3945-44f6-8b44-07c28c492e6d",
  "ae868019-820d-434c-8fe1-74c9da99129a",
  "fcd64907-b103-46f8-9f75-51b9d1a522f5",
  "29ebb2bd-02b7-4317-8bb8-c30eb938e47c",
  "5307053e-046b-4c9b-b1ca-38725d2ddcdd",
  "49c61370-a706-4b82-98f7-62d557d1c66d",
  "476f8920-8749-4ff7-9c91-470d54c3c03e",
  "8fa8545e-8955-4a89-a868-cf45023d6cc5",
  "b88c8273-6406-48c6-85e7-096119aefe30",
  "7b7104f1-d277-4993-ad3a-e5883c4b776d",
  "b8707b58-a106-44af-bb12-e30507e561af",
  "a7b0d128-8478-4b34-9647-a0778b6517d0",
  "82ee75b6-597b-43a8-86bc-e4395e7c9c44",
]);

export function isLegacyInfographicTemplate(templateId: string): boolean {
  for (const uuid of LEGACY_INFOGRAPHIC_UUIDS) {
    if (templateId === uuid || templateId.includes(uuid)) return true;
  }
  return false;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeTemplateId(raw: string): string {
  const trimmed = raw.trim();
  // Se ja eh path, deixa passar
  if (trimmed.startsWith("/base/")) return trimmed;
  // Se eh UUID puro e tem path conhecido, converte
  if (UUID_REGEX.test(trimmed) && UUID_TO_PATH[trimmed]) {
    return UUID_TO_PATH[trimmed];
  }
  // Caso contrario, manda como veio (deixa Blotato decidir)
  return trimmed;
}

export async function createVisual(input: CreateVisualInput): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(`[blotato] createVisual raw="${input.templateId}" → normalized="${templateId}"`);
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: input.inputs ?? {},
        ...(input.prompt ? { prompt: input.prompt } : {}),
        ...(input.title ? { title: input.title } : {}),
        // CRITICO: sem isDraft=false + render=true, templates de video
        // complexos (talking head) ficam parados em script-ready aguardando
        // render manual no dashboard Blotato.
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Blotato 404: template "${templateId}" nao encontrado. ` +
          `Rode sync em /admin/configuracoes → Blotato.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export async function getCreation(id: string): Promise<BlotatoCreation> {
  const res = await request<{ item: BlotatoCreation }>(`/videos/creations/${id}`, { method: "GET" });
  return unwrap(res);
}

// DELETE /videos/:id — limpa videos órfãos no dashboard Blotato
export async function deleteVideo(id: string): Promise<void> {
  await request<unknown>(`/videos/${id}`, { method: "DELETE" });
}

// Poll ate ficar `done` (ou falhar). Intervalo 5s, timeout 5min — imagens
// ficam prontas em ~10s, videos podem demorar 1-3min.
//
// Status Blotato (confirmados via doc):
//   queueing | generating-script | script-ready | generating-media |
//   media-ready | exporting | done | creation-from-template-failed
export async function waitForCreation(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<BlotatoCreation> {
  const interval = opts.intervalMs ?? 5000;
  const timeout = opts.timeoutMs ?? 5 * 60_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const c = await getCreation(id);
    if (c.status === "done") return c;
    const statusLower = (c.status ?? "").toLowerCase();
    // Aceita qualquer status que contenha "fail" ou "error" — pra cobrir
    // `failed`, `creation-from-template-failed`, `error`, etc.
    if (statusLower.includes("fail") || statusLower.includes("error")) {
      throw new BlotatoError(
        `creation ${id} falhou (status=${c.status}): ${c.error ?? "sem detalhes — veja no dashboard Blotato"}`,
        500,
        c
      );
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new BlotatoError(`creation ${id} timeout apos ${timeout}ms`, 504);
}

// Helper: URL final do output. Imagens em imageUrls[0], videos em mediaUrl.
export function getOutputUrl(c: BlotatoCreation): string | null {
  return c.imageUrls?.[0] ?? c.mediaUrl ?? null;
}

// ─── Publish / Schedule post ───────────────────────────

export type BlotatoPlatform = "instagram" | "facebook";

export interface PublishInput {
  accountId: string;
  platform: BlotatoPlatform;
  text: string;
  mediaUrls: string[];
  pageId?: string; // obrigatorio no Facebook
  scheduledTime?: string; // ISO 8601 UTC; se omitir, publica imediato

  // Instagram-specific (todos opcionais)
  igMediaType?: "reel" | "story";
  igAltText?: string;
  igCollaborators?: string[]; // sem @, max 3
  igCoverImageUrl?: string;
  igShareToFeed?: boolean;
  // Trial Reel: mostra primeiro a NAO-followers (growth/discovery feature).
  // graduationStrategy: MANUAL = voce promove manual / SS_PERFORMANCE = IG
  // promove auto se performar bem.
  igTrial?: { graduationStrategy: "MANUAL" | "SS_PERFORMANCE" };

  // Facebook-specific
  fbMediaType?: "reel" | "story";
}

export interface PublishResponse {
  postSubmissionId: string;
}

export async function publishPost(input: PublishInput): Promise<PublishResponse> {
  const target: Record<string, unknown> = { targetType: input.platform };

  if (input.platform === "facebook") {
    if (!input.pageId) throw new BlotatoError("facebook requer pageId", 400);
    target.pageId = input.pageId;
    if (input.fbMediaType) target.mediaType = input.fbMediaType;
  } else if (input.platform === "instagram") {
    if (input.igMediaType) target.mediaType = input.igMediaType;
    if (input.igAltText) target.altText = input.igAltText;
    if (input.igCollaborators?.length) target.collaborators = input.igCollaborators;
    if (input.igCoverImageUrl) target.coverImageUrl = input.igCoverImageUrl;
    if (input.igShareToFeed !== undefined) target.shareToFeed = input.igShareToFeed;
    if (input.igTrial) target.trial = input.igTrial;
  }

  const body: Record<string, unknown> = {
    post: {
      accountId: input.accountId,
      content: {
        text: input.text,
        mediaUrls: input.mediaUrls,
        platform: input.platform,
      },
      target,
    },
  };
  if (input.scheduledTime) body.scheduledTime = input.scheduledTime;
  return request<PublishResponse>("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Get Post Status — poll publish progress
// status: in-progress | published | failed
// Quando published: { publicUrl }
// Quando failed: { errorMessage }
export interface PostStatus {
  postSubmissionId: string;
  status: "in-progress" | "published" | "failed" | string;
  publicUrl?: string;
  errorMessage?: string;
}

export async function getPostStatus(postSubmissionId: string): Promise<PostStatus> {
  return request<PostStatus>(`/posts/${postSubmissionId}`, { method: "GET" });
}

export async function waitForPostPublish(
  postSubmissionId: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<PostStatus> {
  const interval = opts.intervalMs ?? 2000;
  const timeout = opts.timeoutMs ?? 5 * 60_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await getPostStatus(postSubmissionId);
    if (r.status === "published") return r;
    if (r.status === "failed") {
      throw new BlotatoError(
        `Post ${postSubmissionId} falhou: ${r.errorMessage ?? "sem mensagem"}`,
        500,
        r
      );
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new BlotatoError(`Post ${postSubmissionId} timeout`, 504);
}
