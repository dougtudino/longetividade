"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import PostFeed from "@/components/social-templates/post-feed";
import PostStory from "@/components/social-templates/post-story";
import {
  PostStoryPoll,
  PostStoryQuestion,
  PostStorySequenceSlide,
} from "@/components/social-templates/post-story-variants";
import {
  parsePollContent,
  parseQuestionContent,
  parseSequenceContent,
} from "@/lib/social-story-parsers";
import PostCarouselSlide, { parseContentToSlides } from "@/components/social-templates/post-carousel";
import { getTemplateForFormat } from "@/components/social-templates/registry";
import { PageHeader, Alert } from "@/components/admin/ui";

type Post = {
  id: string;
  title: string;
  content: string;
  platform: string;
  format: string;
  pillar: string;
  slot?: string;
  hashtags: string | null;
  imageBriefing: string | null;
  imageUrl: string | null;
  status: string;
  reviewNote: string | null;
  scheduledAt: string | null;
  postedAt: string | null;
  createdAt: string;
};

type DiagnoseCheck = { ok: boolean; label: string; detail: string; action?: string };
type DiagnoseResult = {
  ok: boolean;
  score: string;
  summary?: { canPostFacebook: boolean; canPostInstagram: boolean; approvedReady: number; approvedTotal?: number };
  checks: DiagnoseCheck[];
  nextSteps?: string;
};

type ActivityData = {
  recentPosted: Array<{
    id: string;
    title: string;
    format: string;
    pillar: string;
    postedAt: string | null;
  }>;
  recentRuns: Array<{ title: string; body?: string; source: string | null; createdAt: string }>;
};

type TrendItem = {
  topic: string;
  angle: string;
  suggestedPillar: "s" | "e" | "m" | "promo";
  sourceUrl?: string;
};

type TrendsState = {
  ok: boolean;
  message: string;
  trends?: TrendItem[];
  savedAt?: string;
  ageDays?: number;
};

function ageDays(iso: string | undefined): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

const PILLAR_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  s: { bg: "rgba(122,158,126,0.2)", color: "#7A9E7E", label: "S · Nutricao" },
  e: { bg: "rgba(212,169,75,0.2)", color: "#D4A94B", label: "E · Emocional" },
  m: { bg: "rgba(61,90,62,0.2)", color: "#3D5A3E", label: "M · Movimento" },
  promo: { bg: "rgba(196,120,122,0.2)", color: "#C4787A", label: "Promo" },
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "rgba(160,160,160,0.2)", color: "#888" },
  review: { bg: "rgba(74,144,217,0.2)", color: "#4A90D9" },
  approved: { bg: "rgba(212,169,75,0.2)", color: "#D4A94B" },
  posted: { bg: "rgba(107,158,107,0.2)", color: "#6B9E6B" },
  rejected: { bg: "rgba(196,120,122,0.2)", color: "#C4787A" },
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "📸",
  facebook: "📘",
  stories: "📱",
  reels: "🎬",
  tiktok: "🎵",
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 18,
};

function isVerticalFormat(format: string): boolean {
  return format === "reels" || format.startsWith("stories");
}

type VerticalTemplateProps = {
  format: string;
  title: string;
  content: string;
  pillar: "s" | "e" | "m" | "promo";
  refCb?: (el: HTMLDivElement | null) => void;
};

function renderVerticalTemplate({ format, title, content, pillar, refCb }: VerticalTemplateProps) {
  const cleanTitle = title.replace(/ — \d{4}-\d{2}-\d{2}$/, "");

  if (format === "stories-poll") {
    const { question, optionA, optionB } = parsePollContent(content);
    return <PostStoryPoll ref={refCb} question={question || cleanTitle} optionA={optionA} optionB={optionB} pillar={pillar} />;
  }
  if (format === "stories-question") {
    const { question, subtitle } = parseQuestionContent(content);
    return <PostStoryQuestion ref={refCb} question={question || cleanTitle} subtitle={subtitle} pillar={pillar} />;
  }
  if (format === "stories-sequence") {
    const slides = parseSequenceContent(content);
    const first = slides[0];
    if (!first) {
      return <PostStory ref={refCb} title={cleanTitle} body={content.split("\n")[0]} pillar={pillar} />;
    }
    return (
      <PostStorySequenceSlide
        ref={refCb}
        text={first.text}
        emoji={first.emoji}
        slideIndex={0}
        total={slides.length}
        pillar={pillar}
      />
    );
  }
  return <PostStory ref={refCb} title={cleanTitle} body={content.split("\n")[0]} pillar={pillar} />;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"scheduled-asc" | "scheduled-desc" | "created-desc">("scheduled-asc");
  const [fillingGaps, setFillingGaps] = useState(false);
  const [fillGapsMsg, setFillGapsMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [igDiscovery, setIgDiscovery] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [diagnose, setDiagnose] = useState<DiagnoseResult | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [postingTest, setPostingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsResult, setTrendsResult] = useState<TrendsState | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [lightbox, setLightbox] = useState<{ postId: string; slideIndex: number; pillar: string; format: string; title: string; content: string } | null>(null);
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/admin/social" : `/api/admin/social?status=${filter}`;
      const res = await fetch(url);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { posts: [], counts: {} };
      setPosts(data.posts ?? []);
      setCounts(data.counts ?? {});
      if (data.warning) setError(data.warning);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Carrega trends ja salvas no backend ao abrir a pagina (evita websearch caro repetido)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/social/trends");
        const data = await res.json();
        if (data.ok && data.payload?.trends) {
          const age = ageDays(data.savedAt);
          setTrendsResult({
            ok: true,
            message: `${data.payload.trends.length} trends salvas (${age === 0 ? "hoje" : `${age}d atras`}) — clica "② Atualizar" so se quiser pesquisar de novo`,
            trends: data.payload.trends,
            savedAt: data.savedAt,
            ageDays: age,
          });
        }
      } catch { /* silent */ }
    })();
  }, []);

  async function fillGaps() {
    setFillingGaps(true);
    setFillGapsMsg(null);
    try {
      const res = await fetch("/api/admin/social/fill-gaps?days=30", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error);
      } else {
        setFillGapsMsg(
          data.created > 0
            ? `✅ ${data.created} post${data.created > 1 ? "s" : ""} novo${data.created > 1 ? "s" : ""} criado${data.created > 1 ? "s" : ""} nos slots vazios dos próximos 30 dias.`
            : `Nenhum gap encontrado — agenda dos próximos 30 dias já está completa.`,
        );
      }
      await loadPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFillingGaps(false);
    }
  }

  const [seedingPlaybook, setSeedingPlaybook] = useState(false);
  const [playbookMsg, setPlaybookMsg] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(posts.map((p) => p.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function bulkDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Apagar ${ids.length} post(s) selecionado(s)? Essa acao nao pode ser desfeita.`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/social/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Erro ao apagar");
      } else {
        clearSelection();
        await loadPosts();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBulkDeleting(false);
    }
  }

  async function seedPlaybook() {
    setSeedingPlaybook(true);
    setPlaybookMsg(null);
    try {
      const res = await fetch("/api/admin/social/seed-playbook", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setPlaybookMsg(`✅ Playbook salvo: ${data.created} criados, ${data.updated} atualizados (${data.total} total)`);
      } else {
        setPlaybookMsg(`Erro: ${data.error}`);
      }
    } catch (e) {
      setPlaybookMsg(`Erro: ${(e as Error).message}`);
    } finally {
      setSeedingPlaybook(false);
    }
  }

  async function downloadFromLightbox() {
    if (!lightboxRef.current || !lightbox) return;
    setDownloading("lightbox");
    try {
      const { toPng } = await import("html-to-image");
      const isVertical = isVerticalFormat(lightbox.format);
      const dataUrl = await toPng(lightboxRef.current, { cacheBust: true, pixelRatio: 1, width: 1080, height: isVertical ? 1920 : 1080 });
      const link = document.createElement("a");
      link.download = `longetividade-${lightbox.pillar}-slide${lightbox.slideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch { /* silent */ }
    finally { setDownloading(null); }
  }

  async function downloadImage(post: Post) {
    const node = previewRefs.current[post.id];
    if (!node) return;
    setDownloading(post.id);
    try {
      const { toPng } = await import("html-to-image");
      const tmpl = getTemplateForFormat(post.format);
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1, width: tmpl.width, height: tmpl.height });
      const link = document.createElement("a");
      link.download = `longetividade-${post.pillar}-${post.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch { /* silent */ }
    finally { setDownloading(null); }
  }

  // Renderiza todos os slides do post em PNGs e faz upload pro DB,
  // depois seta imageUrl com a URL publica do slide 0.
  async function generateImages(post: Post) {
    setGeneratingImage(post.id);
    setError(null);

    // Garante que o post esta expandido (slides soh renderizam quando expanded)
    if (expanded !== post.id) {
      setExpanded(post.id);
      // 2 frames de espera pro DOM pintar os slides
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      await new Promise((r) => setTimeout(r, 200));
    }

    try {
      const { toPng } = await import("html-to-image");
      const tmpl = getTemplateForFormat(post.format);
      const slidesToCapture: Array<{ slideIndex: number; dataUrl: string; width: number; height: number }> = [];

      if (post.format === "carrossel") {
        const parsed = parseContentToSlides(post.title, post.content);
        for (let i = 0; i < parsed.length; i++) {
          const node = previewRefs.current[`${post.id}-slide-${i}`];
          if (!node) continue;
          const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1, width: tmpl.width, height: tmpl.height });
          slidesToCapture.push({ slideIndex: i, dataUrl, width: tmpl.width, height: tmpl.height });
        }
      } else {
        const node = previewRefs.current[post.id];
        if (node) {
          const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1, width: tmpl.width, height: tmpl.height });
          slidesToCapture.push({ slideIndex: 0, dataUrl, width: tmpl.width, height: tmpl.height });
        }
      }

      if (slidesToCapture.length === 0) {
        setError(`Nao foi possivel capturar imagens do post "${post.title}". Expande o post antes.`);
        return;
      }

      const res = await fetch("/api/admin/social/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, slides: slidesToCapture }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Falha no upload");
      } else {
        await loadPosts();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGeneratingImage(null);
    }
  }

  async function deletePost(postId: string) {
    if (!confirm("Apagar esse post? Acao irreversivel.")) return;
    setDeleting(postId);
    try {
      const res = await fetch(`/api/admin/social?id=${postId}&replace=1`, { method: "DELETE" });
      const data = await res.json().catch(() => ({ ok: true }));
      if (data?.replacement?.title) {
        setFillGapsMsg(`✅ Post apagado e substituído automaticamente: "${data.replacement.title}" (${data.replacement.source})`);
      } else if (data?.replacement?.reason) {
        setFillGapsMsg(`Post apagado. Substituto não gerado: ${data.replacement.reason}`);
      }
      await loadPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  async function saveEdit() {
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPost.id,
          title: editingPost.title,
          content: editingPost.content,
          hashtags: editingPost.hashtags,
          imageBriefing: editingPost.imageBriefing,
          pillar: editingPost.pillar,
          format: editingPost.format,
        }),
      });
      setEditingPost(null);
      await loadPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function loadActivity() {
    try {
      const res = await fetch("/api/admin/social/activity");
      const data = await res.json();
      setActivity(data);
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    if (showActivity && !activity) loadActivity();
  }, [showActivity, activity]);

  async function researchTrends() {
    // Aviso se ja tem trends frescas (<3 dias) — websearch do Claude e caro
    if (trendsResult?.ok && trendsResult.ageDays !== undefined && trendsResult.ageDays < 3) {
      const ok = confirm(
        `Ja tem ${trendsResult.trends?.length ?? 0} trends de ${trendsResult.ageDays === 0 ? "hoje" : `${trendsResult.ageDays}d atras`}.\n\nPesquisar de novo consome 30k+ palavras da API Anthropic.\n\nAtualizar mesmo assim?`,
      );
      if (!ok) return;
    }
    setTrendsLoading(true);
    try {
      const res = await fetch("/api/admin/social/trends", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setTrendsResult({
          ok: true,
          message: `OK — ${data.trends?.length ?? 0} trends atualizadas agora. Proxima "Gerar semana" vai priorizar elas.`,
          trends: data.trends,
          savedAt: new Date().toISOString(),
          ageDays: 0,
        });
      } else {
        setTrendsResult({ ok: false, message: `Falhou: ${data.error ?? "erro desconhecido"}` });
      }
    } catch (e) {
      setTrendsResult({ ok: false, message: `Erro: ${(e as Error).message}` });
    } finally {
      setTrendsLoading(false);
    }
  }

  async function generateAllImages() {
    const pending = posts.filter((p) => p.status === "approved" && !p.imageUrl);
    if (pending.length === 0) {
      setError("Nenhum post approved sem imagem.");
      return;
    }
    if (!confirm(`Gerar imagens de ${pending.length} posts aprovados? Pode levar ${pending.length * 3}s.`)) return;
    setBulkGenerating(true);
    setBulkProgress({ done: 0, total: pending.length });
    try {
      for (let i = 0; i < pending.length; i++) {
        await generateImages(pending[i]);
        setBulkProgress({ done: i + 1, total: pending.length });
      }
    } finally {
      setBulkGenerating(false);
      setBulkProgress(null);
    }
  }

  async function updateStatus(postId: string, newStatus: string) {
    setUpdating(postId);
    try {
      await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status: newStatus }),
      });
      await loadPosts();
    } catch {
      /* silent */
    } finally {
      setUpdating(null);
    }
  }

  async function resetAndReseed() {
    if (!confirm("Apagar TODOS os posts e regerar a agenda dos próximos 30 dias?")) return;
    setResetting(true);
    try {
      await fetch("/api/admin/social/reset", { method: "DELETE" });
      await fetch("/api/admin/social/fill-gaps?days=30", { method: "POST" });
      await loadPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  }

  async function generateWeek() {
    setGenerating(true);
    setGenerateResult(null);
    try {
      const res = await fetch("/api/admin/social/generate-now", { method: "POST" });
      const data = await res.json();
      setGenerateResult(data.ok ? `${data.created} posts gerados pra semana!` : `Erro: ${data.error}`);
      await loadPosts();
    } catch (e) {
      setGenerateResult(`Erro: ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function publishPost(postId: string) {
    setPosting(postId);
    try {
      const res = await fetch("/api/admin/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.ok) await loadPosts();
      else setError(data.error ?? "Falha ao postar");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPosting(null);
    }
  }

  async function bulkApprove(action: string) {
    setBulkAction(action);
    try {
      await fetch("/api/admin/social/bulk-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await loadPosts();
    } catch { /* silent */ }
    finally { setBulkAction(null); }
  }

  async function runDiagnose() {
    setDiagnosing(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/social/diagnose");
      const data = await res.json();
      setDiagnose(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDiagnosing(false);
    }
  }

  async function postTestReal(fbOnly = false) {
    const msg = fbOnly
      ? "Isso vai publicar 1 post APROVADO (texto puro) no Facebook. Confirmar?"
      : "Isso vai publicar 1 post APROVADO de verdade no Facebook/Instagram. Confirmar?";
    if (!confirm(msg)) return;
    setPostingTest(true);
    setTestResult(null);
    try {
      const url = fbOnly
        ? "/api/admin/social/diagnose?test=1&fb_only=1"
        : "/api/admin/social/diagnose?test=1";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setTestResult(`OK — publicado: "${data.title}". ${data.results.map((r: { platform: string; ok: boolean; postId?: string; error?: string }) => `${r.platform}: ${r.ok ? r.postId : r.error}`).join(" · ")}`);
        await loadPosts();
      } else {
        setTestResult(`Falhou — ${data.error ?? (data.results ? data.results.map((r: { platform: string; error?: string }) => `${r.platform}: ${r.error}`).join(" · ") : "erro desconhecido")}`);
      }
    } catch (e) {
      setTestResult(`Erro: ${(e as Error).message}`);
    } finally {
      setPostingTest(false);
    }
  }

  async function discoverIg() {
    setIgDiscovery("loading");
    try {
      const res = await fetch("/api/admin/social/discover-ig");
      const data = await res.json();
      setIgDiscovery(data.ok ? `IG ID: ${data.igId}` : `Erro: ${data.error}`);
    } catch (e) {
      setIgDiscovery(`Erro: ${(e as Error).message}`);
    }
  }

  const totalPosts = Object.values(counts).reduce((s, c) => s + c, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <style>{`@keyframes adm-spin { to { transform: rotate(360deg); } }`}</style>
      <PageHeader
        title="Luna · Social Media"
        subtitle="Calendário editorial + fila de posts IG/FB. Luna gera e agenda; Uma faz a arte; Quinn aprova; Blotato publica."
        icon="🌙"
        breadcrumb="Agente AIOX · @social"
      />

      <PageHelp
        pageId="social-media"
        agent={{ icon: "🌙", name: "Luna", role: "Social Media Manager" }}
        title="Calendario editorial + fila de posts"
        quickActions={[
          { label: "Preencher gaps", description: "Escaneia os próximos 30 dias e gera posts nos slots vazios da matriz semanal (2/dia, seg-sáb)" },
          { label: "Filtrar por status", description: "Draft / Em review / Aprovado / Postado" },
          { label: "Mudar status", description: "Avanca post no workflow: draft → review → approved → posted" },
        ]}
      >
        <p>
          Luna gera conteudo baseado nos <strong>4 pilares</strong>: S (Nutricao 2x/sem),
          E (Emocional 2x/sem), M (Movimento 1x/sem), Promo (1x/sem max).
          Regra 80/20: 80% valor, 20% venda. Cada post segue o workflow:
          <strong> draft → review (QA) → approved → posted</strong>.
        </p>
      </PageHelp>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert tone="danger" title="Erro">{error}</Alert>
        </div>
      )}

      {/* Stats + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { key: "draft", label: "Rascunho", icon: "📝" },
            { key: "review", label: "Em review", icon: "🔍" },
            { key: "approved", label: "Aprovado", icon: "✅" },
            { key: "posted", label: "Postado", icon: "📤" },
          ].map((s) => (
            <div key={s.key} style={{ ...card, padding: "10px 16px", textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: STATUS_BADGE[s.key]?.color ?? "#888" }}>{counts[s.key] ?? 0}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={fillGaps} disabled={fillingGaps} title="Escaneia os próximos 30 dias e gera posts nos slots vazios da matriz semanal (2 slots/dia útil, 12 posts/semana). Idempotente — não duplica." style={{
            padding: "10px 18px", borderRadius: 10, background: "var(--accent)", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            {fillingGaps ? "Preenchendo..." : "① Preencher gaps (30 dias)"}
          </button>
          <button onClick={seedPlaybook} disabled={seedingPlaybook} title="Popula a 'biblia da Luna': regras do algoritmo Instagram 2026, 5 creators de referencia, templates de Story. Luna consulta antes de gerar." style={{
            padding: "10px 18px", borderRadius: 10, background: "rgba(139,92,246,0.15)", color: "#8B5CF6",
            border: "0.5px solid rgba(139,92,246,0.4)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: seedingPlaybook ? 0.6 : 1,
          }}>
            {seedingPlaybook ? "Salvando..." : "📘 Treinar Luna (playbook)"}
          </button>
          {(counts.draft ?? 0) > 0 && (
            <button onClick={() => bulkApprove("approve-all-drafts")} disabled={!!bulkAction} style={{
              padding: "10px 18px", borderRadius: 10, background: "#6B9E6B", color: "#fff",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: bulkAction ? 0.6 : 1,
            }}>
              {bulkAction === "approve-all-drafts" ? "Aprovando..." : `✅ Aprovar todos (${counts.draft})`}
            </button>
          )}
          {(counts.review ?? 0) > 0 && (
            <button onClick={() => bulkApprove("approve-all-review")} disabled={!!bulkAction} style={{
              padding: "10px 18px", borderRadius: 10, background: "#6B9E6B", color: "#fff",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: bulkAction ? 0.6 : 1,
            }}>
              {bulkAction === "approve-all-review" ? "Aprovando..." : `✅ Aprovar em review (${counts.review})`}
            </button>
          )}
          <button onClick={researchTrends} disabled={trendsLoading} title="Luna pesquisa trends da semana de saude/wellness via Claude web_search. Salva pra proxima 'Gerar semana' usar." style={{
            padding: "10px 18px", borderRadius: 10, background: "#8B5CF6", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: trendsLoading ? 0.6 : 1,
          }}>
            {trendsLoading
              ? "Pesquisando..."
              : trendsResult?.ok && trendsResult.trends
                ? `② Atualizar trends (${trendsResult.ageDays === 0 ? "hoje" : `${trendsResult.ageDays}d`})`
                : "② Pesquisar trends"}
          </button>
          <button onClick={generateWeek} disabled={generating} title="Gera 6 posts pra proxima semana (seg-sab). Rotacao S/E/S/M/E/Promo. Prioridade: data comemorativa > trend recente > template do bank. Status=approved." style={{
            padding: "10px 18px", borderRadius: 10, background: "#4A90D9", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: generating ? 0.6 : 1,
          }}>
            {generating ? "Gerando..." : "③ Gerar semana (6 posts approved)"}
          </button>
          <button onClick={generateAllImages} disabled={bulkGenerating} title="Renderiza imagens PNG de todos os posts approved que ainda nao tem imageUrl. Necessario antes de publicar." style={{
            padding: "10px 18px", borderRadius: 10, background: "#7A9E7E", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: bulkGenerating ? 0.6 : 1,
          }}>
            {bulkGenerating && bulkProgress
              ? `Gerando ${bulkProgress.done}/${bulkProgress.total}...`
              : "④ Gerar imagens em massa"}
          </button>
          <button onClick={runDiagnose} disabled={diagnosing} title="Checa token, permissoes, IG vinculado, posts prontos. E mostra botao pra postar de verdade agora." style={{
            padding: "10px 18px", borderRadius: 10, background: "#D4A94B", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: diagnosing ? 0.6 : 1,
          }}>
            {diagnosing ? "Checando..." : "⑤ Diagnosticar + Postar agora"}
          </button>
          <button onClick={() => setShowActivity(!showActivity)} style={{
            padding: "10px 18px", borderRadius: 10, background: "var(--bg-secondary)", color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {showActivity ? "Fechar logs" : "📜 Logs"}
          </button>
          <button onClick={discoverIg} disabled={igDiscovery === "loading"} style={{
            padding: "10px 18px", borderRadius: 10, background: "var(--bg-secondary)", color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            {igDiscovery === "loading" ? "Buscando..." : "📸 Descobrir IG"}
          </button>
          {totalPosts > 0 && (
            <button onClick={resetAndReseed} disabled={resetting} title="APAGA TODOS os posts (drafts, approved, posted) e regera agenda dos próximos 30 dias via fill-gaps. Útil pra resetar tudo e começar limpo." style={{
              padding: "10px 18px", borderRadius: 10, background: "var(--bg-secondary)", color: "#C4787A",
              border: "0.5px solid rgba(196,120,122,0.3)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              opacity: resetting ? 0.6 : 1,
            }}>
              {resetting ? "Limpando..." : "🗑 Limpar tudo"}
            </button>
          )}
        </div>
      </div>

      {generateResult && (
        <div style={{ padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12,
          background: generateResult.includes("Erro") ? "rgba(196,120,122,0.1)" : "rgba(107,158,107,0.1)",
          color: generateResult.includes("Erro") ? "#C4787A" : "#6B9E6B",
        }}>
          {generateResult}
        </div>
      )}

      {playbookMsg && (
        <div style={{ padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12,
          background: playbookMsg.startsWith("✅") ? "rgba(139,92,246,0.1)" : "rgba(196,120,122,0.1)",
          color: playbookMsg.startsWith("✅") ? "#8B5CF6" : "#C4787A",
        }}>
          {playbookMsg}
        </div>
      )}

      {fillGapsMsg && (
        <div style={{ padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12,
          background: fillGapsMsg.startsWith("✅") ? "rgba(107,158,107,0.12)" : "rgba(150,150,150,0.1)",
          color: fillGapsMsg.startsWith("✅") ? "#6B9E6B" : "var(--text-muted)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ flex: 1 }}>{fillGapsMsg}</span>
          <button onClick={() => setFillGapsMsg(null)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 14, padding: "2px 6px",
          }}>✕</button>
        </div>
      )}

      {trendsResult && (
        <div style={{ padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 12,
          background: trendsResult.ok ? "rgba(139,92,246,0.08)" : "rgba(196,120,122,0.1)",
          border: `0.5px solid ${trendsResult.ok ? "rgba(139,92,246,0.3)" : "rgba(196,120,122,0.3)"}`,
          color: trendsResult.ok ? "#8B5CF6" : "#C4787A",
        }}>
          <div style={{ fontWeight: 700, marginBottom: trendsResult.trends?.length ? 10 : 0 }}>
            {trendsResult.message}
          </div>
          {trendsResult.trends && trendsResult.trends.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--text-primary)" }}>
              {trendsResult.trends.map((t, i) => (
                <div key={i} style={{
                  padding: "8px 10px",
                  background: "var(--bg-secondary)",
                  borderRadius: 6,
                  borderLeft: `3px solid ${PILLAR_COLORS[t.suggestedPillar]?.color ?? "#8B5CF6"}`,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: PILLAR_COLORS[t.suggestedPillar]?.bg ?? "rgba(139,92,246,0.2)",
                      color: PILLAR_COLORS[t.suggestedPillar]?.color ?? "#8B5CF6",
                    }}>
                      {PILLAR_COLORS[t.suggestedPillar]?.label ?? t.suggestedPillar.toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{i + 1}. {t.topic}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>{t.angle}</div>
                  {t.sourceUrl && (
                    <a href={t.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "var(--text-muted)", textDecoration: "underline" }}>
                      fonte
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {igDiscovery && igDiscovery !== "loading" && (
        <div style={{ padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 12,
          background: igDiscovery.startsWith("IG ID") ? "rgba(107,158,107,0.1)" : "rgba(196,120,122,0.1)",
          color: igDiscovery.startsWith("IG ID") ? "#6B9E6B" : "#C4787A",
        }}>
          {igDiscovery}
        </div>
      )}

      {showActivity && (
        <div style={{ ...card, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>📜 Atividade recente da Luna</div>
            <button onClick={loadActivity} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11 }}>↻ atualizar</button>
          </div>
          {!activity ? (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Carregando...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 11 }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Ultimos publicados ({activity.recentPosted.length})
                </div>
                {activity.recentPosted.length === 0 ? (
                  <div style={{ color: "var(--text-muted)" }}>Ainda nenhum post publicado.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {activity.recentPosted.map((p) => (
                      <div key={p.id} style={{ padding: "4px 8px", background: "var(--bg-secondary)", borderRadius: 6 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.title}</div>
                        <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                          {p.pillar}/{p.format} · {p.postedAt ? new Date(p.postedAt).toLocaleString("pt-BR") : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Runs de cron / learnings
                </div>
                {activity.recentRuns.length === 0 ? (
                  <div style={{ color: "var(--text-muted)" }}>Nenhum run registrado.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {activity.recentRuns.map((r, i) => (
                      <details key={i} style={{ padding: "4px 8px", background: "var(--bg-secondary)", borderRadius: 6 }}>
                        <summary style={{ cursor: "pointer", listStyle: "none" }}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.title}</div>
                          <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                            {r.source ?? "manual"} · {new Date(r.createdAt).toLocaleString("pt-BR")}
                          </div>
                        </summary>
                        {r.body && (
                          <pre style={{
                            marginTop: 6,
                            padding: 6,
                            background: "var(--bg-primary)",
                            borderRadius: 4,
                            fontSize: 10,
                            color: "var(--text-secondary)",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: 300,
                            overflow: "auto",
                          }}>
                            {r.body}
                          </pre>
                        )}
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {diagnose && (
        <div style={{ ...card, marginBottom: 16, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              🔍 Diagnostico da Luna — {diagnose.score} {diagnose.ok ? "✅" : "⚠️"}
            </div>
            <button onClick={() => setDiagnose(null)} style={{
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: 18,
            }}>×</button>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {diagnose.checks.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12,
                padding: "6px 8px", borderRadius: 6,
                background: c.ok ? "rgba(107,158,107,0.08)" : "rgba(196,120,122,0.08)",
              }}>
                <div style={{ fontSize: 14, flexShrink: 0 }}>{c.ok ? "✅" : "❌"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{c.detail}</div>
                  {c.action && (
                    <div style={{ color: "#C4787A", marginTop: 2, fontStyle: "italic" }}>
                      → {c.action}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {diagnose.summary && (
            <div style={{ marginTop: 12, padding: 10, background: "var(--bg-secondary)", borderRadius: 8, fontSize: 12 }}>
              <div><strong>FB:</strong> {diagnose.summary.canPostFacebook ? "✅ pode postar" : "❌ bloqueado"}</div>
              <div><strong>IG:</strong> {diagnose.summary.canPostInstagram ? "✅ pode postar" : "❌ bloqueado"}</div>
              <div><strong>Posts prontos:</strong> {diagnose.summary.approvedReady}</div>
            </div>
          )}
          {diagnose.summary?.canPostFacebook && diagnose.summary.approvedReady > 0 && (
            <button onClick={() => postTestReal(false)} disabled={postingTest} style={{
              marginTop: 12, padding: "10px 18px", borderRadius: 10, background: "#D4A94B",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: postingTest ? 0.6 : 1, width: "100%",
            }}>
              {postingTest ? "Postando..." : "🚀 Postar no FB+IG AGORA (teste real)"}
            </button>
          )}
          {diagnose.summary?.canPostFacebook &&
            (diagnose.summary.approvedTotal ?? 0) > 0 &&
            diagnose.summary.approvedReady === 0 && (
            <button onClick={() => postTestReal(true)} disabled={postingTest} style={{
              marginTop: 12, padding: "10px 18px", borderRadius: 10, background: "#4A90D9",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: postingTest ? 0.6 : 1, width: "100%",
            }}>
              {postingTest ? "Postando..." : "📘 Postar SOH no Facebook (texto puro — teste sem imagem)"}
            </button>
          )}
          {testResult && (
            <div style={{
              marginTop: 10, padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: testResult.startsWith("OK") ? "rgba(107,158,107,0.1)" : "rgba(196,120,122,0.1)",
              color: testResult.startsWith("OK") ? "#6B9E6B" : "#C4787A",
            }}>
              {testResult}
            </div>
          )}
        </div>
      )}

      {/* View mode + Filtros + Calendar link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setViewMode("list")} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: viewMode === "list" ? "var(--accent)" : "var(--bg-secondary)",
            color: viewMode === "list" ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>📋 Lista</button>
          <button onClick={() => setViewMode("grid")} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: viewMode === "grid" ? "var(--accent)" : "var(--bg-secondary)",
            color: viewMode === "grid" ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>📱 Grid Instagram</button>
        </div>
        <Link href="/admin/social-media/calendar" style={{
          padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)",
          color: "var(--text-primary)", border: "0.5px solid var(--border-default)",
          fontSize: 12, fontWeight: 600, textDecoration: "none",
        }}>🗓 Calendário →</Link>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["all", "draft", "review", "approved", "posted"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: filter === f ? "var(--accent)" : "var(--bg-secondary)",
            color: filter === f ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>
            {f === "all" ? "Todos" : f}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          title="Ordenar lista"
          style={{
            padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "var(--bg-secondary)", color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}
        >
          <option value="scheduled-asc">📅 Agendamento ↑ (próximos)</option>
          <option value="scheduled-desc">📅 Agendamento ↓ (distantes)</option>
          <option value="created-desc">🆕 Recém-criados</option>
        </select>

        {posts.length > 0 && (
          <button onClick={selectedIds.size === posts.length ? clearSelection : selectAllVisible} style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "var(--bg-secondary)", color: "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>
            {selectedIds.size === posts.length ? "☐ Desmarcar todos" : "☑ Selecionar todos"}
          </button>
        )}
        {selectedIds.size > 0 && (
          <button onClick={bulkDeleteSelected} disabled={bulkDeleting} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: "#C4787A", color: "#fff",
            border: "none", cursor: "pointer", opacity: bulkDeleting ? 0.6 : 1,
          }}>
            {bulkDeleting ? "Apagando..." : `🗑 Apagar selecionados (${selectedIds.size})`}
          </button>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
      ) : posts.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌙</div>
          Nenhum post ainda. Clica <strong>"Preencher gaps"</strong> pra gerar a agenda dos próximos 30 dias.
        </div>
      ) : viewMode === "grid" ? (
        /* ─── GRID VIEW (estilo Instagram) ─── */
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4,
            background: "var(--bg-card)", borderRadius: 12, overflow: "hidden",
            border: "0.5px solid var(--border-default)", padding: 4,
          }}>
            {[...posts].sort((a, b) => {
              if (sortBy === "created-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              const av = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
              const bv = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
              return sortBy === "scheduled-asc" ? av - bv : bv - av;
            }).filter((p) => !isVerticalFormat(p.format)).slice(0, 12).map((p) => {
              const pillar = PILLAR_COLORS[p.pillar] ?? PILLAR_COLORS.s;
              return (
                <div
                  key={p.id}
                  onClick={() => { setViewMode("list"); setExpanded(p.id); }}
                  style={{
                    aspectRatio: "1", overflow: "hidden", borderRadius: 6, cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{
                    width: "100%", height: "100%", overflow: "hidden",
                  }}>
                    <div style={{
                      transform: "scale(0.185)", transformOrigin: "top left",
                      width: 1080, height: 1080,
                    }}>
                      <PostFeed
                        ref={(el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; }}
                        title={p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                        body={p.content.split("\n")[0]}
                        pillar={p.pillar as "s" | "e" | "m" | "promo"}
                      />
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: "20px 8px 6px", color: "#fff", fontSize: 9, fontWeight: 600,
                  }}>
                    {p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "").slice(0, 30)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            Preview do feed Instagram · Clique em qualquer post pra expandir
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...posts].sort((a, b) => {
            if (sortBy === "created-desc") {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            const av = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
            const bv = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
            return sortBy === "scheduled-asc" ? av - bv : bv - av;
          }).map((p) => {
            const pillar = PILLAR_COLORS[p.pillar] ?? PILLAR_COLORS.s;
            const statusBadge = STATUS_BADGE[p.status] ?? STATUS_BADGE.draft;
            const isExpanded = expanded === p.id;
            const isSelected = selectedIds.has(p.id);

            return (
              <div key={p.id} style={{ ...card, borderLeft: `3px solid ${pillar.color}`, background: isSelected ? "rgba(196,120,122,0.06)" : undefined }}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(p.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#C4787A" }}
                  />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 18 }}>{PLATFORM_ICON[p.platform] ?? "📱"}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.createdAt && (Date.now() - new Date(p.createdAt).getTime()) < 48 * 60 * 60 * 1000 && (
                        <span title="Criado nas últimas 48h" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(107,158,107,0.18)", color: "#6B9E6B", fontWeight: 800, letterSpacing: 0.5 }}>NOVO</span>
                      )}
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: pillar.bg, color: pillar.color, fontWeight: 700 }}>{pillar.label}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: statusBadge.bg, color: statusBadge.color, fontWeight: 700, textTransform: "uppercase" }}>{p.status}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{p.format}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                    {p.scheduledAt ? `📅 ${fmtDate(p.scheduledAt)}` : "Sem data"}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 14 }}>
                      {p.content}
                    </div>
                    {p.hashtags && (
                      <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 10, lineHeight: 1.5 }}>
                        {p.hashtags}
                      </div>
                    )}
                    {/* Preview da arte */}
                    <div style={{ marginBottom: 14 }}>
                      {p.format === "carrossel" ? (
                        /* CARROSSEL: mostra todos os slides */
                        (() => {
                          const slides = parseContentToSlides(p.title, p.content);
                          return (
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                                📑 Carrossel: {slides.length} slides
                              </div>
                              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                                {slides.map((slide, si) => (
                                  <div key={si} style={{ flexShrink: 0, cursor: "pointer" }}
                                    onClick={(e) => { e.stopPropagation(); setLightbox({ postId: p.id, slideIndex: si, pillar: p.pillar, format: p.format, title: p.title, content: p.content }); }}>
                                    <div style={{
                                      width: 160, height: 160, overflow: "hidden",
                                      borderRadius: 8, border: "0.5px solid var(--border-subtle)",
                                    }}>
                                      <div style={{
                                        transform: "scale(0.148)", transformOrigin: "top left",
                                        width: 1080, height: 1080,
                                      }}>
                                        <PostCarouselSlide
                                          ref={(el: HTMLDivElement | null) => {
                                            previewRefs.current[`${p.id}-slide-${si}`] = el;
                                          }}
                                          slides={slides}
                                          pillar={p.pillar as "s" | "e" | "m" | "promo"}
                                          slideIndex={si}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
                                      {si + 1}/{slides.length} · {slide.type}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        /* SINGLE: feed ou story */
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <div
                            onClick={(e) => { e.stopPropagation(); setLightbox({ postId: p.id, slideIndex: 0, pillar: p.pillar, format: p.format, title: p.title, content: p.content }); }}
                            style={{
                              width: 200, height: isVerticalFormat(p.format) ? 355 : 200,
                              overflow: "hidden", borderRadius: 8, border: "0.5px solid var(--border-subtle)",
                              flexShrink: 0, cursor: "pointer",
                            }}>
                            <div style={{
                              transform: `scale(${200 / 1080})`,
                              transformOrigin: "top left",
                              width: 1080,
                              height: isVerticalFormat(p.format) ? 1920 : 1080,
                            }}>
                              {isVerticalFormat(p.format) ? (
                                renderVerticalTemplate({
                                  format: p.format,
                                  title: p.title,
                                  content: p.content,
                                  pillar: p.pillar as "s" | "e" | "m" | "promo",
                                  refCb: (el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; },
                                })
                              ) : (
                                <PostFeed
                                  ref={(el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; }}
                                  title={p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                                  body={p.content.split("\n")[0]}
                                  pillar={p.pillar as "s" | "e" | "m" | "promo"}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {p.imageBriefing && (
                        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: 10, borderRadius: 8, lineHeight: 1.5 }}>
                          <strong>Briefing visual (Uma):</strong> {p.imageBriefing}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {/* WORKFLOW: draft → review → approved → (gerar img) → publicar */}
                      {p.status === "draft" && (
                        <button onClick={() => updateStatus(p.id, "review")} disabled={updating === p.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "#4A90D9", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          ① Enviar pra Review
                        </button>
                      )}
                      {p.status === "review" && (
                        <>
                          <button onClick={() => updateStatus(p.id, "approved")} disabled={updating === p.id}
                            style={{ padding: "6px 14px", borderRadius: 8, background: "#6B9E6B", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            ② Aprovar
                          </button>
                          <button onClick={() => updateStatus(p.id, "rejected")} disabled={updating === p.id}
                            style={{ padding: "6px 14px", borderRadius: 8, background: "#C4787A", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            ✗ Rejeitar
                          </button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <>
                          <button
                            onClick={() => generateImages(p)}
                            disabled={generatingImage === p.id}
                            style={{ padding: "6px 14px", borderRadius: 8, background: p.imageUrl ? "var(--bg-secondary)" : "#7A9E7E", color: p.imageUrl ? "var(--text-primary)" : "#fff", border: p.imageUrl ? "0.5px solid var(--border-default)" : "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            {generatingImage === p.id ? "Subindo..." : p.imageUrl ? "③ Regerar imagens" : "③ Gerar imagens"}
                          </button>
                          <button onClick={() => publishPost(p.id)} disabled={posting === p.id || !p.imageUrl}
                            title={!p.imageUrl ? "Gere as imagens primeiro (passo ③)" : "Publica agora no FB+IG"}
                            style={{ padding: "6px 14px", borderRadius: 8, background: p.imageUrl ? "#639922" : "var(--bg-secondary)", color: p.imageUrl ? "#fff" : "var(--text-muted)", border: "none", fontSize: 11, fontWeight: 700, cursor: p.imageUrl ? "pointer" : "not-allowed", opacity: p.imageUrl ? 1 : 0.6 }}>
                            {posting === p.id ? "Publicando..." : "④ Publicar no FB+IG"}
                          </button>
                          <button onClick={() => updateStatus(p.id, "draft")} disabled={updating === p.id}
                            title="Volta post pra draft (cancela aprovacao)"
                            style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-muted)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            ↩ Cancelar aprovacao
                          </button>
                        </>
                      )}
                      {/* Acoes universais */}
                      <button onClick={() => setEditingPost(p)}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => deletePost(p.id)} disabled={deleting === p.id}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "#C4787A", border: "0.5px solid rgba(196,120,122,0.3)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {deleting === p.id ? "Apagando..." : "🗑 Apagar"}
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(p.content + (p.hashtags ? "\n\n" + p.hashtags : "")); }}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        📋 Copiar texto
                      </button>
                      <button
                        onClick={() => downloadImage(p)}
                        disabled={downloading === p.id}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {downloading === p.id ? "Gerando..." : "🖼 Baixar PNG"}
                      </button>
                      <button
                        disabled={regenerating === p.id || !!regenerating}
                        onClick={async () => {
                          if (regenerating) return; // guard double-click
                          const isVideo = p.format === "reels";
                          if (!confirm(`Regenerar arte do post "${p.title}"?\n\nFormato: ${p.format} → ${isVideo ? "VÍDEO mp4 (~30-50cr)" : "IMAGEM (~3-8cr)"}\n\nVai apagar imagem atual + gastar créditos Blotato.`)) return;
                          setRegenerating(p.id); // bloqueia imediato
                          try {
                            const r = await fetch(`/api/admin/blotato/regenerate-post/${p.id}`, { method: "POST" });
                            const d = await r.json();
                            if (d.ok) {
                              alert(`✅ Regenerado em ${Math.round(d.elapsedMs / 1000)}s\n\nFormato: ${d.before.format} → ${d.outputUrl?.endsWith(".mp4") ? "mp4 video" : "imagem"}\nAntes: ${d.before.imageUrl ? "tinha imagem" : "vazio"}\nAgora: ${d.after.imageUrl ? "✓ nova arte" : "sem imagem"}`);
                              loadPosts();
                            } else {
                              alert(`Erro: ${d.error}`);
                            }
                          } catch (e) {
                            alert(`Erro: ${(e as Error).message}`);
                          } finally {
                            setRegenerating(null);
                          }
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: regenerating === p.id ? "rgba(99,153,34,0.25)" : "rgba(99,153,34,0.1)",
                          color: "#8FBB3F",
                          border: "0.5px solid rgba(99,153,34,0.3)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: regenerating ? "not-allowed" : "pointer",
                          opacity: regenerating && regenerating !== p.id ? 0.4 : 1,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        title={p.format === "reels"
                          ? "Apaga vídeo atual e regenera com Uma + AI Video + scenes"
                          : "Apaga imagem atual e regenera com Uma + Image Slideshow + slides reais"}
                      >
                        {regenerating === p.id ? (
                          <>
                            <span style={{
                              width: 10,
                              height: 10,
                              border: "2px solid #8FBB3F",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "adm-spin 0.7s linear infinite",
                              display: "inline-block",
                            }} />
                            Gerando... (até 2min)
                          </>
                        ) : (
                          "🔄 Regenerar arte"
                        )}
                      </button>
                      {p.status === "posted" && (
                        <button onClick={() => updateStatus(p.id, "approved")} disabled={updating === p.id}
                          title="Volta pra approved pra poder republicar"
                          style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-muted)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          ↩ Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── EDIT MODAL ─── */}
      {editingPost && (
        <>
          <div onClick={() => setEditingPost(null)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300,
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 301, width: "min(640px, 94vw)", maxHeight: "90vh", overflowY: "auto",
            background: "var(--bg-card)", border: "0.5px solid var(--border-default)",
            borderRadius: 14, padding: 22,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>✏️ Editar post</div>
              <button onClick={() => setEditingPost(null)} style={{ background: "none", border: "none", fontSize: 22, color: "var(--text-muted)", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Titulo</label>
                <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Pilar</label>
                  <select value={editingPost.pillar} onChange={(e) => setEditingPost({ ...editingPost, pillar: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13 }}>
                    <option value="s">S — Nutricao</option>
                    <option value="e">E — Emocional</option>
                    <option value="m">M — Movimento</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Formato</label>
                  <select value={editingPost.format} onChange={(e) => setEditingPost({ ...editingPost, format: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13 }}>
                    <option value="imagem">Imagem (feed)</option>
                    <option value="carrossel">Carrossel</option>
                    <option value="stories">Stories</option>
                    <option value="reels">Reels</option>
                    <option value="texto">Texto</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Legenda</label>
                <textarea value={editingPost.content} onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={8}
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Hashtags</label>
                <textarea value={editingPost.hashtags ?? ""} onChange={(e) => setEditingPost({ ...editingPost, hashtags: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Briefing visual</label>
                <textarea value={editingPost.imageBriefing ?? ""} onChange={(e) => setEditingPost({ ...editingPost, imageBriefing: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
              </div>
              {editingPost.imageUrl && (
                <div style={{ padding: 8, background: "rgba(212,169,75,0.1)", borderRadius: 6, fontSize: 11, color: "#D4A94B" }}>
                  ⚠️ Este post ja tem imagens geradas. Se alterar titulo/legenda/formato, clique &quot;③ Regerar imagens&quot; depois.
                </div>
              )}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <button onClick={() => setEditingPost(null)} disabled={savingEdit}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={saveEdit} disabled={savingEdit}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#6B9E6B", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {savingEdit ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightbox && (() => {
        const isCarousel = posts.find((p) => p.id === lightbox.postId)?.format === "carrossel";
        const slides = isCarousel ? parseContentToSlides(lightbox.title, lightbox.content) : [];
        const isVertical = isVerticalFormat(lightbox.format);
        const previewW = isVertical ? 360 : 540;
        const previewH = isVertical ? 640 : 540;
        const scale = previewW / 1080;

        return (
          <>
            <div onClick={() => setLightbox(null)} style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200,
            }} />
            <div style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 16, maxHeight: "95vh", overflowY: "auto",
            }}>
              {/* Preview grande */}
              <div style={{
                width: previewW, height: previewH,
                overflow: "hidden", borderRadius: 16,
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}>
                <div style={{
                  transform: `scale(${scale})`, transformOrigin: "top left",
                  width: 1080, height: isVertical ? 1920 : 1080,
                }}>
                  {isCarousel && slides.length > 0 ? (
                    <PostCarouselSlide
                      ref={lightboxRef}
                      slides={slides}
                      pillar={lightbox.pillar as "s" | "e" | "m" | "promo"}
                      slideIndex={lightbox.slideIndex}
                    />
                  ) : isVertical ? (
                    renderVerticalTemplate({
                      format: lightbox.format,
                      title: lightbox.title,
                      content: lightbox.content,
                      pillar: lightbox.pillar as "s" | "e" | "m" | "promo",
                      refCb: (el: HTMLDivElement | null) => { lightboxRef.current = el; },
                    })
                  ) : (
                    <PostFeed
                      ref={lightboxRef}
                      title={lightbox.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                      body={lightbox.content.split("\n")[0]}
                      pillar={lightbox.pillar as "s" | "e" | "m" | "promo"}
                    />
                  )}
                </div>
              </div>

              {/* Navegação de slides (pra carrossel) */}
              {isCarousel && slides.length > 1 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setLightbox({ ...lightbox, slideIndex: Math.max(0, lightbox.slideIndex - 1) })}
                    disabled={lightbox.slideIndex === 0}
                    style={{
                      padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.15)",
                      color: "#fff", border: "none", fontSize: 14, cursor: "pointer",
                      opacity: lightbox.slideIndex === 0 ? 0.3 : 1,
                    }}
                  >← Anterior</button>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                    {lightbox.slideIndex + 1} / {slides.length}
                  </span>
                  <button
                    onClick={() => setLightbox({ ...lightbox, slideIndex: Math.min(slides.length - 1, lightbox.slideIndex + 1) })}
                    disabled={lightbox.slideIndex === slides.length - 1}
                    style={{
                      padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.15)",
                      color: "#fff", border: "none", fontSize: 14, cursor: "pointer",
                      opacity: lightbox.slideIndex === slides.length - 1 ? 0.3 : 1,
                    }}
                  >Próximo →</button>
                </div>
              )}

              {/* Botões */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={downloadFromLightbox}
                  disabled={downloading === "lightbox"}
                  style={{
                    padding: "10px 20px", borderRadius: 10, background: "#639922",
                    color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}
                >{downloading === "lightbox" ? "Gerando..." : "🖼 Baixar PNG"}</button>
                <button
                  onClick={() => setLightbox(null)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.15)",
                    color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >Fechar</button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
