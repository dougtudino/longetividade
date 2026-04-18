// Script de teste ponta-a-ponta do fluxo novo: Uma -> Blotato.
// Roda com: npx tsx src/scripts/test-full-reel.ts <postId>
//
// Pega um SocialPost REEL approved e renderiza o reel via Blotato,
// usando brief da Uma (playbook + video-intel + learnings).

import { generateVideoForPost } from "@/lib/blotato-media";
import { buildVisualBrief } from "@/lib/agents/uma";

async function main() {
  const postId = process.argv[2];
  if (!postId) {
    console.error("uso: npx tsx src/scripts/test-full-reel.ts <postId>");
    process.exit(1);
  }

  console.log(`\n▶ Testando fluxo Uma → Blotato pro post ${postId}`);
  console.log("—".repeat(60));

  // 1) Uma monta o brief (tambem e chamada internamente por generateVideoForPost,
  //    mas aqui isolamos pra ver o que ela decide)
  console.log("\n[1/2] Uma montando brief visual...");
  const brief = await buildVisualBrief(postId);
  console.log("  templateId:", brief.templateId);
  console.log("  mood:      ", brief.mood);
  console.log("  paleta:    ", brief.colorPalette);
  console.log("  overlay:   ", brief.textOverlay ?? "(nao definido)");
  console.log("  reasoning: ", brief.reasoning);
  console.log("\n  briefing enriquecido:");
  console.log(brief.enrichedBriefing.split("\n").map((l) => "    " + l).join("\n"));

  // 2) Blotato renderiza — generateVideoForPost chama Uma de novo (cacheavel no futuro),
  //    aguarda render e grava URL no SocialPost.imageUrl
  console.log("\n[2/2] Blotato renderizando video (pode levar 1-5min)...");
  const started = Date.now();
  const result = await generateVideoForPost(postId);
  const ms = Date.now() - started;

  console.log("\n✓ Reel gerado em", (ms / 1000).toFixed(1), "s");
  console.log("  creationId:", result.creationId);
  console.log("  videoUrl:  ", result.videoUrl);

  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ ERRO:", err instanceof Error ? err.message : String(err));
  if (err instanceof Error && err.stack) console.error(err.stack.split("\n").slice(1, 4).join("\n"));
  process.exit(1);
});
