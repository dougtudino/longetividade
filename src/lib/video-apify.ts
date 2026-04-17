// Apify Instagram scraper — raspa Reels de um perfil publico do IG.
// Usado pelo Video Intelligence pra colher Reels virais de concorrentes.

export interface ApifyReel {
  videoUrl: string;
  url: string;
  videoPlayCount: number;
  likesCount: number;
  commentsCount: number;
  ownerUsername: string;
  images: string[];
  timestamp: string;
}

export async function scrapeReels(
  username: string,
  maxVideos: number,
  nDays: number
): Promise<ApifyReel[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN nao configurado");

  const sinceDate = new Date(Date.now() - nDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // memory=1024 força o actor a rodar com 1GB em vez do default (4-8GB),
  // o que permite caber no plano Apify de 8GB total e rodar sem fila.
  // Custo em $ nao muda — Apify cobra por `resultsLimit`, nao por RAM.
  const response = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&memory=1024`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addParentData: false,
        directUrls: [`https://www.instagram.com/${username}/`],
        enhanceUserSearchWithFacebookPage: false,
        isUserReelFeedURL: false,
        isUserTaggedFeedURL: false,
        onlyPostsNewerThan: sinceDate,
        resultsLimit: maxVideos,
        resultsType: "stories",
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Apify erro ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json() as Promise<ApifyReel[]>;
}
