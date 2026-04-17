# Longetividade — Notas do projeto

Stack: Next.js 15 (App Router) + PostgreSQL/Prisma (adapter pg) + Railway.

## Features core

### Luna (social media)
- `src/lib/social-weekly-generator.ts` — gera posts semanais em multi-slot (FEED_AM + REEL + STORY)
- `src/lib/social-week-schedule.ts` — matriz canônica Seg-Sáb × 3 slots (12 posts/semana)
- `getUnusedTrendsByPillar()` consome `AgentKnowledge` com `source: "luna-trends-websearch"` E `source: starts-with "video-intelligence:"`
- Hierarquia de fontes: commemorative > trend (preferTrend slots) > bank

### Video Intelligence 🎬 (`/admin/video-intelligence`)
Pipeline: Apify scraping → Gemini 2.0 Flash analyze → Claude gera 3 conceitos Luna → salva em `VideoAnalysis` + espelha em `AgentKnowledge` (`kind=reference`, `source=video-intelligence:<id>`).

- Libs: `src/lib/video-apify.ts`, `src/lib/video-gemini.ts`, `src/lib/video-pipeline.ts`
- Rotas: `/api/admin/video-intelligence/{competitors,run,analyses,analyses/[id]}` + `/api/cron/video-intelligence`
- Env: `APIFY_API_TOKEN`, `GEMINI_API_KEY` (ANTHROPIC_API_KEY já existia)
- Run route: SSE via `ReadableStream` → `text/event-stream`
- Cron: `0 20 * * 6` (Sáb 20h BRT), header `x-cron-secret`
- Seed: `npx tsx src/scripts/seed-video-competitors.ts` (revisar perfis no IG antes!)

## Padrões

- Prisma client: `@/generated/prisma/client` (gerado em `src/generated/prisma`)
- Auth: middleware global em `/middleware.ts` — `/api/admin/*` protegido via `ADMIN_TOKEN_COOKIE`. Rotas não precisam de auth middleware próprio.
- Cron: header `x-cron-secret` ou `?secret=` contra `CRON_SECRET`
- AgentKnowledge: campos `kind` (não type), `body` (não content), `source`, `metadata` (Json)

## Commands

```bash
npm run dev                                   # dev server
npx prisma migrate dev --name <name>          # migration local
npx prisma generate                            # regen client
npx tsc --noEmit                              # type check
```
