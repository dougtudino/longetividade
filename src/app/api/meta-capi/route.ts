import { NextRequest, NextResponse } from "next/server";
import { sendClientMirrorEvent, extractVisitorContext } from "@/lib/meta-capi";

// POST /api/meta-capi
// Body: { eventName, eventId, sourceUrl, value?, currency?, contentName?,
//         contentCategory?, contentIds?, contentType?, numItems? }
//
// Espelha eventos client-side (PageView, ViewContent, InitiateCheckout,
// AddToCart) pro Meta Conversions API. Meta deduplica via eventId — se o
// Pixel browser-side ja enviou o mesmo evento, o server-side e descartado
// automaticamente; se o browser foi bloqueado (adblock/ATT/in-app), o
// server-side garante a entrega.
//
// Fire-and-forget: retorna OK independente do resultado do Meta,
// pra nao bloquear UX.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      eventName?: string;
      eventId?: string;
      sourceUrl?: string;
      value?: number;
      currency?: string;
      contentName?: string;
      contentCategory?: string;
      contentIds?: string[];
      contentType?: string;
      numItems?: number;
      testEventCode?: string;
      debug?: boolean;
    };

    if (!body.eventName || !body.eventId || !body.sourceUrl) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const visitor = extractVisitorContext(req);

    const result = await sendClientMirrorEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      sourceUrl: body.sourceUrl,
      value: body.value,
      currency: body.currency,
      contentName: body.contentName,
      contentCategory: body.contentCategory,
      contentIds: body.contentIds,
      contentType: body.contentType,
      numItems: body.numItems,
      visitor,
      testEventCode: body.testEventCode,
    });

    // debug=true retorna o resultado real pra diagnostico. Em produção normal
    // o tracking client-side nao precisa do resultado (fire-and-forget).
    if (body.debug) {
      return NextResponse.json({ ok: true, capi: result });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Silently succeed — tracking nao deve quebrar UX
    return NextResponse.json({ ok: true, error: (e as Error).message });
  }
}
