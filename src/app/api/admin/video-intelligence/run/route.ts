import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { runVideoPipeline, type VideoPipelineProgress } from "@/lib/video-pipeline";

// POST /api/admin/video-intelligence/run
// Roda o pipeline completo (scraping + analise Gemini + Luna conceitos)
// com streaming SSE de progresso.
//
// Body (todos opcionais):
//   usernames: string[]  — se vazio, todos ativos
//   maxVideos: number    — qtd bruta buscada por perfil (default 20)
//   topK:      number    — top K por views analisados (default 5)
//   nDays:     number    — janela de dias de lookback (default 14)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    usernames?: string[];
    maxVideos?: number;
    topK?: number;
    nDays?: number;
  };

  let usernames = (body.usernames ?? []).map((u) => u.trim().replace(/^@/, "")).filter(Boolean);
  if (usernames.length === 0) {
    const active = await prisma.videoCompetitor.findMany({
      where: { active: true },
      select: { username: true },
    });
    usernames = active.map((c) => c.username);
  }

  const maxVideos = Math.max(1, Math.min(100, body.maxVideos ?? 20));
  const topK = Math.max(1, Math.min(20, body.topK ?? 5));
  const nDays = Math.max(1, Math.min(60, body.nDays ?? 14));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: VideoPipelineProgress | { message: string }) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          /* client desconectou */
        }
      };

      if (usernames.length === 0) {
        send("error", { message: "Nenhum concorrente ativo" });
        controller.close();
        return;
      }

      try {
        await runVideoPipeline(usernames, maxVideos, topK, nDays, (progress) => {
          send("progress", progress);
        });
        send("done", { message: "Pipeline finalizado" });
      } catch (err) {
        send("error", { message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
