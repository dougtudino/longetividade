// POST /api/leads — Capture lead email into Brevo list
import { NextRequest, NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3/contacts";
const LEADS_LIST_ID = 6; // "Leads Emagreca Sem Dieta"

export async function POST(req: NextRequest) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 503 }
    );
  }

  let body: { email?: string; name?: string; utm_source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalido" }, { status: 400 });
  }

  const response = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      attributes: {
        FIRSTNAME: body.name || "",
        UTM_SOURCE: body.utm_source || "",
      },
      listIds: [LEADS_LIST_ID],
      updateEnabled: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Brevo create contact error:", err);
    // duplicate_parameter means contact already exists, that's ok
    if (response.status === 400 && err.includes("duplicate_parameter")) {
      // Add to list if contact exists
      await fetch(`${BREVO_API}/lists/${LEADS_LIST_ID}/contacts/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({ emails: [email] }),
      });
      return NextResponse.json({ ok: true, message: "Cadastrado com sucesso!" });
    }
    return NextResponse.json(
      { error: "Erro ao cadastrar" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "Cadastrado com sucesso!" });
}
