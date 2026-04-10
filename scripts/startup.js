// startup.js — inicia o Next.js em produção.
// Migration (prisma db push) roda no buildCommand do railway.toml.
console.log("=== STARTUP: Starting Next.js ===");
require("child_process").execSync("node_modules/.bin/next start", {
  stdio: "inherit",
  env: { ...process.env },
});
