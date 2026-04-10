#!/usr/bin/env node
/**
 * Seed inicial dos admins (Douglas + Bárbara).
 *
 * Uso:
 *   node scripts/seed-admin.js [baseUrl]
 *
 * baseUrl default: http://localhost:3000
 *
 * Variáveis esperadas:
 *   ADMIN_PASSWORD   — senha do Douglas (owner)
 *   ADMIN_SEED_KEY   — chave da rota seed (default: LONGETIVIDADE2026)
 */

const baseUrl = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const seedKey = process.env.ADMIN_SEED_KEY || "LONGETIVIDADE2026";
const douglasPassword = process.env.ADMIN_PASSWORD || "Z12a45q78()";

async function main() {
  const payload = {
    seedKey,
    users: [
      {
        email: "dougtudino@gmail.com",
        name: "Douglas",
        password: douglasPassword,
        role: "owner",
      },
      {
        email: "babitudino@gmail.com",
        name: "Bárbara",
        password: "babi123",
        role: "manager",
      },
    ],
  };

  console.log(`POST ${baseUrl}/api/admin/auth/seed`);
  const res = await fetch(`${baseUrl}/api/admin/auth/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`HTTP ${res.status}: ${text}`);

  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
