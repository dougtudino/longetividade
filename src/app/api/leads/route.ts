// POST /api/leads — Capture lead, persist em Lead, sync Brevo, dispara welcome
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-sequence";

const BREVO_CONTACTS = "https://api.brevo.com/v3/contacts";
const LEADS_LIST_ID = 6; // "Leads Emagreca Sem Dieta"

async function syncToBrevo(
  apiKey: string,
  email: string,
  name: string,
  utmSource: string
): Promise<void> {
  const res = await fetch(BREVO_CONTACTS, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name, UTM_SOURCE: utmSource },
      listIds: [LEADS_LIST_ID],
      updateEnabled: true,
    }),
  });

  if (res.ok) return;

  const err = await res.text();
  if (res.status === 400 && err.includes("duplicate_parameter")) {
    await fetch(`${BREVO_CONTACTS}/lists/${LEADS_LIST_ID}/contacts/add`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({ emails: [email] }),
    });
    return;
  }
  console.error("Brevo create contact error:", err);
  throw new Error(`Brevo ${res.status}: ${err.slice(0, 200)}`);
}

export async function POST(req: NextRequest) {
  const apiKey = await getSetting("BREVO_API_KEY");
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

  const name = body.name?.trim() ?? "";
  const utmSource = body.utm_source ?? "";

  // 1. Persiste no DB local (idempotente via unique email)
  const existing = await prisma.lead.findUnique({ where: { email } });
  let isNew = false;
  if (!existing) {
    await prisma.lead.create({
      data: {
        email,
        name: name || null,
        source: utmSource || null,
        sequenceStep: 0,
        lastEmailAt: new Date(),
      },
    });
    isNew = true;
  }

  // 2. Sync com Brevo (lista)
  try {
    await syncToBrevo(apiKey, email, name, utmSource);
  } catch (e) {
    console.error("Brevo sync failed:", e);
    // nao bloqueia: lead ja esta no DB local
  }

  // 3. Welcome email (apenas para novos leads)
  if (isNew) {
    try {
      const tmpl = welcomeEmail(name || null);
      await sendEmail({
        to: email,
        toName: name || "amiga",
        subject: tmpl.subject,
        htmlContent: tmpl.html,
      });
    } catch (e) {
      console.error("Welcome email failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Cadastrado com sucesso!",
    isNew,
  });
}
