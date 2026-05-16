// scripts/audit-lp-performance.ts — Auditoria automatica de performance da LP
//
// Mede TTFB, tamanho do HTML, qtd de chunks JS, tamanho total de JS, imagens
// sem lazy loading e imagens sem width/height declarados.
//
// Uso:
//   BASE_URL=https://www.longetividade.com.br npx tsx src/scripts/audit-lp-performance.ts
//   BASE_URL=http://localhost:3000 npx tsx src/scripts/audit-lp-performance.ts
//
// Default BASE_URL: https://www.longetividade.com.br

import { performance } from "node:perf_hooks";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "https://www.longetividade.com.br";
const TARGETS = ["/", "/emagreca-sem-dieta"];

type Report = {
  url: string;
  status: number;
  ttfbMs: number;
  totalMs: number;
  htmlBytes: number;
  jsChunks: number;
  jsBytesEstimate: number;
  imagesTotal: number;
  imagesWithLazy: number;
  imagesWithoutLazy: number;
  imagesWithoutDim: number;
  hasPreconnectFb: boolean;
  hasPixelInline: boolean;
  pixelInHead: boolean;
};

async function audit(path: string): Promise<Report> {
  const url = `${BASE_URL}${path}`;
  const t0 = performance.now();
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile",
    },
  });
  const ttfbMs = performance.now() - t0;
  const html = await res.text();
  const totalMs = performance.now() - t0;

  const headSection = html.split(/<\/head>/i)[0] ?? "";

  // JS chunks: <script src=".../chunks/...js">
  const scriptMatches = html.match(/<script[^>]+src=["'][^"']+\.js["'][^>]*>/gi) ?? [];
  const jsChunks = scriptMatches.length;

  // Estimar tamanho JS via inline + external (proxy: tamanho concatenado dos src)
  const jsBytesEstimate = scriptMatches.reduce((acc, s) => acc + s.length, 0);

  // Imagens
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesTotal = imgTags.length;
  const imagesWithLazy = imgTags.filter((t) => /loading=["']lazy["']/i.test(t)).length;
  const imagesWithoutLazy = imagesTotal - imagesWithLazy;
  const imagesWithoutDim = imgTags.filter(
    (t) => !/width=["']?\d/i.test(t) || !/height=["']?\d/i.test(t),
  ).length;

  // Tracking checks
  const hasPreconnectFb = /rel=["']preconnect["'][^>]*facebook\.net/i.test(headSection);
  const hasPixelInline = /fbq\(['"]init['"]/.test(headSection);
  const pixelInHead = hasPixelInline; // se inline ta no head section, ta no head

  return {
    url,
    status: res.status,
    ttfbMs: Number(ttfbMs.toFixed(0)),
    totalMs: Number(totalMs.toFixed(0)),
    htmlBytes: Buffer.byteLength(html, "utf8"),
    jsChunks,
    jsBytesEstimate,
    imagesTotal,
    imagesWithLazy,
    imagesWithoutLazy,
    imagesWithoutDim,
    hasPreconnectFb,
    hasPixelInline,
    pixelInHead,
  };
}

function fmtKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function buildMarkdown(reports: Report[]): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# LP Performance Audit — ${date}`,
    "",
    `**Base URL:** ${BASE_URL}`,
    `**User-Agent:** Mobile (Android Chrome simulado)`,
    "",
    "## Resumo",
    "",
    "| URL | Status | TTFB | Total | HTML | JS chunks | Imgs (lazy/no-dim) | Preconnect FB | Pixel inline head |",
    "|---|---|---|---|---|---|---|---|---|",
  ];

  for (const r of reports) {
    lines.push(
      `| \`${r.url.replace(BASE_URL, "") || "/"}\` | ${r.status} | ${r.ttfbMs}ms | ${r.totalMs}ms | ${fmtKb(r.htmlBytes)} | ${r.jsChunks} | ${r.imagesTotal} (${r.imagesWithLazy} lazy / ${r.imagesWithoutDim} sem dim) | ${r.hasPreconnectFb ? "✅" : "❌"} | ${r.pixelInHead ? "✅" : "❌"} |`,
    );
  }

  lines.push("", "## Detalhes por URL", "");
  for (const r of reports) {
    lines.push(
      `### \`${r.url}\``,
      "",
      `- **Status:** ${r.status}`,
      `- **TTFB:** ${r.ttfbMs} ms ${r.ttfbMs > 800 ? "⚠️ alto (>800ms)" : r.ttfbMs < 400 ? "✅" : "🟡"}`,
      `- **Total response:** ${r.totalMs} ms`,
      `- **HTML size:** ${fmtKb(r.htmlBytes)} ${r.htmlBytes > 100_000 ? "⚠️ pesado (>100KB)" : "✅"}`,
      `- **JS chunks:** ${r.jsChunks} (estimativa de bytes nos atributos src: ${r.jsBytesEstimate}b)`,
      `- **Imagens:** ${r.imagesTotal} total / ${r.imagesWithLazy} com \`loading=lazy\` / ${r.imagesWithoutLazy} sem lazy / ${r.imagesWithoutDim} sem width+height`,
      `- **Tracking head:** preconnect facebook.net ${r.hasPreconnectFb ? "✅" : "❌"} | fbq inline ${r.pixelInHead ? "✅" : "❌"}`,
      "",
    );

    if (r.imagesWithoutDim > 5) {
      lines.push(
        `> ⚠️ ${r.imagesWithoutDim} imagens sem dimensão explícita — causa CLS (Cumulative Layout Shift).`,
        "",
      );
    }
    if (r.imagesWithoutLazy - 1 > 5) {
      // -1: hero usa priority, não deve ter lazy
      lines.push(
        `> 🟡 ${r.imagesWithoutLazy} imagens sem \`loading=lazy\` — só o hero deveria carregar eager.`,
        "",
      );
    }
  }

  lines.push(
    "## Próximas otimizações sugeridas",
    "",
    "- Se TTFB > 800ms: investigar SSR cold start no Railway (warm a função com cron a cada 5min)",
    "- Se HTML > 100KB: considerar splitting do `<head>` (mover OG tags/JSON-LD pra footer)",
    "- Se imagens sem dim > 5: garantir `width` + `height` em todo `<img>` (next/image faz automático)",
    "- Verificar LCP via PageSpeed Insights: <https://pagespeed.web.dev/?url=https%3A%2F%2Fwww.longetividade.com.br%2Femagreca-sem-dieta>",
    "",
  );

  return lines.join("\n");
}

async function main() {
  console.log(`Auditando LPs em ${BASE_URL}...`);
  const reports: Report[] = [];
  for (const target of TARGETS) {
    try {
      const r = await audit(target);
      console.log(`  ${target} → ${r.status} (${r.ttfbMs}ms TTFB, ${fmtKb(r.htmlBytes)})`);
      reports.push(r);
    } catch (e) {
      console.error(`  ${target} → ERROR: ${(e as Error).message}`);
    }
  }

  const md = buildMarkdown(reports);
  const outDir = join(process.cwd(), "docs", "diagnostico");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "lp-performance.md");
  writeFileSync(outFile, md, "utf8");
  console.log(`\nRelatório salvo em ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
