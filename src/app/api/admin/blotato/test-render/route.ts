import { NextRequest, NextResponse } from "next/server";
import { createVisual, waitForCreation, getOutputUrl, normalizeTemplateId } from "@/lib/blotato-client";
import { getCachedTemplates } from "@/lib/blotato-templates-sync";

// POST /api/admin/blotato/test-render
// Body opcional: { templateId?: string, prompt?: string }
//
// Testa o fluxo Blotato de ponta a ponta com UM template especifico
// pra isolar se problema eh: auth / template invalido / prompt ruim / outro.
//
// Se nao passar templateId, pega o primeiro do cache.

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      templateId?: string;
      prompt?: string;
    };

    let templateId = body.templateId;

    if (!templateId) {
      const cache = await getCachedTemplates({ autoSyncIfEmpty: true });
      if (cache.length === 0) {
        return NextResponse.json(
          { ok: false, error: "Cache vazio. Rode sync templates primeiro." },
          { status: 400 }
        );
      }
      // Pega o primeiro template do cache, prioriza image
      const img = cache.find((t) => t.type !== "video");
      templateId = (img ?? cache[0]).id;
    }

    const normalized = normalizeTemplateId(templateId);
    const prompt =
      body.prompt ||
      "Teste de render Longetividade: fundo verde-oliva #5C6B4D com texto curto 'Teste' em off-white. Estilo minimalista.";

    const started = await createVisual({
      templateId,
      prompt,
      title: "Test render",
    });

    // Polling curto — 60s max
    try {
      const done = await waitForCreation(started.id, { timeoutMs: 60_000, intervalMs: 4000 });
      const url = getOutputUrl(done);
      return NextResponse.json({
        ok: true,
        templateIdSent: templateId,
        templateIdNormalized: normalized,
        creationId: started.id,
        status: done.status,
        outputUrl: url,
        raw: done,
      });
    } catch (pollErr) {
      // Creation iniciou mas demorou — retorna ID pro user poder ver depois
      return NextResponse.json({
        ok: true,
        templateIdSent: templateId,
        templateIdNormalized: normalized,
        creationId: started.id,
        status: "pending-polling-timeout",
        message: (pollErr as Error).message,
      });
    }
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
