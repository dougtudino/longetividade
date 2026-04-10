import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";

type SeedUser = {
  email: string;
  name: string;
  password: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { seedKey, users } = (await request.json()) as {
      seedKey?: string;
      users?: SeedUser[];
    };

    const expectedKey = process.env.ADMIN_SEED_KEY || "LONGETIVIDADE2026";
    if (!seedKey || seedKey !== expectedKey) {
      return NextResponse.json(
        { ok: false, error: "seedKey inválido" },
        { status: 401 }
      );
    }

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { ok: false, error: "users array vazio" },
        { status: 400 }
      );
    }

    try {
      execSync("npx prisma db push --accept-data-loss", {
        env: { ...process.env },
        encoding: "utf8",
      });
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "prisma db push falhou: " + (e instanceof Error ? e.message : String(e)),
        },
        { status: 500 }
      );
    }

    let created = 0;
    let skipped = 0;

    for (const u of users) {
      if (!u.email || !u.name || !u.password) {
        skipped++;
        continue;
      }
      const email = u.email.toLowerCase().trim();
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) {
        skipped++;
        continue;
      }
      const passwordHash = await hashPassword(u.password);
      await prisma.adminUser.create({
        data: {
          email,
          name: u.name,
          passwordHash,
          role: u.role || "manager",
        },
      });
      created++;
    }

    return NextResponse.json({ ok: true, created, skipped });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "erro" },
      { status: 500 }
    );
  }
}
