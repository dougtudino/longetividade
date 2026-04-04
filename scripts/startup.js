// startup.js — roda prisma db push antes do npm start
const { execSync } = require("child_process");

console.log("=== STARTUP: Running prisma db push ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

try {
  execSync("npx prisma db push --accept-data-loss --skip-generate", {
    stdio: "inherit",
    env: { ...process.env },
  });
  console.log("=== STARTUP: prisma db push SUCCESS ===");
} catch (e) {
  console.error("=== STARTUP: prisma db push FAILED ===", e.message);
}

console.log("=== STARTUP: Starting Next.js ===");
require("child_process").execSync("npm start", {
  stdio: "inherit",
  env: { ...process.env },
});
