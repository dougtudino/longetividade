"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import { CREATIVES_REGISTRY } from "@/components/creatives/registry";
import { CREATIVE_PRESETS } from "@/lib/creative-presets";
import { CREATIVE_PACKS } from "@/lib/creative-packs";
import { CAMPAIGN_PACKS } from "@/lib/creative-campaign-packs";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  EmptyState,
  Alert,
} from "@/components/admin/ui";

type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  creativesCount: number;
  createdAt: string;
};

type CreativeItem = {
  id: string;
  slug: string;
  componentKey: string;
  name: string;
  format: string;
  width: number;
  height: number;
  description: string | null;
  tags: string[];
  metaImageHash: string | null;
  imageUrl?: string | null;
  aiGenerated?: boolean;
  createdAt: string;
};

type CollectionDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  creatives: CreativeItem[];
};

export default function CriativosPage() {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modals
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newForm, setNewForm] = useState({
    slug: "",
    name: "",
    description: "",
    icon: "✨",
  });
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiForm, setAiForm] = useState<{
    slug: string;
    name: string;
    format: "feed" | "story" | "banner";
    briefing: string;
    angle: "dor" | "prova" | "objecao" | "promessa" | "cta";
    headline: string;
    cta: string;
    style:
      | "auto"
      | "talking-head"
      | "slideshow"
      | "quote-card"
      | "infographic"
      | "carousel";
    presetTemplateId?: string;
    presetSlides?: Array<{ imagePrompt: string; textOverlay: string }>;
    presetQuotes?: string[];
  }>({
    slug: "",
    name: "",
    format: "feed",
    briefing: "",
    angle: "dor",
    headline: "",
    cta: "Saiba mais",
    style: "auto",
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<{
    creativeId: string;
    imageUrl: string;
    metaImageHash: string | null;
    umaRationale: string;
    quinnVerdict: { severity: string; issues: string[]; reasoning: string };
    skippedMetaUpload: boolean;
  } | null>(null);

  const [packGenerating, setPackGenerating] = useState(false);
  const [packResult, setPackResult] = useState<{
    ok: boolean;
    packLabel?: string;
    succeeded?: number;
    failed?: number;
    results?: Array<{ slideName: string; ok: boolean; imageUrl?: string; error?: string }>;
    error?: string;
  } | null>(null);
  const [packForm, setPackForm] = useState({ packId: "pack-metodo-sem", slugBase: "pack" });

  async function generatePack(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCollection) return;
    setPackGenerating(true);
    setPackResult(null);
    try {
      const res = await fetch("/api/admin/creatives/ai-generate-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: selectedCollection.id, ...packForm }),
      });
      const data = await res.json();
      setPackResult(data);
      await loadCollectionDetail(selectedCollection.slug);
    } catch (err) {
      setPackResult({ ok: false, error: (err as Error).message });
    } finally {
      setPackGenerating(false);
    }
  }

  const loadCollections = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creatives/collections");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { collections: [] };
      setCollections(data.collections ?? []);
      if (data.warning) {
        setError(data.warning);
        if (
          data.warning.includes("does not exist") ||
          data.warning.includes("nao existe")
        ) {
          setNeedsMigration(true);
        }
      } else {
        setNeedsMigration(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  async function runMigration() {
    setMigrating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/migrate/schema", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setNeedsMigration(false);
        const applied = (data.results ?? []).filter((r: { ok: boolean }) => r.ok).length;
        const total = (data.results ?? []).length;
        alert(`Schema aplicado ${applied}/${total} statements. Veja console pra detalhes.`);
        console.log("[migrate] results:", data.results);
        await loadCollections();
        if (selectedSlug) await loadCollectionDetail(selectedSlug);
      } else {
        const failed = (data.results ?? [])
          .filter((r: { ok: boolean }) => !r.ok)
          .map((r: { label: string; error?: string }) => `${r.label}: ${r.error}`)
          .join(" · ");
        setError(`Migration falhou: ${failed || "erro desconhecido"}`);
      }
    } catch (e) {
      setError(`Migration falhou: ${(e as Error).message}`);
    } finally {
      setMigrating(false);
    }
  }

  const loadCollectionDetail = useCallback(async (slug: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/creatives/collections/${slug}`);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { ok: false, error: "Vazio" };
      if (data.ok) {
        setSelectedCollection(data.collection);
      } else {
        setError(data.error ?? "Falha ao carregar");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (selectedSlug) {
      loadCollectionDetail(selectedSlug);
    } else {
      setSelectedCollection(null);
    }
  }, [selectedSlug, loadCollectionDetail]);

  async function seedInitial() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creatives/seed", { method: "POST" });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { ok: false, error: "Vazio" };
      if (data.ok === false && data.error) setError(data.error);
      await loadCollections();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.slug || !newForm.name) return;
    try {
      const res = await fetch("/api/admin/creatives/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (data.ok) {
        setCreatingCollection(false);
        setNewForm({ slug: "", name: "", description: "", icon: "✨" });
        await loadCollections();
      } else {
        setError(data.error ?? "Falha ao criar");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function generateAi(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCollection) return;
    setAiGenerating(true);
    setAiResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/creatives/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: selectedCollection.id,
          ...aiForm,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "falha");
      } else {
        setAiResult(data);
        await loadCollectionDetail(selectedCollection.slug);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAiGenerating(false);
    }
  }

  async function downloadCreative(creative: CreativeItem) {
    // AI-generated → baixa direto da URL
    if (creative.aiGenerated && creative.imageUrl) {
      const a = document.createElement("a");
      a.href = creative.imageUrl;
      a.download = `${selectedCollection?.slug}-${creative.slug}.jpg`;
      a.target = "_blank";
      a.click();
      return;
    }
    // React-based → html-to-image
    const node = refs.current[creative.slug];
    if (!node) {
      setError(`Nao encontrei o criativo ${creative.slug}`);
      return;
    }
    setDownloadingId(creative.slug);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 1,
        width: creative.width,
        height: creative.height,
      });
      const link = document.createElement("a");
      link.download = `${selectedCollection?.slug}-${creative.slug}-${creative.width}x${creative.height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      setError(`Erro: ${(e as Error).message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadAll() {
    if (!selectedCollection) return;
    for (const c of selectedCollection.creatives) {
      await downloadCreative(c);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const header = (
    <>
      <PageHeader
        title={selectedCollection ? selectedCollection.name : "Criativos · Meta Ads"}
        subtitle={
          selectedCollection
            ? selectedCollection.description ??
              `${selectedCollection.creatives.length} criativos nesta coleção`
            : "Passo 2 do fluxo Meta Ads. Crie 1 coleção por campanha e gere 3-10 criativos (dor/prova/objeção/promessa/CTA). Uma + Quinn + Blotato fazem. Para posts orgânicos, use Social Media 🌙."
        }
        icon={selectedCollection ? selectedCollection.icon ?? "📁" : "🎨"}
        breadcrumb={
          selectedSlug ? (
            <button
              onClick={() => setSelectedSlug(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ← Todas as coleções
            </button>
          ) : undefined
        }
        actions={
          <>
            {!selectedSlug && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setCreatingCollection(true)}
                >
                  + Nova coleção
                </Button>
                <Button onClick={seedInitial} loading={seeding}>
                  ↓ Seed LAUNCH-001
                </Button>
              </>
            )}
            {selectedSlug && selectedCollection && (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    const campaignPackId = prompt(
                      `🚀 Campanha completa\n\n${CAMPAIGN_PACKS.map(
                        (p) =>
                          `${p.icon} ${p.label}\n   ${p.description}\n   → ID: ${p.id}`
                      ).join("\n\n")}\n\nDigite o ID:`,
                      "cp-launch-full"
                    );
                    if (!campaignPackId) return;
                    const slugBase = prompt(
                      "Slug base (ex: 'launch-001'):",
                      "campaign"
                    );
                    if (!slugBase) return;
                    setPackGenerating(true);
                    setPackResult(null);
                    fetch("/api/admin/creatives/ai-generate-campaign", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        collectionId: selectedCollection.id,
                        campaignPackId,
                        slugBase,
                      }),
                    })
                      .then((r) => r.json())
                      .then(async (d) => {
                        setPackResult({
                          ...d,
                          results: d.results?.map((r: { angleLabel: string; formatLabel: string; ok: boolean; error?: string }) => ({
                            slideName: `${r.angleLabel} · ${r.formatLabel}`,
                            ok: r.ok,
                            error: r.error,
                          })),
                        });
                        await loadCollectionDetail(selectedCollection.slug);
                      })
                      .catch((e) => setPackResult({ ok: false, error: e.message }))
                      .finally(() => setPackGenerating(false));
                  }}
                  loading={packGenerating}
                  title="Gera bateria completa (feed + story + reel) pra campanha Meta Ads"
                >
                  🚀 Campanha completa
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const packId = prompt(
                      `Qual pack?\n${CREATIVE_PACKS.map((p, i) => `${i + 1}. ${p.label}`).join("\n")}\n\nDigite o ID:`,
                      "pack-metodo-sem"
                    );
                    if (!packId) return;
                    const slugBase = prompt("Slug base (ex: 'launch-001'):", "pack");
                    if (!slugBase) return;
                    setPackForm({ packId, slugBase });
                    setPackGenerating(true);
                    setPackResult(null);
                    fetch("/api/admin/creatives/ai-generate-pack", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        collectionId: selectedCollection.id,
                        packId,
                        slugBase,
                      }),
                    })
                      .then((r) => r.json())
                      .then(async (d) => {
                        setPackResult(d);
                        await loadCollectionDetail(selectedCollection.slug);
                      })
                      .catch((e) => setPackResult({ ok: false, error: e.message }))
                      .finally(() => setPackGenerating(false));
                  }}
                  loading={packGenerating}
                  title="Gera 5 criativos do pack pra subir como Carousel Ad no Meta"
                >
                  📦 Pack carrossel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setAiPanelOpen(true);
                    setAiResult(null);
                  }}
                >
                  ✨ Gerar com IA (Uma)
                </Button>
                {selectedCollection.creatives.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={downloadAll}
                    loading={!!downloadingId}
                  >
                    ↓ Baixar todos
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={runMigration}
              loading={migrating}
              title="Aplica colunas/tabelas novas (aiGenerated, imageUrl, CreativeCopy). Idempotente — pode rodar varias vezes."
            >
              ⚡ Migrar schema
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 18 }}>
        <PageHelp
          pageId="criativos"
          agent={{ icon: "🎨", name: "Uma", role: "UX Designer / Criativos" }}
          title="Galeria + geração via IA"
          quickActions={[
            {
              label: "Seed inicial",
              description:
                "Popula LAUNCH-001 com os 6 criativos React atuais (idempotente)",
            },
            {
              label: "Gerar com IA",
              description:
                "Uma escolhe template Blotato + prompt, Quinn valida Meta Policy, auto-upload pra /adimages",
            },
            {
              label: "Abrir coleção",
              description: "Click num card → preview + download + variantes de copy (A/B)",
            },
            {
              label: "Baixar",
              description: "PNG 1:1 pra React-based, URL Blotato direto pra IA-based",
            },
          ]}
        >
          <p>
            Novo fluxo: ao gerar um criativo, a Uma consulta knowledge base (persona,
            playbook, aprendizados) e escolhe template + paleta + hook. Quinn valida
            antes + depois do render. Se passar, o PNG é uploadado automaticamente
            pra Meta Ad Images — o <code>metaImageHash</code> já sai populado pronto
            pra usar em campanhas.
          </p>
        </PageHelp>
      </div>

      {packResult && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            tone={packResult.ok ? "success" : "danger"}
            title={packResult.ok ? `Pack gerado: ${packResult.succeeded}/${packResult.results?.length ?? 0}` : "Pack falhou"}
            action={
              <Button size="sm" variant="ghost" onClick={() => setPackResult(null)}>
                ✕
              </Button>
            }
          >
            {packResult.error ?? (
              <div style={{ fontSize: 11 }}>
                {packResult.results?.map((r, i) => (
                  <div key={i} style={{ marginBottom: 2 }}>
                    {r.ok ? "✓" : "✗"} {r.slideName}
                    {r.error && ` — ${r.error.slice(0, 80)}`}
                  </div>
                ))}
                <div style={{ marginTop: 8, opacity: 0.8 }}>
                  💡 Baixa as 5 imagens aqui da galeria e sobe no Meta Ads Manager
                  como Carousel Ad.
                </div>
              </div>
            )}
          </Alert>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            tone="danger"
            title="Erro"
            action={
              needsMigration && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={runMigration}
                  loading={migrating}
                >
                  ⚡ Aplicar schema
                </Button>
              )
            }
          >
            {error}
          </Alert>
        </div>
      )}
    </>
  );

  // ─── MODE 1: lista de coleções ────────────────────────
  if (!selectedSlug) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {header}

        {loadingList && (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Carregando coleções...
          </div>
        )}

        {!loadingList && collections.length === 0 && !error && (
          <EmptyState
            icon="📁"
            title="Nenhuma coleção ainda"
            description="Clica Seed LAUNCH-001 pra popular com os 6 criativos atuais, ou crie uma coleção vazia."
            action={
              <Button onClick={seedInitial} loading={seeding}>
                Seed inicial
              </Button>
            }
          />
        )}

        {collections.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {collections.map((c) => (
              <Card
                key={c.slug}
                interactive
                onClick={() => setSelectedSlug(c.slug)}
              >
                <CardHeader
                  title={c.name}
                  subtitle={<code style={{ fontSize: 11 }}>{c.slug}</code>}
                  icon={c.icon ?? "📁"}
                />
                {c.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 14px 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {c.description.length > 140
                      ? c.description.slice(0, 140) + "..."
                      : c.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "0.5px solid var(--border-subtle)",
                  }}
                >
                  <Badge tone="accent" size="sm">
                    {c.creativesCount} criativo{c.creativesCount === 1 ? "" : "s"}
                  </Badge>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: nova coleção */}
        {creatingCollection && (
          <>
            <div
              onClick={() => setCreatingCollection(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 100,
              }}
            />
            <form
              onSubmit={createCollection}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "var(--bg-primary)",
                border: "0.5px solid var(--border-default)",
                borderRadius: 14,
                padding: 28,
                width: "min(480px, 92vw)",
                zIndex: 101,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Nova coleção
              </h2>
              <Input
                label="Slug (URL-friendly)"
                value={newForm.slug}
                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                placeholder="launch-002-retarget"
                required
                style={{ fontFamily: "monospace" }}
              />
              <Input
                label="Nome"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="LAUNCH-002 · Retargeting"
                required
              />
              <Input
                label="Ícone (emoji)"
                value={newForm.icon}
                onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                style={{ width: 100 }}
              />
              <Textarea
                label="Descrição"
                value={newForm.description}
                onChange={(e) =>
                  setNewForm({ ...newForm, description: e.target.value })
                }
                rows={3}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCreatingCollection(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Criar coleção</Button>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  // ─── MODE 2: detalhe ────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {header}

      {loadingDetail && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Carregando coleção...
        </div>
      )}

      {selectedCollection && selectedCollection.creatives.length === 0 && (
        <EmptyState
          icon="🎨"
          title="Coleção vazia"
          description="Gere criativos via IA (Uma + Blotato + Quinn) ou adicione via seed/API."
          action={
            <Button onClick={() => setAiPanelOpen(true)}>
              ✨ Gerar primeiro criativo com IA
            </Button>
          }
        />
      )}

      {selectedCollection && selectedCollection.creatives.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedCollection.creatives.map((c) => {
            const isAi = c.aiGenerated || c.componentKey.startsWith("ai:");
            return (
              <Card key={c.id} padding={20}>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Preview */}
                  <div style={{ flexShrink: 0 }}>
                    {isAi && c.imageUrl ? (
                      <AiPreview creative={c} />
                    ) : (
                      <ReactPreview creative={c} refs={refs} />
                    )}
                  </div>
                  {/* Meta + ações */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 240,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                    >
                      <Badge tone="accent" size="sm">
                        {c.format} · {c.width}×{c.height}
                      </Badge>
                      {isAi && <Badge tone="info" size="sm">✨ IA</Badge>}
                      {c.metaImageHash && (
                        <Badge tone="success" size="sm" dot>
                          Meta pronto
                        </Badge>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.2,
                      }}
                    >
                      {c.name}
                    </div>
                    {c.description && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {c.description}
                      </p>
                    )}
                    {c.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {c.tags.map((t) => (
                          <Badge key={t} size="sm">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Button
                        size="sm"
                        onClick={() => downloadCreative(c)}
                        loading={downloadingId === c.slug}
                      >
                        ↓ Baixar
                      </Button>
                    </div>
                    {c.metaImageHash && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          fontFamily: "monospace",
                          marginTop: 4,
                        }}
                      >
                        Meta hash:{" "}
                        <code>{c.metaImageHash.slice(0, 20)}...</code>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Panel: geração IA */}
      {aiPanelOpen && (
        <>
          <div
            onClick={() => !aiGenerating && setAiPanelOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 100,
            }}
          />
          <form
            onSubmit={generateAi}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(560px, 100vw)",
              background: "var(--bg-primary)",
              borderLeft: "0.5px solid var(--border-default)",
              zIndex: 101,
              padding: 28,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  ✨ Gerar criativo com IA
                </h2>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  Uma escolhe template + Quinn valida Meta Policy + auto-upload pra /adimages
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => !aiGenerating && setAiPanelOpen(false)}
              >
                ✕
              </Button>
            </div>

            {/* Presets — 1 clique preenche o form */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Presets prontos (clique pra preencher)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CREATIVE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setAiForm({
                        ...aiForm,
                        slug: p.slug,
                        name: p.name,
                        angle: p.angle,
                        headline: p.headline,
                        briefing: p.briefing,
                        style: p.style,
                        // Playbook-aligned: passa templateId + slides/quotes se preset os tem
                        presetTemplateId: p.templateId,
                        presetSlides: p.slides,
                        presetQuotes: p.quotes,
                      })
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "0.5px solid var(--border-default)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--accent-soft)";
                      e.currentTarget.style.color = "var(--accent-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input
                label="Slug"
                value={aiForm.slug}
                onChange={(e) => setAiForm({ ...aiForm, slug: e.target.value })}
                placeholder="ai-dor-01"
                required
                style={{ fontFamily: "monospace" }}
              />
              <Select
                label="Formato"
                value={aiForm.format}
                onChange={(e) =>
                  setAiForm({
                    ...aiForm,
                    format: e.target.value as "feed" | "story" | "banner",
                  })
                }
              >
                <option value="feed">Feed 1080×1080</option>
                <option value="story">Story 1080×1920</option>
                <option value="banner">Banner 1200×628</option>
              </Select>
            </div>
            <Input
              label="Nome do criativo"
              value={aiForm.name}
              onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
              placeholder="Dor: dietas restritivas falham"
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Select
                label="Ângulo"
                value={aiForm.angle}
                onChange={(e) =>
                  setAiForm({ ...aiForm, angle: e.target.value as typeof aiForm.angle })
                }
              >
                <option value="dor">Dor</option>
                <option value="prova">Prova social</option>
                <option value="objecao">Quebra de objeção</option>
                <option value="promessa">Promessa</option>
                <option value="cta">CTA direto</option>
              </Select>
              <Input
                label="CTA"
                value={aiForm.cta}
                onChange={(e) => setAiForm({ ...aiForm, cta: e.target.value })}
                placeholder="Saiba mais"
              />
            </div>
            <Select
              label="Estilo visual"
              value={aiForm.style}
              onChange={(e) =>
                setAiForm({ ...aiForm, style: e.target.value as typeof aiForm.style })
              }
              hint="Controla QUAL tipo de template Uma vai escolher. 'Talking head' gera vídeo com mulher falando (55+cr). 'Slideshow/Quote card' são imagens estáticas (1cr)."
            >
              <option value="auto">Uma decide (padrão)</option>
              <option value="talking-head">🎤 Talking head — mulher falando (vídeo)</option>
              <option value="slideshow">🖼️ Slideshow — imagens com texto</option>
              <option value="quote-card">💬 Quote card — frase forte</option>
              <option value="infographic">📊 Infográfico — educativo/impacto</option>
              <option value="carousel">📑 Carrossel — passo-a-passo</option>
            </Select>
            <Input
              label="Headline (aparece no visual)"
              value={aiForm.headline}
              onChange={(e) => setAiForm({ ...aiForm, headline: e.target.value })}
              placeholder="Você não precisa de mais uma dieta"
              hint="Curta. Uma usa como texto overlay quando fizer sentido."
            />
            <Textarea
              label="Briefing / contexto"
              value={aiForm.briefing}
              onChange={(e) => setAiForm({ ...aiForm, briefing: e.target.value })}
              placeholder="Público: mulher 40+ cansada de dietas restritivas. Dor: ansiedade com balança. Prova: método S.E.M funciona sem contar caloria. CTA: conhecer o ebook."
              rows={6}
              required
            />

            <Alert tone="info" title="O que acontece ao gerar">
              1. Uma consulta knowledge + aprendizados · 2. Quinn valida briefing
              (block = aborta antes de gastar credit) · 3. Blotato renderiza · 4.
              Quinn revalida · 5. Upload Meta /adimages · 6. Salvo na coleção.
            </Alert>

            {aiResult && (
              <Card padding={14}>
                <CardHeader
                  title="Resultado"
                  right={
                    <Badge
                      tone={
                        aiResult.quinnVerdict.severity === "pass"
                          ? "success"
                          : aiResult.quinnVerdict.severity === "warn"
                            ? "warn"
                            : "danger"
                      }
                      size="sm"
                    >
                      Quinn: {aiResult.quinnVerdict.severity}
                    </Badge>
                  }
                />
                {aiResult.imageUrl &&
                  (/\.(mp4|webm|mov)(\?|$)/i.test(aiResult.imageUrl) ? (
                    <video
                      src={aiResult.imageUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginBottom: 10,
                        border: "0.5px solid var(--border-subtle)",
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={aiResult.imageUrl}
                      alt="creative"
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginBottom: 10,
                        border: "0.5px solid var(--border-subtle)",
                      }}
                    />
                  ))}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Uma:</strong> {aiResult.umaRationale}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}
                >
                  <strong>Quinn:</strong> {aiResult.quinnVerdict.reasoning}
                </div>
                {aiResult.skippedMetaUpload && (
                  <div style={{ marginTop: 10 }}>
                    <Alert tone="warn">
                      Upload pra Meta pulado (creds ausentes ou erro — cheque{" "}
                      <Link href="/admin/configuracoes" style={{ color: "inherit" }}>
                        Configurações
                      </Link>
                      )
                    </Alert>
                  </div>
                )}
                {aiResult.metaImageHash && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 8,
                      fontFamily: "monospace",
                    }}
                  >
                    Meta hash:{" "}
                    <code>{aiResult.metaImageHash}</code>
                  </div>
                )}
              </Card>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAiPanelOpen(false)}
                disabled={aiGenerating}
              >
                Fechar
              </Button>
              <Button type="submit" loading={aiGenerating}>
                {aiGenerating ? "Gerando (Uma + Blotato + Quinn)..." : "Gerar"}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function AiPreview({ creative }: { creative: CreativeItem }) {
  const url = creative.imageUrl ?? "";
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
  const previewWidth = Math.min(360, creative.width * 0.35);
  return (
    <div
      style={{
        width: previewWidth,
        borderRadius: 10,
        border: "0.5px solid var(--border-subtle)",
        overflow: "hidden",
        background: "#000",
        aspectRatio: `${creative.width} / ${creative.height}`,
      }}
    >
      {isVideo ? (
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={creative.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

function ReactPreview({
  creative,
  refs,
}: {
  creative: CreativeItem;
  refs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const entry = CREATIVES_REGISTRY[creative.componentKey];
  if (!entry) {
    return (
      <Alert tone="warn">
        Componente <code>{creative.componentKey}</code> não encontrado no registry.
      </Alert>
    );
  }
  const Comp = entry.Component as React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement>
  >;
  const aspect = creative.height / creative.width;
  const previewWidth = Math.min(360, creative.width);
  const previewHeight = previewWidth * aspect;
  const scale = previewWidth / creative.width;
  return (
    <div
      style={{
        width: previewWidth,
        height: previewHeight,
        overflow: "hidden",
        borderRadius: 10,
        border: "0.5px solid var(--border-subtle)",
        background: "#000",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: creative.width,
          height: creative.height,
        }}
      >
        <Comp
          ref={(el: HTMLDivElement | null) => {
            refs.current[creative.slug] = el;
          }}
        />
      </div>
    </div>
  );
}
