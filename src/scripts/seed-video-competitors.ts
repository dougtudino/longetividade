// Seed de concorrentes do Video Intelligence.
//
// ATENCAO: antes de rodar este script, REVISE a lista abaixo no Instagram.
// O Video Intelligence paga Apify por requisicao — perfil fantasma = chamada
// desperdicada no Apify + log de erro. Remova/substitua perfis que nao existem
// ou que nao estao ativos (sem Reels recentes).
//
// Lista inicial: perfis BR de alcance medio-grande no nicho de reeducacao
// alimentar, saude feminina e nutricao sem dieta. Todos precisam ser PUBLICOS
// pro Apify raspar.
//
// Rodar (tsx nao carrega .env.local automaticamente — passa inline):
//   DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/longetividade" \
//     npx tsx src/scripts/seed-video-competitors.ts

import { prisma } from "../lib/prisma";

// Lista curada pelo Doug (16 perfis — nicho saude/nutri + criadores de alto
// engajamento adjacentes pra Luna aprender estruturas de hook/retencao).
const CANDIDATES: Array<{ username: string; followers: number; note: string }> = [
  // Saude feminina / nutricao
  { username: "carolborba1",          followers: 0, note: "Carol Borba — fitness feminino" },
  { username: "patricialeiteoficial", followers: 0, note: "Patricia Leite" },
  { username: "giselafranco",         followers: 0, note: "Gisela Franco" },
  { username: "nutri.paula",          followers: 0, note: "Nutri Paula" },
  { username: "drjulianaprofeta",     followers: 0, note: "Dra Juliana Profeta" },
  { username: "dicasdanutri",         followers: 0, note: "Dicas da Nutri" },
  { username: "nataliaribeiro",       followers: 0, note: "Natalia Ribeiro" },
  { username: "draanaescobar",        followers: 0, note: "Dra Ana Escobar" },
  { username: "drbarakat",            followers: 0, note: "Dr Barakat" },
  { username: "renatocariani",        followers: 0, note: "Renato Cariani — fitness/nutri" },
  { username: "paulomuzy",            followers: 0, note: "Paulo Muzy — medicina/fitness" },
  // Criadores high-engagement (referencia de estrutura/hook)
  { username: "thiagofinch",          followers: 0, note: "Thiago Finch — referencia hook/retencao" },
  { username: "murilogan",            followers: 0, note: "Murilo Gan" },
  { username: "caiofabrini",          followers: 0, note: "Caio Fabrini" },
  { username: "joaofinancas",         followers: 0, note: "Joao Financas — referencia didatica" },
  { username: "brunomazzoni",         followers: 0, note: "Bruno Mazzoni" },
];

async function main() {
  console.log(`\n🎬 Seed Video Intelligence — ${CANDIDATES.length} perfis candidatos\n`);
  console.log("⚠️  Revise cada handle no IG antes — remova/ajuste no array CANDIDATES.\n");

  let created = 0;
  let skipped = 0;

  for (const c of CANDIDATES) {
    try {
      const existing = await prisma.videoCompetitor.findUnique({
        where: { username: c.username },
      });
      if (existing) {
        console.log(`  = @${c.username} ja existia, pulando`);
        skipped++;
        continue;
      }
      await prisma.videoCompetitor.create({
        data: {
          username: c.username,
          followers: c.followers,
          category: "longetividade",
          active: true,
        },
      });
      console.log(`  ✓ @${c.username} — ${c.note}`);
      created++;
    } catch (err) {
      console.log(`  ✗ @${c.username} — ${(err as Error).message}`);
    }
  }

  console.log(`\n✅ Criados: ${created} | Ja existiam: ${skipped}`);
  console.log(`\nProximos passos:`);
  console.log(`  1. Abrir /admin/video-intelligence aba Concorrentes`);
  console.log(`  2. Desativar perfis fantasma`);
  console.log(`  3. Adicionar seus concorrentes reais\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
