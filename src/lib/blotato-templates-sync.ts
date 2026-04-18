// Sync de templates reais do Blotato → cache no DB.
// Uma consulta esse cache em runtime em vez de hardcodar catalog que pode
// ficar stale quando o Blotato atualizar os templates disponiveis no plano.
//
// Cache vive em AgentKnowledge(agentId=uma, kind=reference,
// source=blotato-templates, title=<templateId>). Cada template vira uma
// linha separada pra facilitar filtros (kind/source).

import { prisma } from "./prisma";
import { listTemplates, type BlotatoTemplate } from "./blotato-client";

export interface SyncedTemplate {
  id: string;
  name: string;
  type?: string;
  description?: string;
  category?: string;
  aspectRatio?: string;
}

export async function syncBlotatoTemplates(): Promise<{
  total: number;
  saved: number;
  updated: number;
  templates: SyncedTemplate[];
}> {
  // Inclui `inputs` pra saber schema esperado (tipos, obrigatorios, limites)
  const remote = await listTemplates({ fields: ["id", "name", "description", "type", "category", "aspectRatio", "inputs"] });
  let saved = 0;
  let updated = 0;

  for (const t of remote) {
    // Upsert por source+title (unique lookup). Prisma nao tem unique aqui,
    // entao deletamos o antigo e criamos novo — simples e idempotente.
    const existing = await prisma.agentKnowledge.findFirst({
      where: { agentId: "uma", source: "blotato-templates", title: t.id },
      select: { id: true },
    });
    const body = buildBody(t);
    if (existing) {
      await prisma.agentKnowledge.update({
        where: { id: existing.id },
        data: { body, metadata: JSON.parse(JSON.stringify(t)) },
      });
      updated++;
    } else {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "uma",
          kind: "reference",
          title: t.id,
          body,
          source: "blotato-templates",
          metadata: JSON.parse(JSON.stringify(t)),
        },
      });
      saved++;
    }
  }

  return {
    total: remote.length,
    saved,
    updated,
    templates: remote.map(toSynced),
  };
}

function buildBody(t: BlotatoTemplate): string {
  const parts: string[] = [];
  parts.push(`**${t.name}**`);
  if (t.description) parts.push(t.description);
  const meta: string[] = [];
  if (t.type) meta.push(`tipo: ${t.type}`);
  if (t.category) meta.push(`categoria: ${t.category}`);
  if (t.aspectRatio) meta.push(`aspect: ${t.aspectRatio}`);
  if (meta.length) parts.push(meta.join(" · "));
  return parts.join("\n\n");
}

function toSynced(t: BlotatoTemplate): SyncedTemplate {
  return {
    id: t.id,
    name: t.name,
    type: t.type,
    description: t.description,
    category: t.category,
    aspectRatio: t.aspectRatio,
  };
}

// Le templates cachados — se vazio, dispara sync automatico.
export async function getCachedTemplates(
  opts?: { autoSyncIfEmpty?: boolean }
): Promise<SyncedTemplate[]> {
  const autoSync = opts?.autoSyncIfEmpty ?? true;
  const cached = await prisma.agentKnowledge.findMany({
    where: { agentId: "uma", source: "blotato-templates" },
    select: { title: true, metadata: true },
    orderBy: { createdAt: "asc" },
  });

  if (cached.length === 0 && autoSync) {
    const res = await syncBlotatoTemplates();
    return res.templates;
  }

  return cached.map((c) => {
    const meta = (c.metadata ?? {}) as unknown as BlotatoTemplate;
    return {
      id: c.title,
      name: meta?.name ?? c.title,
      type: meta?.type,
      description: meta?.description,
      category: meta?.category,
      aspectRatio: meta?.aspectRatio,
    };
  });
}
