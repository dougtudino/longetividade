import { NextRequest, NextResponse } from "next/server";
import { welcomeEmail, valueEmail, offerEmail } from "@/lib/email-sequence";

// GET /api/admin/email-preview?email=welcome|value|offer
// Retorna HTML renderizado do email pra preview no browser.
// Doug/Barbara podem ver exatamente como o email fica antes de aprovar.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const which = url.searchParams.get("email") ?? "welcome";
  const name = url.searchParams.get("name") ?? "Amiga";

  let tmpl: { subject: string; html: string };

  switch (which) {
    case "welcome":
    case "d0":
      tmpl = welcomeEmail(name);
      break;
    case "value":
    case "d2":
      tmpl = valueEmail(name);
      break;
    case "offer":
    case "d5":
      tmpl = offerEmail(name);
      break;
    default:
      tmpl = welcomeEmail(name);
  }

  // Adiciona banner de preview no topo do HTML
  const previewBanner = `
    <div style="background:#3D5A3E;color:#fff;padding:12px 20px;font-family:sans-serif;font-size:13px;text-align:center;">
      <strong>PREVIEW</strong> · ${which.toUpperCase()} · Assunto: "${tmpl.subject}"
      · <a href="?email=welcome&name=${encodeURIComponent(name)}" style="color:#D4A94B;margin:0 6px;">D+0</a>
      · <a href="?email=value&name=${encodeURIComponent(name)}" style="color:#D4A94B;margin:0 6px;">D+2</a>
      · <a href="?email=offer&name=${encodeURIComponent(name)}" style="color:#D4A94B;margin:0 6px;">D+5</a>
    </div>
  `;

  const html = tmpl.html.replace("<body", `<body>${previewBanner}<div`).replace("</body>", "</div></body>");

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
