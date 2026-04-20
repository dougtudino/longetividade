"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/ui";

type Interest = { id: string; name: string };

type AdSet = {
  id: string;
  orderIndex: number;
  adSetKey: string;
  layer: string;
  activateOn: string;
  budgetDailyBrl: number;
  ageMin: number;
  ageMax: number;
  genders: string[];
  countries: string[];
  interests: Interest[] | null;
  behaviors: unknown;
  customAudienceKeys: string[];
  excludedAudienceKeys: string[];
  optimizationGoal: string;
  promotedObjectEvent: string;
  creativesCollectionId: string | null;
  creativesAngles: string[];
  numAds: number;
  metaAdSetId: string | null;
  status: string;
  statusMessage: string | null;
  updatedAt?: string;
};

type Audience = {
  id: string;
  orderIndex: number;
  audienceKey: string;
  audienceType: string;
  eventName: string | null;
  retentionDays: number | null;
  lookalikeSourceKey: string | null;
  lookalikeCountry: string | null;
  lookalikeRatio: number | null;
  metaAudienceId: string | null;
  status: string;
  statusMessage: string | null;
};

type Blueprint = {
  id: string;
  launchId: string;
  name: string;
  status: string;
  productName: string;
  productPriceBrl: number;
  productHotmartId: string | null;
  landingUrl: string;
  pixelId: string;
  datasetName: string;
  adAccountId: string;
  businessManagerId: string;
  campaignName: string;
  campaignObjective: string;
  budgetTotalBrl: number;
  advantageBudget: boolean;
  metaCampaignId: string | null;
  launchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  audiences: Audience[];
  adSets: AdSet[];
};

type CopyData = {
  id: string;
  label: string;
  headline: string;
  description: string | null;
  cta: string | null;
  primaryText: string | null;
};

type CreativeData = {
  id: string;
  slug: string;
  name: string;
  format: string;
  metaImageHash: string | null;
  tags: string[];
  copies: CopyData[];
};

type Collection = {
  id: string;
  slug: string;
  name: string;
  creatives: CreativeData[];
};

type BlueprintSummary = {
  id: string;
  launchId: string;
  name: string;
  status: string;
  budgetTotalBrl: number;
  metaCampaignId: string | null;
  launchedAt: string | null;
  createdAt: string;
  _count: { audiences: number; adSets: number };
};

const LAYER_COLOR: Record<string, string> = {
  cold: "#4A90D9",
  warm: "#D4A94B",
  hot: "#C4787A",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#888",
  ready: "#4A90D9",
  launched: "#6B9E6B",
  paused: "#D4A94B",
  archived: "#888",
  pending: "#888",
  operational: "#6B9E6B",
  processing: "#D4A94B",
  failed: "#C4787A",
  created: "#6B9E6B",
};

export default function LaunchBlueprintPage() {
  const [list, setList] = useState<BlueprintSummary[]>([]);
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [duplicating, setDuplicating] = useState(false);
  const [expandedAdSetId, setExpandedAdSetId] = useState<string | null>(null);
  const [audiencesOpen, setAudiencesOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<unknown>(null);
  const [dryRunResult, setDryRunResult] = useState<unknown>(null);
  const [preparing, setPreparing] = useState(false);
  const [prepareResult, setPrepareResult] = useState<{
    ok: boolean;
    ready: boolean;
    checklist: Array<{
      key: string;
      label: string;
      status: "ok" | "fixed" | "warning" | "error";
      detail?: string;
      actionUrl?: string;
      actionLabel?: string;
    }>;
  } | null>(null);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns/blueprint/list");
      const data = await res.json();
      setList(data.blueprints ?? []);
      if (!selectedLaunchId && data.blueprints?.[0]?.launchId) {
        setSelectedLaunchId(data.blueprints[0].launchId);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [selectedLaunchId]);

  const loadBlueprint = useCallback(async (launchId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/campaigns/blueprint/${launchId}`);
      const data = await res.json();
      if (data.ok) {
        setBlueprint(data.blueprint);
        setCollections(data.collections ?? []);
      } else {
        setError(data.error ?? "Falha");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedLaunchId) loadBlueprint(selectedLaunchId);
  }, [selectedLaunchId, loadBlueprint]);

  async function seedLaunch001() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaigns/blueprint/seed", { method: "POST" });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Falha no seed");
      await loadList();
      if (data.blueprint?.launchId) setSelectedLaunchId(data.blueprint.launchId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  async function patchAdSet(adSet: AdSet, patch: Record<string, unknown>) {
    if (!blueprint) return;
    setBusyId(adSet.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/campaigns/blueprint/${blueprint.launchId}/ad-sets/${adSet.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Falha");
        return;
      }
      setSavedId(adSet.id);
      setTimeout(() => setSavedId((cur) => (cur === adSet.id ? null : cur)), 2000);
      await loadBlueprint(blueprint.launchId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function patchBlueprint(patch: Record<string, unknown>) {
    if (!blueprint) return;
    setBusyId("blueprint");
    setError(null);
    try {
      const res = await fetch(`/api/admin/campaigns/blueprint/${blueprint.launchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Falha");
      else {
        setSavedId("blueprint");
        setTimeout(() => setSavedId((cur) => (cur === "blueprint" ? null : cur)), 2000);
        await loadBlueprint(blueprint.launchId);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function launchNow() {
    if (!blueprint) return;
    if (
      !confirm(
        `Lancar ${blueprint.launchId} no Meta? Todas as entidades serao criadas em PAUSED. Voce ativa manualmente depois.`
      )
    ) {
      return;
    }
    setLaunching(true);
    setLaunchResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/campaigns/blueprint/${blueprint.launchId}/launch`,
        { method: "POST" }
      );
      const data = await res.json();
      setLaunchResult(data);
      if (!data.ok) setError(data.summary?.warnings?.join(" · ") ?? "Launch retornou erro");
      await loadBlueprint(blueprint.launchId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLaunching(false);
    }
  }

  async function duplicateBlueprint() {
    if (!blueprint) return;
    const newId = prompt(
      `Duplicar "${blueprint.name}" como base pra nova LAUNCH.\n\nNovo launchId (ex: LAUNCH-002):`,
      "LAUNCH-002"
    );
    if (!newId) return;
    const newName = prompt(`Nome da nova LAUNCH (ex: LAUNCH-002-Sono):`, `${newId}-Pioneer`);
    const newProductName = prompt(
      `Nome do produto novo (deixa vazio pra copiar do atual "${blueprint.productName}"):`,
      ""
    );
    setDuplicating(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/campaigns/blueprint/${blueprint.launchId}/duplicate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newLaunchId: newId,
            newName: newName || undefined,
            newProductName: newProductName || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Falha");
      else {
        await loadList();
        setSelectedLaunchId(newId);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDuplicating(false);
    }
  }

  async function prepareForLaunch() {
    if (!blueprint) return;
    setPreparing(true);
    setPrepareResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/campaigns/blueprint/${blueprint.launchId}/prepare`,
        { method: "POST" }
      );
      const data = await res.json();
      setPrepareResult(data);
      if (!data.ok) setError(null); // warnings/errors ja aparecem no checklist
      await loadBlueprint(blueprint.launchId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPreparing(false);
    }
  }

  async function dryRun() {
    if (!blueprint) return;
    setLaunching(true);
    setDryRunResult(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/campaigns/blueprint/${blueprint.launchId}/dry-run`,
        { method: "POST" }
      );
      const data = await res.json();
      setDryRunResult(data);
      if (!data.ok) setError(data.error ?? "Dry-run falhou");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLaunching(false);
    }
  }

  const budgetSum = blueprint?.adSets.reduce((s, a) => s + a.budgetDailyBrl, 0) ?? 0;
  const warnings: string[] = [];
  if (blueprint) {
    if (budgetSum > blueprint.budgetTotalBrl) {
      warnings.push(`Soma de budgets dos ad sets (R$${budgetSum}) excede total da campanha (R$${blueprint.budgetTotalBrl})`);
    }
    for (const aset of blueprint.adSets) {
      if (aset.customAudienceKeys.length === 0 && (!aset.interests || aset.interests.length === 0) && aset.layer !== "cold") {
        warnings.push(`${aset.adSetKey}: sem interesses nem audiencias — Meta vai targetar o broad inteiro.`);
      }
    }
    const lookalike = blueprint.audiences.find((a) => a.audienceType === "lookalike");
    if (lookalike && lookalike.status === "processing") {
      warnings.push(`Lookalike ${lookalike.audienceKey} em processamento no Meta — aguarde antes de ativar ad set ${lookalike.audienceKey}.`);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        title="Blueprint da campanha"
        subtitle="Edita o documento mestre da LAUNCH. Todos os ad sets, audiencias e orcamento ficam editaveis aqui antes do launch."
        icon="🗺️"
      />

      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(196,120,122,0.12)",
            border: "0.5px solid rgba(196,120,122,0.4)",
            borderRadius: 10,
            color: "#C4787A",
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Cards horizontais de launches */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
          marginBottom: 20,
        }}
      >
        {list.map((bp) => {
          const isActive = selectedLaunchId === bp.launchId;
          return (
            <button
              key={bp.launchId}
              onClick={() => setSelectedLaunchId(bp.launchId)}
              style={{
                minWidth: 220,
                padding: 14,
                background: isActive ? "var(--bg-card)" : "var(--bg-secondary)",
                border: `0.5px solid ${isActive ? "var(--accent)" : "var(--border-default)"}`,
                borderRadius: 12,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                {bp.name}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: `${STATUS_COLOR[bp.status] ?? "#888"}22`,
                    color: STATUS_COLOR[bp.status] ?? "#888",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {bp.status}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  R${bp.budgetTotalBrl}/d · {bp._count?.adSets ?? 0} ad sets
                </span>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {new Date(bp.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </button>
          );
        })}
        {list.length === 0 && (
          <button
            onClick={seedLaunch001}
            disabled={seeding}
            style={{
              minWidth: 220,
              padding: 14,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {seeding ? "Criando..." : "+ Seed LAUNCH-001"}
          </button>
        )}
      </div>

      {!blueprint && list.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Nenhum blueprint ainda. Clica em &quot;Seed LAUNCH-001&quot; acima pra popular.
        </div>
      )}

      {blueprint && (
        <>
          {/* Card Produto e campanha */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  📦 Produto e campanha
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {blueprint.productName} · R${blueprint.productPriceBrl} · Pixel {blueprint.pixelId}
                </div>
              </div>
              {savedId === "blueprint" && <span style={savedBadgeStyle}>✓ salvo</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
              <LabeledReadonly label="Campaign name" value={blueprint.campaignName} />
              <LabeledReadonly label="Objective" value={blueprint.campaignObjective} />
              <LabeledReadonly label="Landing" value={blueprint.landingUrl} />
              <LabeledReadonly label="Ad account" value={blueprint.adAccountId} />
              <div>
                <div style={labelStyle}>Budget total diário (R$)</div>
                <input
                  type="number"
                  defaultValue={blueprint.budgetTotalBrl}
                  onBlur={(e) => {
                    const v = parseInt(e.currentTarget.value, 10);
                    if (!isNaN(v) && v !== blueprint.budgetTotalBrl) patchBlueprint({ budgetTotalBrl: v });
                  }}
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: budgetSum > blueprint.budgetTotalBrl ? "#C4787A" : "var(--text-muted)", marginTop: 4 }}>
                  Soma ad sets: R${budgetSum}/dia
                </div>
              </div>
              <div>
                <div style={labelStyle}>Status</div>
                <select
                  value={blueprint.status}
                  onChange={(e) => patchBlueprint({ status: e.currentTarget.value })}
                  style={inputStyle}
                >
                  <option value="draft">draft</option>
                  <option value="ready">ready</option>
                  <option value="launched">launched</option>
                  <option value="paused">paused</option>
                  <option value="archived">archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card Audiencias */}
          <div style={cardStyle}>
            <button
              onClick={() => setAudiencesOpen((v) => !v)}
              style={{
                ...cardHeaderStyle,
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  🎯 Audiencias ({blueprint.audiences.length})
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {blueprint.audiences.filter((a) => a.metaAudienceId).length} criadas no Meta · {audiencesOpen ? "fechar" : "expandir"}
                </div>
              </div>
              <span style={{ fontSize: 18, color: "var(--text-muted)" }}>{audiencesOpen ? "▲" : "▼"}</span>
            </button>
            {audiencesOpen && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {blueprint.audiences.map((a) => (
                  <div key={a.id} style={{ padding: 10, background: "var(--bg-secondary)", borderRadius: 8, fontSize: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ color: "var(--text-primary)" }}>{a.audienceKey}</strong>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${STATUS_COLOR[a.status] ?? "#888"}22`, color: STATUS_COLOR[a.status] ?? "#888", fontWeight: 700, textTransform: "uppercase" }}>
                        {a.status}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {a.audienceType === "website_event"
                          ? `event=${a.eventName} · ${a.retentionDays}d`
                          : `lookalike source=${a.lookalikeSourceKey} · ${a.lookalikeRatio} · ${a.lookalikeCountry}`}
                      </span>
                    </div>
                    {a.metaAudienceId && (
                      <code style={{ fontSize: 11, color: "var(--text-muted)" }}>Meta ID: {a.metaAudienceId}</code>
                    )}
                    {a.statusMessage && (
                      <div style={{ fontSize: 11, color: "#C4787A", marginTop: 4 }}>{a.statusMessage}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mapa hierarquico da campanha */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              🗺 Mapa da campanha
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
              Visão hierárquica do que vai pro Meta: campanha → ad sets → ads (creative + copy)
            </div>
            <CampaignMap blueprint={blueprint} collections={collections} />
          </div>

          {/* Ad sets */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
              📊 Ad sets ({blueprint.adSets.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {blueprint.adSets.map((aset) => (
                <AdSetCard
                  key={aset.id}
                  aset={aset}
                  collection={collections.find((c) => c.slug === aset.creativesCollectionId) ?? null}
                  expanded={expandedAdSetId === aset.id}
                  onToggle={() => setExpandedAdSetId((cur) => (cur === aset.id ? null : aset.id))}
                  busy={busyId === aset.id}
                  saved={savedId === aset.id}
                  onSave={(patch) => patchAdSet(aset, patch)}
                />
              ))}
            </div>
          </div>

          {/* Checklist de pre-lancamento */}
          {warnings.length > 0 && (
            <div style={{ ...cardStyle, border: "0.5px solid #D4A94B" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#D4A94B", marginBottom: 10 }}>
                ⚠️ Checklist de pre-lancamento
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {/* Checklist de preparacao */}
          {prepareResult && (
            <div
              style={{
                ...cardStyle,
                border: `0.5px solid ${
                  prepareResult.ready
                    ? "#6B9E6B"
                    : prepareResult.ok
                    ? "#D4A94B"
                    : "#C4787A"
                }`,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 10,
                }}
              >
                {prepareResult.ready
                  ? "✅ Pronto pra lançar"
                  : prepareResult.ok
                  ? "⚠️ Pronto com warnings"
                  : "❌ Precisa corrigir antes de lançar"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {prepareResult.checklist.map((item) => {
                  const icon =
                    item.status === "ok"
                      ? "✓"
                      : item.status === "fixed"
                      ? "🔧"
                      : item.status === "warning"
                      ? "⚠"
                      : "✗";
                  const color =
                    item.status === "ok" || item.status === "fixed"
                      ? "#6B9E6B"
                      : item.status === "warning"
                      ? "#D4A94B"
                      : "#C4787A";
                  return (
                    <div
                      key={item.key}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: 10,
                        background: "var(--bg-secondary)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color, fontSize: 14, fontWeight: 700, minWidth: 20 }}>
                        {icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {item.label}
                        </div>
                        {item.detail && (
                          <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                            {item.detail}
                          </div>
                        )}
                      </div>
                      {item.actionUrl && item.actionLabel && (
                        <a
                          href={item.actionUrl}
                          style={{
                            padding: "4px 10px",
                            background: color,
                            color: "#fff",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.actionLabel} →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acoes finais */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <button
              onClick={prepareForLaunch}
              disabled={preparing || launching}
              style={{
                padding: "10px 18px",
                background: "#4A90D9",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {preparing ? "Verificando..." : "🔧 Preparar pra lançamento"}
            </button>
            <button
              onClick={launchNow}
              disabled={launching || preparing}
              style={{
                padding: "10px 18px",
                background: "#6B9E6B",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {launching ? "..." : "🚀 Lancar no Meta (tudo PAUSED)"}
            </button>
            <button
              onClick={dryRun}
              disabled={launching || preparing}
              style={{
                padding: "10px 18px",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "0.5px solid var(--border-default)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ver dry-run
            </button>
            <button
              onClick={duplicateBlueprint}
              disabled={duplicating || launching || preparing}
              style={{
                padding: "10px 18px",
                background: "transparent",
                color: "var(--text-muted)",
                border: "0.5px solid var(--border-default)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "auto",
              }}
              title="Duplica esse blueprint como base pra nova LAUNCH (Sono, Jejum, etc)"
            >
              {duplicating ? "..." : "📋 Duplicar pra nova LAUNCH"}
            </button>
          </div>

          {launchResult != null && (
            <pre style={resultBoxStyle}>{JSON.stringify(launchResult, null, 2)}</pre>
          )}
          {dryRunResult != null && (
            <pre style={resultBoxStyle}>{JSON.stringify(dryRunResult, null, 2)}</pre>
          )}
        </>
      )}
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────

function AdSetCard({
  aset,
  collection,
  expanded,
  onToggle,
  busy,
  saved,
  onSave,
}: {
  aset: AdSet;
  collection: Collection | null;
  expanded: boolean;
  onToggle: () => void;
  busy: boolean;
  saved: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; audienceSize: number | null; path: string | null; topic: string | null }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const interests = aset.interests ?? [];

  // Debounced search — chama Meta Targeting Search API 300ms apos ultimo keystroke
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/admin/campaigns/meta-interests/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (!data.ok) setSearchError(data.error ?? "Falha");
        else setSearchResults(data.results ?? []);
      } catch (e) {
        setSearchError((e as Error).message);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  function addFromSearch(hit: { id: string; name: string }) {
    if (interests.some((i) => i.id === hit.id)) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
    const next = [...interests, { id: hit.id, name: hit.name }];
    onSave({ interests: next });
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeInterest(id: string) {
    onSave({ interests: interests.filter((i) => i.id !== id) });
  }

  function fmtAudienceSize(n: number | null): string {
    if (!n) return "";
    if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `~${Math.round(n / 1_000)}k`;
    return `~${n}`;
  }

  return (
    <div style={{ background: "var(--bg-secondary)", borderRadius: 10, border: `0.5px solid ${LAYER_COLOR[aset.layer] ?? "#888"}`, borderLeftWidth: 3 }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: 14,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${LAYER_COLOR[aset.layer] ?? "#888"}22`, color: LAYER_COLOR[aset.layer] ?? "#888", fontWeight: 700, textTransform: "uppercase" }}>
              {aset.layer}
            </span>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${STATUS_COLOR[aset.status] ?? "#888"}22`, color: STATUS_COLOR[aset.status] ?? "#888", fontWeight: 700, textTransform: "uppercase" }}>
              {aset.status}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{aset.activateOn}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{aset.adSetKey}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            R${aset.budgetDailyBrl}/d · {aset.ageMin}-{aset.ageMax} · {aset.genders.join(",")} · {aset.numAds} ads
          </div>
        </div>
        {saved && <span style={savedBadgeStyle}>✓ salvo</span>}
        <span style={{ fontSize: 18, color: "var(--text-muted)" }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            <div>
              <div style={labelStyle}>Budget diário (R$)</div>
              <input
                type="number"
                defaultValue={aset.budgetDailyBrl}
                key={`b-${aset.updatedAt ?? aset.id}`}
                onBlur={(e) => {
                  const v = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(v) && v !== aset.budgetDailyBrl) onSave({ budgetDailyBrl: v });
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={labelStyle}>Idade min</div>
              <input
                type="number"
                defaultValue={aset.ageMin}
                onBlur={(e) => {
                  const v = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(v) && v !== aset.ageMin) onSave({ ageMin: v });
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={labelStyle}>Idade max</div>
              <input
                type="number"
                defaultValue={aset.ageMax}
                onBlur={(e) => {
                  const v = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(v) && v !== aset.ageMax) onSave({ ageMax: v });
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={labelStyle}>Cronograma</div>
              <select
                value={aset.activateOn}
                onChange={(e) => onSave({ activateOn: e.currentTarget.value })}
                style={inputStyle}
              >
                <option value="day_1">day_1</option>
                <option value="day_5">day_5</option>
                <option value="manual">manual</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}># ads</div>
              <input
                type="number"
                defaultValue={aset.numAds}
                onBlur={(e) => {
                  const v = parseInt(e.currentTarget.value, 10);
                  if (!isNaN(v) && v !== aset.numAds) onSave({ numAds: v });
                }}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Interesses */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
              <div style={labelStyle}>Interesses (chips removíveis)</div>
              {interests.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remover todos os ${interests.length} interesses do ${aset.adSetKey}?`)) {
                      onSave({ interests: [] });
                    }
                  }}
                  disabled={busy}
                  style={{
                    background: "transparent",
                    border: "0.5px solid #C4787A",
                    color: "#C4787A",
                    cursor: "pointer",
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  🗑 Limpar todos
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
              {interests.length === 0 && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                  nenhum — broad targeting
                </span>
              )}
              {interests.map((i) => (
                <span
                  key={i.id}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    border: "0.5px solid var(--border-default)",
                  }}
                >
                  {i.name}
                  <code style={{ fontSize: 10, color: "var(--text-muted)" }}>{i.id}</code>
                  <button
                    onClick={() => removeInterest(i.id)}
                    disabled={busy}
                    title={`Remover ${i.name}`}
                    style={{
                      background: "rgba(196,120,122,0.15)",
                      border: "0.5px solid #C4787A",
                      color: "#C4787A",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div style={{ position: "relative", marginTop: 8 }}>
              <input
                type="text"
                placeholder="🔍 Buscar interesse no Meta (ex: emagrecimento, dieta, maternidade)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ ...inputStyle, width: "100%" }}
              />
              {searching && (
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  buscando...
                </span>
              )}
              {searchError && (
                <div style={{ fontSize: 11, color: "#C4787A", marginTop: 4 }}>
                  {searchError}
                </div>
              )}
              {searchResults.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "var(--bg-primary)",
                    border: "0.5px solid var(--border-default)",
                    borderRadius: 8,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    zIndex: 10,
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => addFromSearch(hit)}
                      disabled={busy}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        borderBottom: "0.5px solid var(--border-subtle)",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
                          {hit.name}
                        </strong>
                        {hit.audienceSize && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {fmtAudienceSize(hit.audienceSize)} pessoas
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <code>{hit.id}</code>
                        {hit.topic && <span>· {hit.topic}</span>}
                        {hit.path && <span>· {hit.path}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ads previstos — creatives + copies que o launcher vai parear */}
          {collection && collection.creatives.length > 0 && (
            <div>
              <div style={labelStyle}>Ads previstos ({collection.creatives.length} creative{collection.creatives.length === 1 ? "" : "s"} na collection)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                {collection.creatives.slice(0, aset.numAds).map((cr) => {
                  const copy = cr.copies[0];
                  return (
                    <div key={cr.id} style={{ padding: 10, background: "var(--bg-card)", borderRadius: 8, fontSize: 12 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <strong style={{ color: "var(--text-primary)" }}>{cr.name}</strong>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{cr.format}</span>
                        {cr.metaImageHash ? (
                          <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(107,158,107,0.15)", color: "#6B9E6B", borderRadius: 999, fontWeight: 700 }}>
                            ✓ Meta hash
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(196,120,122,0.15)", color: "#C4787A", borderRadius: 999, fontWeight: 700 }}>
                            ✗ sem hash
                          </span>
                        )}
                      </div>
                      {copy ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            Copy <strong style={{ color: "var(--text-secondary)" }}>{copy.label}</strong>
                            {copy.cta && ` · CTA: ${copy.cta}`}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>
                            {copy.headline}
                          </div>
                          {copy.primaryText && (
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 120, overflow: "auto", padding: 6, background: "var(--bg-secondary)", borderRadius: 4 }}>
                              {copy.primaryText}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: "#C4787A", fontStyle: "italic" }}>
                          Sem copy active — clica &quot;🔧 Preparar&quot; pra seedar
                        </div>
                      )}
                    </div>
                  );
                })}
                {collection.creatives.length > aset.numAds && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 4 }}>
                    + {collection.creatives.length - aset.numAds} outros creatives na collection (não usados — aset.numAds = {aset.numAds})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exclusões (read-only) */}
          {(aset.customAudienceKeys.length > 0 || aset.excludedAudienceKeys.length > 0) && (
            <div>
              <div style={labelStyle}>Audiences (read-only)</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                {aset.customAudienceKeys.length > 0 && (
                  <div>Inclui: <code>{aset.customAudienceKeys.join(", ")}</code></div>
                )}
                {aset.excludedAudienceKeys.length > 0 && (
                  <div>Exclui: <code>{aset.excludedAudienceKeys.join(", ")}</code></div>
                )}
              </div>
            </div>
          )}

          {/* Meta info */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--text-muted)", paddingTop: 8, borderTop: "0.5px solid var(--border-subtle)" }}>
            <span>Angles: {aset.creativesAngles.join(", ")}</span>
            <span>Collection: {aset.creativesCollectionId ?? "—"}</span>
            {aset.metaAdSetId && <span>Meta ID: <code>{aset.metaAdSetId}</code></span>}
            {aset.statusMessage && <span style={{ color: "#C4787A" }}>{aset.statusMessage}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignMap({
  blueprint,
  collections,
}: {
  blueprint: Blueprint;
  collections: Collection[];
}) {
  const totalAds = blueprint.adSets.reduce((s, a) => s + a.numAds, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Root: campanha */}
      <div style={{ padding: 14, background: "linear-gradient(135deg, rgba(74,144,217,0.15), rgba(107,158,107,0.15))", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          📣 Campanha
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
          {blueprint.campaignName}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span>{blueprint.campaignObjective}</span>
          <span>·</span>
          <span>R${blueprint.budgetTotalBrl}/d</span>
          <span>·</span>
          <span>{blueprint.adSets.length} ad sets</span>
          <span>·</span>
          <span>{totalAds} ads previstos</span>
          {blueprint.metaCampaignId && (
            <>
              <span>·</span>
              <span>Meta ID {blueprint.metaCampaignId.slice(0, 12)}...</span>
            </>
          )}
        </div>
      </div>

      {/* Audiences ligadas */}
      <div style={{ marginLeft: 20, paddingLeft: 14, borderLeft: "2px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
          🎯 Audiences ({blueprint.audiences.length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {blueprint.audiences.map((a) => (
            <span
              key={a.id}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 999,
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "0.5px solid var(--border-subtle)",
              }}
              title={`${a.audienceType} · ${a.status}`}
            >
              {a.audienceKey}{" "}
              <span style={{ fontSize: 9, color: STATUS_COLOR[a.status] ?? "#888" }}>
                ●
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Ad sets + ads (creative + copy) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {blueprint.adSets.map((aset) => {
          const collection = collections.find((c) => c.slug === aset.creativesCollectionId);
          const creatives = collection?.creatives.slice(0, aset.numAds) ?? [];
          return (
            <div key={aset.id} style={{ marginLeft: 20, paddingLeft: 14, borderLeft: `2px solid ${LAYER_COLOR[aset.layer] ?? "#888"}` }}>
              <div style={{ padding: 10, background: "var(--bg-secondary)", borderRadius: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${LAYER_COLOR[aset.layer] ?? "#888"}22`, color: LAYER_COLOR[aset.layer] ?? "#888", fontWeight: 700, textTransform: "uppercase" }}>
                    {aset.layer}
                  </span>
                  <strong style={{ fontSize: 12, color: "var(--text-primary)" }}>{aset.adSetKey}</strong>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    · R${aset.budgetDailyBrl}/d · {aset.ageMin}-{aset.ageMax} · {aset.activateOn}
                  </span>
                </div>
                {creatives.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {creatives.map((cr) => {
                      const copy = cr.copies[0];
                      return (
                        <div
                          key={cr.id}
                          style={{
                            fontSize: 11,
                            padding: "6px 10px",
                            background: "var(--bg-card)",
                            borderRadius: 6,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>📐</span>
                          <strong style={{ color: "var(--text-primary)" }}>{cr.name}</strong>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                            {cr.metaImageHash ? "✓" : "✗"} hash
                          </span>
                          {copy && (
                            <>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+</span>
                              <span style={{ fontSize: 10, padding: "1px 6px", background: "rgba(107,158,107,0.15)", color: "#6B9E6B", borderRadius: 999, fontWeight: 700 }}>
                                copy {copy.label}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "#C4787A", marginTop: 4, fontStyle: "italic" }}>
                    {aset.creativesCollectionId
                      ? `Collection "${aset.creativesCollectionId}" vazia ou sem creatives com hash`
                      : "Sem creativesCollectionId configurado"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LabeledReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", padding: "8px 10px", background: "var(--bg-secondary)", borderRadius: 8, wordBreak: "break-all" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 14,
  padding: 18,
  marginBottom: 16,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "0.5px solid var(--border-default)",
  borderRadius: 8,
  fontSize: 13,
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  width: "100%",
  boxSizing: "border-box",
};

const savedBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "3px 10px",
  borderRadius: 999,
  background: "#6B9E6B",
  color: "#fff",
  fontWeight: 700,
};

const resultBoxStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  background: "var(--bg-secondary)",
  borderRadius: 10,
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
  color: "var(--text-secondary)",
  maxHeight: 400,
  overflow: "auto",
  whiteSpace: "pre-wrap",
};
