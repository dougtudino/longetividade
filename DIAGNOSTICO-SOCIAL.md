# Diagnóstico Social Media — 2026-04-21

> Relatório gerado a partir de leitura do código. Nada foi editado/criado/deletado além deste arquivo.
> Contagens de DB ficaram como TODO porque `.env.local` não tem `DATABASE_URL` ativo nesta sessão — SQL exato documentado na seção 6.

---

## 1. Inventário (arquivos + datas + linhas)

### 1.1 Crons (`src/app/api/cron/**`)
| Arquivo | Linhas | Última modificação (commit) |
|---|---:|---|
| `src/app/api/cron/social-auto-post/route.ts` | 125 | (direto via Meta Graph API — legado) |
| `src/app/api/cron/social-generate/route.ts` | 33 | `49dc165` 2026-04-19 |
| `src/app/api/cron/social-plan-week/route.ts` | 33 | — |
| `src/app/api/cron/social-sync-engagement/route.ts` | 276 | `49dc165` 2026-04-19 |
| `src/app/api/cron/social-trends/route.ts` | 34 | — |
| `src/app/api/cron/blotato-auto-post/route.ts` | 78 | novo, via Blotato |
| `src/app/api/cron/blotato-generate-media/route.ts` | — | novo |
| `src/app/api/cron/blotato-generate-reels/route.ts` | — | novo |
| `src/app/api/cron/blotato-inspiration/route.ts` | — | novo |
| `src/app/api/cron/video-intelligence/route.ts` | — | — |

### 1.2 Rotas admin social (`src/app/api/admin/social/**`)
| Arquivo | Linhas |
|---|---:|
| `activity/route.ts` | 37 |
| `bulk-action/route.ts` | 57 |
| `calendar/route.ts` | 166 |
| `create-from-url/route.ts` | 176 |
| `diagnose/route.ts` | 308 |
| `discover-ig/route.ts` | 25 |
| `fill-gaps/route.ts` | 33 |
| `flow/[postId]/route.ts` | 104 |
| `generate-now/route.ts` | 35 |
| `post/route.ts` | 65 |
| `reset/route.ts` | 13 |
| `seed/route.ts` | 66 |
| `seed-knowledge/route.ts` | 53 |
| `seed-playbook/route.ts` | 32 |
| `setup-all/route.ts` | 78 |
| `trends/route.ts` | 231 |
| `upload-image/route.ts` | 84 |

### 1.3 Rotas admin blotato/video-intelligence
- `src/app/api/admin/blotato/regenerate-post/[id]/route.ts` — commit `81f5fb8` 2026-04-19 06:43
- `src/app/api/admin/video-intelligence/competitors/route.ts`
- `src/app/api/admin/video-intelligence/run/route.ts`
- `src/app/api/admin/video-intelligence/analyses/route.ts`
- `src/app/api/admin/video-intelligence/analyses/[id]/route.ts`
- `src/app/api/admin/video-intelligence/analyses/[id]/convert-to-post/route.ts`

### 1.4 Libs (`src/lib/`)
| Arquivo | Linhas | Última mod |
|---|---:|---|
| `social-calendar-dates.ts` | 895 | — |
| `social-content-bank.ts` | 278 | — |
| `social-knowledge-seed.ts` | 384 | — |
| `social-playbook.ts` | 260 | — |
| `social-post-images.ts` | 18 | — |
| `social-poster.ts` | 657 | — (Meta Graph direto) |
| `social-story-parsers.ts` | 51 | — |
| `social-story-templates.ts` | 102 | — |
| `social-week-schedule.ts` | 152 | — |
| `social-weekly-generator.ts` | 600 | `49dc165` 2026-04-19 |
| `blotato-client.ts` | 765 | — |
| `blotato-inspiration.ts` | 117 | — |
| `blotato-media.ts` | 330 | `49dc165` 2026-04-19 |
| `blotato-playbook.ts` | 550 | `49dc165` 2026-04-19 |
| `blotato-poster.ts` | 111 | — |
| `blotato-templates-sync.ts` | 119 | — |
| `video-apify.ts` | 56 | — |
| `video-gemini.ts` | 260 | — |
| `video-pipeline.ts` | 375 | — |

### 1.5 Páginas admin (`src/app/admin/**`)
| Arquivo | Linhas |
|---|---:|
| `admin/social-media/page.tsx` | 1658 |
| `admin/social-media/calendar/page.tsx` | 615 |
| `admin/video-intelligence/page.tsx` | 1050 |
| `admin/social/flow/[postId]/page.tsx` | — |

### 1.6 Schema Prisma — modelos social/knowledge/video
- `SocialPost` — campos-chave: `title, content, platform, format, pillar, slot, imageUrl, imageBriefing, status, scheduledAt, postedAt, engagementData, reviewNote`.
- `SocialPostImage` — bytes dos PNGs (slideIndex 0..N), servido via rota pública `/api/public/social-image/[postId]/[slide]`.
- `AgentKnowledge` — campos `agentId, kind, title, body, source, metadata` (Json). **É aqui que vivem as trends** (não há model `Trend` separado).
- `VideoCompetitor` / `VideoAnalysis` — Video Intelligence. `VideoAnalysis` tem `concept, hook, retention, reward, script, rawAnalysis, lunaConcepts` + `savedToKnowledge/knowledgeId` que espelham pra `AgentKnowledge`.
- `AgentDecision` — onde Uma registra `VISUAL_BRIEF` com `params.templateId` consumido depois pelo auto-learning.

---

## 2. Fluxo Auto-Post

**ATENÇÃO — existem DOIS crons de auto-post coexistindo:**

### 2.1 Caminho A (legado): `GET /api/cron/social-auto-post` → postToAllWithImages via Meta Graph direto
1. Valida `x-cron-secret` ou `?secret=` contra `CRON_SECRET`.
2. Busca `SocialPost` com `status="approved"` AND `scheduledAt <= agora`, `BATCH=10`, `orderBy: scheduledAt asc`.
3. Pra cada post: monta `message = content + "\n\n" + hashtags`, chama `getPostImageUrls(post.id)` (fallback pra `post.imageUrl`).
4. Dispara `postToAllWithImages(message, imageUrls)` que:
   - **Facebook**: `postToFacebook` (1 img) ou `postToFacebookMultiPhoto` (2+). Requer Page Access Token derivado via `/me/accounts` com TTL 1h.
   - **Instagram**: `postToInstagram` (1 img) ou `postToInstagramCarousel` (2-10). Carrossel = 3 passos (children containers → parent → publish) com poll de `status_code=FINISHED`.
5. Se qualquer plataforma `ok=true` → marca `status="posted"`, `postedAt=now`, `engagementData=<array resultados>`.
6. Se todas falham mas erro é `"nao configurado"` → **deixa como approved** (retry posterior / postagem manual).
7. Se erro real → marca `status="posted"` (sim, posted) com `reviewNote` descrevendo a falha parcial. Contabiliza como `failed`.
8. Log agregado em `AgentKnowledge {kind:"learning", source:"luna-auto-post"}`.

**Schedule**: `0 15 * * *` (12h BRT) — documentado em comentário. Sem retry/fila dedicada: depende da próxima execução do cron.

### 2.2 Caminho B (novo): `GET /api/cron/blotato-auto-post` → publishPostViaBlotato
1. Mesma autenticação de cron.
2. Busca `SocialPost approved` com `scheduledAt <= agora` **E tem imagem** (`imageUrl != null OR images.some()`), `BATCH=10`.
3. Chama `publishPostViaBlotato(post.id)` que:
   - Roda gate **Quinn** (`reviewPostCompliance`) — se `severity="block"` aborta com 412.
   - Lê `BLOTATO_IG_ACCOUNT_ID`, `BLOTATO_FB_ACCOUNT_ID`, `META_PAGE_ID` via `getSetting`.
   - Chama `publishPost()` do `blotato-client` pra cada plataforma configurada.
   - Se `scheduledAt > now` → agenda no Blotato; senão publica imediato.
4. Se qualquer plataforma `ok` → `status="posted"`.

**Comentário no próprio arquivo**: _"Se voce ativar este cron, desative o /api/cron/social-auto-post pra nao postar em duplicata."_

**Diagrama — decisão operacional**:

```
                 approved + scheduledAt <= now
                          │
                  ┌───────┴────────┐
                  ▼                ▼
         social-auto-post    blotato-auto-post
        (Meta Graph direto)  (Blotato SaaS)
                  │                │
         passa pelo Quinn?  sempre passa Quinn
                não                sim
                  │                │
            FB+IG direto    FB+IG via Blotato
                  │                │
         status=posted (ambos)
```

**Onde ficam logs**: `AgentKnowledge {agentId:"luna", kind:"learning", source:"luna-auto-post"}` + `SocialPost.reviewNote` + `engagementData`.

---

## 3. Fluxo Generate (gerar semana)

### 3.1 `GET /api/cron/social-generate`
1. Valida cron secret.
2. Chama `generateWeeklyPosts({ status: "approved", createdBy: "luna-auto" })`.
3. Loga resultado em `AgentKnowledge` via `logGenerationToKnowledge`.

**Schedule (comentado)**: `0 23 * * 0` (domingo 20h BRT).

### 3.2 `generateWeeklyPosts()` → `fillGapsAhead({ daysAhead: 7 })`

Arquivo: `src/lib/social-weekly-generator.ts`

**(a) Distribuição por slot**: vem de `WEEKLY_SCHEDULE` (matriz canônica Seg-Sáb × 3 slots = 12 posts/sem, conforme CLAUDE.md). `expandScheduleAhead(now, daysAhead)` gera as ocorrências reais pros próximos 7 dias.

**(b) Datas comemorativas**: `getUpcomingDates(daysAhead)` → `commemorativeMap`. Commem `priority="high"` que cai em domingo (dia OFF da matriz) vira slot virtual via `virtualSlotsForOffDay()` — impede perder Dia das Mães, Páscoa, etc.

**(c) Busca de trends** — `getUnusedTrendsByPillar()` consolida **3 fontes** por pilar:

1. **Web search Claude** (`source="luna-trends-websearch"`, últimos 10 dias). Filtra trends já usadas comparando `title/content` dos posts recentes.
2. **Video Intelligence** (`source startsWith "video-intelligence:"`, últimos **7 dias**, take 10). Mapeia cada análise pra `TrendItem` com `suggestedPillar="m"` (Movimento). Consome `metadata.hook` e `metadata.concept`.
3. **Blotato Inspiration via Perplexity** (`source="blotato-inspiration-perplexity"`, últimos 14 dias, take 10). Cada reference vira até 3 `TrendItem` (quebra por parágrafo).

**(d) Priorização (`pickContentForSlot`)**:
- Stories estruturados (`stories-poll`, `stories-question`, `stories-sequence`): commem com `storyTemplate` compatível > bank template.
- Slots normais:
  - Commem `priority="high"` **sempre ganha** (ignora pilar mismatch).
  - Commem `priority="normal"` ganha se pilar bate ou é `"geral"`.
  - Commem `priority="low"` só entra no fallback final.
  - `preferTrend=true` no entry → trend ganha sobre bank.
  - Fallback: trend → commem low → bank.
- Bank = `CONTENT_BANK` filtrado por pilar, pick aleatório.

**(e) Inserção**: `prisma.socialPost.create` com `title, content, platform="instagram", format, pillar, slot, hashtags, imageBriefing, status, scheduledAt, createdBy`. `occupiedSlots` evita duplicar.

**Importante: `generateWeeklyPosts` NÃO gera imagem via Blotato**. Só cria o registro com `imageBriefing` preenchido. A imagem é gerada depois por:
- Cron `blotato-generate-media` (provavelmente — arquivo existe mas não foi lido).
- Botão "Gerar imagem" na UI (`generateImages` no `page.tsx:358`) que renderiza client-side via `html-to-image` e salva em `SocialPostImage`.
- Botão "🔄 Regenerar arte" por post que chama `generateImageForPost`/`generateVideoForPost`.

### 3.3 Roteamento Blotato dentro de `generateImageForPost`/`generateVideoForPost`

Arquivo: `src/lib/blotato-media.ts`

**Não é "sempre o mesmo endpoint"**. A função central é `startCreationFromBrief(brief, fallbackPrompt, title, expectVideo)` que escolhe **pela shape do brief retornado pela Uma**:

| Sinal no `UmaBrief` | Chama |
|---|---|
| `isLegacyInfographicTemplate(templateId)` = true | `createSimpleInfographic({description, footerText})` |
| `expectVideo && scenes?.length && characterDescription` | `createTalkingHead({scenes, characterDescription})` |
| `slides?.length` | `createImageSlideshow({slides})` |
| `quotes?.length` | `createCarousel({quotes})` |
| senão | `createVisual({prompt})` — template free-form |

**Override defensivo (linha 52-67)**: se `!expectVideo` AND templateId é vídeo (whitelist de 4 UUIDs) → **força troca pra Image Slideshow** + converte `scenes[]` em `slides[]`. Isso previne carrossel/feed chamando videogen. ⇒ **o bug "carrossel chamando videogen2" NÃO existe hoje** nesse caminho.

**Templates defaults por slot** (`DEFAULT_TEMPLATES`):
```
FEED_AM → 9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0 (Single Centered Text Quote)
STORY   → ae868019-820d-434c-8fe1-74c9da99129a (Whiteboard Infographic)
REEL    → /base/v2/ai-story-video/5903fe43-…/v1 (AI Video with AI Voice)
```
Overridáveis via `AppSetting` com keys `BLOTATO_TPL_FEED_AM`, `_STORY`, `_REEL`.

---

## 4. Bug "Regenerar arte" — **já corrigido**

**Commit que resolveu**: `81f5fb8 fix(regenerate): roteia por format, loading + double-click guard` (2026-04-19 06:43).

### 4.1 Backend — `src/app/api/admin/blotato/regenerate-post/[id]/route.ts:42-49`
```ts
const isVideoFormat = post.format === "reels";
if (isVideoFormat) {
  result = await generateVideoForPost(post.id);
} else {
  result = await generateImageForPost(post.id);
}
```
- ✅ Roteia por `post.format` (não por slot).
- ❌ **Nenhum fallback pra videogen2** — se format for desconhecido cai em imagem (branch else). Não há `else if` pra formatos inesperados.

### 4.2 Frontend — `src/app/admin/social-media/page.tsx:192 / 1394-1450`
- ✅ `const [regenerating, setRegenerating] = useState<string | null>(null);`
- ✅ `disabled={regenerating === p.id || !!regenerating}` — bloqueia o botão em TODOS os posts enquanto um estiver rodando.
- ✅ Guard dentro do onClick: `if (regenerating) return; // guard double-click`.
- ✅ `setRegenerating(p.id)` antes do fetch; `setRegenerating(null)` no `finally`.
- ✅ Chama `POST /api/admin/blotato/regenerate-post/${p.id}` — rota correta.
- ✅ Título dinâmico: `Apaga vídeo atual e regenera com Uma + AI Video + scenes` vs `…Uma + Image Slideshow + slides reais`.

**Veredito**: bug confirmadamente fechado. Nenhuma ação necessária.

---

## 5. Trends e Fontes

### 5.1 Schema
- **Não existe model `Trend` ou `LunaTrend`**. Trends são armazenadas em `AgentKnowledge` (`kind="reference"`, `source="luna-trends-websearch"`) com o array completo em `metadata.trends` (Json).
- Tipo `TrendItem` em `src/lib/social-weekly-generator.ts:20-29`:
  ```ts
  type TrendItem = {
    topic: string;
    angle: string;
    suggestedPillar: Pillar;
    sourceUrl?: string;   // <— opcional
    hook?: string;
    keyPoints?: string[];
    dataPoint?: string;
    body?: string;
  };
  ```

### 5.2 Como a pesquisa popula `sourceUrl`
Arquivo: `src/app/api/admin/social/trends/route.ts`.
- Usa `claude-sonnet-4-20250514` com tool `web_search_20250305` (max 8 uses).
- Prompt (linha 104-119) pede explicitamente `"sourceUrl": "<url da fonte principal>"`.
- `parseTrends` pega o JSON que Claude retorna e empacota. Se Claude **não incluir** `sourceUrl` no item (ex: resposta truncada ou sem citação), o campo fica `undefined` — sem default hard-coded.
- Body formatado (linha 173-178) inclui `\n   Fonte: ${t.sourceUrl}` só se existir.

### 5.3 Onde o frontend renderiza "fonte"
`src/app/admin/social-media/page.tsx:897-901`:
```tsx
{t.sourceUrl && (
  <a href={t.sourceUrl} target="_blank" rel="noreferrer" …>
    fonte
  </a>
)}
```
→ Link literal `fonte` só aparece quando o TrendItem traz `sourceUrl`. Se a pesquisa voltar sem URL (frequente em buscas que agregam múltiplas fontes), o link some. Nada mais "inventa" fonte.

### 5.4 Gap
Não há renderização de `dataPoint`, `keyPoints` ou `hook` na lista de trends — só `topic` (linha 894) e `angle` (linha 896). Isso reduz o valor visível do conteúdo que o Claude gera.

---

## 6. Video Intelligence — conectado e em uso

### 6.1 Integração no generator
Arquivo `src/lib/social-weekly-generator.ts:85-116`:
```ts
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const videoRefs = await prisma.agentKnowledge.findMany({
  where: {
    agentId: "luna",
    kind: "reference",
    source: { startsWith: "video-intelligence:" },
    createdAt: { gte: sevenDaysAgo },
  },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```
Cada ref vira `TrendItem` com `suggestedPillar="m"`, `hook=meta.hook`, `topic=meta.concept?.slice(0,60)||title`, `body=ref.body`. ✅ Conectado.

### 6.2 Como entra no prompt Claude
Os videoRefs NÃO entram num prompt — eles entram diretamente na **matriz de trends por pilar** do generator. Quando um slot (ex: Terça REEL pilar "m") é preenchido, o `pickContentForSlot` consome trends da pilha `"m"` via `shift()`. `buildFromTrend` constrói o `content` do post diretamente a partir do `hook/body/topic` — **sem nova chamada a Claude**.

Ou seja: Video Intelligence alimenta o **conteúdo textual** de posts de Reel, não o briefing visual. O briefing visual é feito depois pela Uma.

### 6.3 Contagens no banco — **TODO (rodar local)**
`.env.local` atual tem `DATABASE_URL` comentado — esta sessão não conseguiu consultar. Queries pra rodar:
```sql
-- AgentKnowledge com source de Video Intelligence
SELECT COUNT(*) FROM "AgentKnowledge" WHERE source LIKE 'video-intelligence:%';

-- VideoAnalysis últimos 30 dias
SELECT COUNT(*) FROM "VideoAnalysis"
WHERE "createdAt" >= NOW() - INTERVAL '30 days';

-- Por competidor
SELECT c.username, COUNT(a.id) AS analises
FROM "VideoCompetitor" c
LEFT JOIN "VideoAnalysis" a ON a."competitorId" = c.id
  AND a."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY c.username ORDER BY analises DESC;
```

---

## 7. Blotato — templates e variação

### 7.1 Um template por **slot**, não por pilar
Mapeamento atual (`blotato-media.ts:116-133`):
- `FEED_AM` → "Single Centered Text Quote" (UUID fixo)
- `STORY`   → "Whiteboard Infographic" (UUID fixo)
- `REEL`    → "AI Video with AI Voice" (path completo)

**Não há template diferente por pilar S/E/M/N**. O que muda por pilar é:
- `imageBriefing` (texto pra Uma entender a vibe).
- `hashtagsForPillar()` no `social-weekly-generator.ts:158-166`.
- As cores/hashtags de preview renderizadas no client (`PILLAR_COLORS` em `page.tsx:80-85`).

### 7.2 Onde os estilos ficam
Cores fixas em dois lugares:
- `page.tsx:80-85` — badge/label do pilar na UI (`s=#7A9E7E, e=#D4A94B, m=#3D5A3E, promo=#C4787A`).
- Dentro dos componentes `post-feed / post-story / post-carousel` (`src/components/social-templates/*`) — não lidos neste diagnóstico.
- Paleta passada a Blotato via fallback: `"paleta verde-oliva (#5C6B4D) e off-white (#F4EFE4)"` (linha 144 de `blotato-media.ts`).

### 7.3 Briefing — livre ou estruturado?
**Estruturado via Uma** (`src/lib/agents/uma.ts` — não lido, mas invocado via `buildVisualBrief(post.id)`):
- Uma retorna `{ templateId, slides?, quotes?, scenes?, description?, textOverlay?, footerText?, enrichedBriefing, colorPalette, mood, characterDescription? }`.
- Auto-learning: `social-sync-engagement/route.ts:163-259` pega os `AgentDecision` com `action="VISUAL_BRIEF"`, agrega engagement por templateId (últimos 14 dias), e salva `AgentKnowledge {agentId:"uma", kind:"learning", source:"uma-learnings"}` com ranking. Uma consulta isso no próximo brief.
- Se Uma falhar (sem `ANTHROPIC_API_KEY`) → cai em `fallbackImagePrompt()` ou `fallbackReelPrompt()` — prompt livre com campos planos do post.

### 7.4 Variação por slot/hook/CTA
Não há variação fixa por tipo de slot (hook/dica/evidência/CTA). O que existe:
- A Uma monta slides diferentes dependendo do `format` + `imageBriefing` do post.
- O `social-weekly-generator.ts:buildFromCommemorative|buildFromTrend|buildFromBank` varia o **texto** por slot (REEL usa beats, STORY usa hook+1 ponto, FEED_AM usa body completo/bullets).

---

## 8. Métricas e monitoramento

### 8.1 Coleta existente
- Cron `social-sync-engagement` roda `0 0 * * *` (21h BRT) e coleta `likes, comments, shares, reach, impressions` via `fetchFacebookInsights` e `fetchInstagramInsights` pros posts publicados entre 24h e 14 dias atrás.
- Salva em `SocialPost.engagementData` como JSON agregado `{syncedAt, platforms:[...], totalEngagement, totalReach}`.
- Auto-learning: top 3 performers salvos em `AgentKnowledge source="luna-sync-engagement"`; template-performance em `source="uma-learnings"`.

### 8.2 UI de métricas — **não existe dedicada**
A página `/admin/social-media` tem um box "📜 Atividade recente da Luna" (`page.tsx:918-950`) que lista últimos 10 posts publicados + últimos 10 learnings — mas **sem mostrar likes/reach/engagement**. `activity/route.ts` seleciona `engagementData` mas a UI não exibe.

**Gap operacional**: o `engagementData` é coletado e serve pro auto-learning da Uma, mas **não tem visualização humana**. Se você quer ver "posts × alcance × engajamento", precisa consultar banco direto ou criar dashboard.

### 8.3 Tabela dedicada (PostMetrics)?
Não. Toda métrica vive inline em `SocialPost.engagementData` (Json). Sem séries temporais — cada sync **sobrescreve** o campo. Se você quiser histórico por dia, o modelo precisa mudar.

---

## 9. Commits recentes (área social/blotato/video)

```
49dc165 feat(blotato): playbook completo 36 templates + Legacy Infographics como 1a classe
c45e77a feat(blotato): grade harmônica + trial reels + post status + voice + delete
a7d3104 feat(social): 'Criar a partir de URL' — TikTok/YouTube/Article/PDF → SocialPost
81f5fb8 fix(regenerate): roteia por format, loading + double-click guard
dc3beaf feat(social): botao 🔄 Regenerar arte por post
478042b feat(social): Luna+Uma usam playbook estruturado pros Reels/Feed/Story
b3be5a6 feat(blotato): Inspiration via Perplexity — descoberta de virais por nicho
5d5bd3a feat(criativos): preset Talking Head com avatar AI textual
746c474 fix(blotato): templateId aceita UUID OU path — converte automatico
a98c9fd feat(blotato): createImageSlideshow — slides com imagem AI + texto overlay
c891e4c feat(blotato): createCarousel() multi-slide via inputs.quotes
6abf68e fix(blotato): prompt truncado 480 chars + detecta 'creation-from-template-failed'
d566011 fix(blotato): isDraft=false explicito em createVisual
ff16d8d fix(blotato): envia templateId exato — nao normaliza pra UUID
a8ea443 debug(blotato): telemetria + botao teste render isolado
4b11bb2 fix(blotato): UUID puro no templateId + discovery dinamico via API
8e9554c feat(admin): PageHeader novo + migrate sempre visivel nos criativos
084e6b2 feat: pipeline IA de criativos Meta Ads + modernizacao UI admin
822e458 feat(agents): Uma consulta knowledge proprio + title no Blotato + timeout ajustado
dbdb2df feat(agents): Uma (visual director) + Quinn (compliance) plugam no Blotato
```

**Leitura**: janela 2026-04-17 → 2026-04-19 concentra refactor grande — Uma+Quinn plugaram no Blotato, vieram carrossel/slideshow/talking head, playbook de 36 templates. Pipeline atual é novíssimo.

---

## 10. Top 5 gaps identificados (prioridade)

| # | Gap | Severidade | Esforço |
|---|---|---|---|
| 1 | **Dois crons auto-post coexistem** (`social-auto-post` Meta direto + `blotato-auto-post` via Blotato). Se ambos estiverem agendados → publicação duplicada. Não há lock/flag que desative um. | **CRÍTICO** | 1h (adicionar feature flag `AUTO_POST_CHANNEL=meta\|blotato` + checar nos dois crons) |
| 2 | **Nenhum dashboard de métricas humano** — `engagementData` coletado mas invisível. Barbara não consegue ver performance sem SQL. Além disso `engagementData` é sobrescrito a cada sync (sem histórico diário). | **MÉDIO** | 4-6h (criar rota `/admin/social-media/analytics` + model `SocialPostMetric` pra séries) |
| 3 | **Trend sem sourceUrl não mostra fonte** e a UI só exibe `topic+angle` — o `body/hook/dataPoint/keyPoints` que o Claude gera ficam invisíveis pra revisão. | **MÉDIO** | 2h (expandir card de trend + fallback "Claude web search" como fonte quando ausente) |
| 4 | **Sem retry/fila no auto-post legado** — falhas reais viram `status="posted"` com `reviewNote` descrevendo o erro. Isso "apaga" o problema (post some da fila approved) mas publica zero conteúdo. | **MÉDIO** | 2-3h (marcar `status="failed"` + cron de retry separado ou job queue) |
| 5 | **Templates Blotato iguais por pilar** — mesmo `FEED_AM` UUID pra S/E/M/promo. Isso afeta variação visual: Uma pode escolher template diferente dinamicamente, mas o default é o mesmo. | **BAIXO** | 3h (adicionar `BLOTATO_TPL_FEED_AM_S/E/M` settings + lookup por pilar no `getTemplateIdForSlot`) |

---

## 11. Top 5 pontos fortes (não quebrar!)

1. **Roteamento `regenerate-post` por `format`** — `post.format === "reels"` → vídeo; senão imagem. Com override defensivo no `startCreationFromBrief` que troca template de vídeo por Image Slideshow quando o post não é REEL. **Fechado corretamente — o bug reportado não existe mais.**
2. **Guard de double-click no botão Regenerar** — `disabled` + early-return + setState imediato impedem cliques duplicados e deixam feedback visual. Modelo pra replicar em outros botões caros.
3. **Video Intelligence plugado no generator via AgentKnowledge** — o desacoplamento pelo `source LIKE 'video-intelligence:%'` deixa o generator agnóstico. Adicionar novos agentes (Perplexity Inspiration já faz isso) é trivial — só salvar no AgentKnowledge com `source` próprio.
4. **Quinn (compliance) como gate no Blotato-poster** — roda antes de cada publish; se `severity="block"` aborta com 412. Fail-open quando Quinn cai por outro motivo (LLM down) — tradeoff consciente.
5. **Auto-learning da Uma** em `social-sync-engagement` — agrega engagement por templateId nos últimos 14 dias, ranka e salva em `AgentKnowledge source="uma-learnings"` pra próxima chamada. Isso fecha o loop sem intervenção humana. **Feature discreta mas é o que transforma o sistema em agêntico de verdade.**

---

_Fim do diagnóstico._
