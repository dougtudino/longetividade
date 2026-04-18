"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Card,
  CardHeader,
  Badge,
  Button,
  Alert,
} from "@/components/admin/ui";

type TimelineItem = {
  actor: string;
  kind: string;
  at: string;
  title: string;
  detail?: string;
  status?: string;
  rejectedReason?: string | null;
  params?: unknown;
};

type FlowResponse = {
  ok: boolean;
  error?: string;
  post?: {
    id: string;
    title: string;
    content: string;
    status: string;
    pillar: string;
    slot: string;
    format: string;
    scheduledAt: string | null;
    postedAt: string | null;
    imageUrl: string | null;
    imageBriefing: string | null;
    reviewNote: string | null;
    engagementData: unknown;
    imagesCount: number;
  };
  timeline?: TimelineItem[];
  decisions?: Array<{
    id: string;
    agentId: string;
    action: string;
    reasoning: string;
    status: string;
    rejectedReason: string | null;
    executionResult: unknown;
    createdAt: string;
  }>;
};

const AGENT_ICON: Record<string, string> = {
  Luna: "🌙",
  Uma: "🎨",
  Quinn: "🛡️",
  Blotato: "🎬",
  Gaia: "🌱",
  Maya: "📊",
};

function statusTone(status?: string): "success" | "warn" | "danger" | "neutral" {
  if (!status) return "neutral";
  if (status === "executed" || status === "approved") return "success";
  if (status === "rejected" || status === "failed") return "danger";
  if (status === "proposed" || status === "review") return "warn";
  return "neutral";
}

export default function SocialFlowPage() {
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const [data, setData] = useState<FlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/social/flow/${postId}`);
      const d = (await r.json()) as FlowResponse;
      setData(d);
      if (!d.ok) setError(d.error ?? "erro");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const post = data?.post;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        title={loading ? "Carregando..." : post?.title ?? "Post"}
        subtitle="Timeline Luna → Uma → Quinn → publicação. Cada agente deixa um rastro auditável aqui."
        breadcrumb={
          <Link
            href="/admin/social-media"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            ← Social Media
          </Link>
        }
        icon="🧬"
        actions={<Button variant="secondary" size="sm" onClick={load} loading={loading}>Recarregar</Button>}
      />

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="danger" title="Erro">{error}</Alert>
        </div>
      )}

      {post && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, alignItems: "start" }}>
          {/* Coluna esquerda — metadata + preview */}
          <Card>
            <CardHeader
              title="Post"
              subtitle={`${post.slot} · ${post.format} · pilar ${post.pillar}`}
              right={
                <Badge tone={statusTone(post.status)} dot>
                  {post.status}
                </Badge>
              }
            />
            {post.imageUrl && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "0.5px solid var(--border-subtle)",
                  background: "#000",
                }}
              >
                {post.imageUrl.endsWith(".mp4") ? (
                  <video
                    src={post.imageUrl}
                    controls
                    style={{ width: "100%", display: "block" }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{ width: "100%", display: "block" }}
                  />
                )}
              </div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              Copy
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-primary)",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                background: "var(--bg-secondary)",
                padding: 12,
                borderRadius: 10,
                maxHeight: 280,
                overflow: "auto",
              }}
            >
              {post.content}
            </div>
            {post.reviewNote && (
              <div style={{ marginTop: 12 }}>
                <Alert tone="warn" title="Nota de review">
                  {post.reviewNote}
                </Alert>
              </div>
            )}
            {post.imageBriefing && (
              <details style={{ marginTop: 12 }}>
                <summary
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Briefing original (Luna)
                </summary>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 8,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.imageBriefing}
                </div>
              </details>
            )}
          </Card>

          {/* Coluna direita — timeline */}
          <Card>
            <CardHeader title="Timeline de agentes" subtitle={`${data?.timeline?.length ?? 0} eventos`} />
            <div style={{ position: "relative", paddingLeft: 24 }}>
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: "var(--border-subtle)",
                }}
              />
              {data?.timeline?.map((t, i) => {
                const icon = AGENT_ICON[t.actor] ?? "•";
                return (
                  <div
                    key={i}
                    style={{ position: "relative", paddingBottom: 18 }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -20,
                        top: 0,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        {t.title}
                      </div>
                      {t.status && (
                        <Badge tone={statusTone(t.status)} size="sm">{t.status}</Badge>
                      )}
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(t.at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    {t.detail && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          marginBottom: 4,
                        }}
                      >
                        {t.detail}
                      </div>
                    )}
                    {t.rejectedReason && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#E09698",
                          background: "rgba(196,120,122,0.08)",
                          padding: "6px 10px",
                          borderRadius: 6,
                          marginTop: 4,
                        }}
                      >
                        Motivo: {t.rejectedReason}
                      </div>
                    )}
                  </div>
                );
              })}
              {(!data?.timeline || data.timeline.length === 0) && (
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Nenhum evento ainda.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
