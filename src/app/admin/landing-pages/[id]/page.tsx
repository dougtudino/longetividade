"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { BLOCK_TYPES, type Block, type BlockType } from "@/lib/blocks/schema";
import {
  BLOCK_FIELDS, defaultProps, type FieldSpec,
  pairsToText, textToPairs, faqToText, textToFaq,
  testimonialsToText, textToTestimonials, columnsToText, textToColumns,
} from "@/lib/blocks/editor-fields";

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const label: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 };
const btn: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btn, background: "transparent", color: "var(--text-muted)", border: "0.5px solid var(--border-default)" };
const card: React.CSSProperties = { background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 12, padding: 18, marginBottom: 12 };

type LP = { id: string; slug: string; title: string; status: string; blocks: Block[] };

export default function LpEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lp, setLp] = useState<LP | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [addType, setAddType] = useState<BlockType>("hero");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/landing-pages/${id}`);
    const data = await res.json();
    if (data.ok) {
      const page: LP = data.page;
      setLp(page);
      setBlocks(Array.isArray(page.blocks) ? [...page.blocks].sort((a, b) => a.order - b.order) : []);
      setTitle(page.title);
      setStatus(page.status);
    }
    setLoading(false);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(null), 3000); }

  function reorder(list: Block[]): Block[] { return list.map((b, i) => ({ ...b, order: i })); }

  function updateProp(idx: number, key: string, value: unknown) {
    setBlocks((bs) => bs.map((b, i) => (i === idx ? { ...b, props: { ...(b.props as object), [key]: value } } as Block : b)));
  }
  function move(idx: number, dir: -1 | 1) {
    setBlocks((bs) => {
      const j = idx + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return reorder(copy);
    });
  }
  function remove(idx: number) {
    setBlocks((bs) => reorder(bs.filter((_, i) => i !== idx)));
  }
  function add() {
    const newBlock = { id: crypto.randomUUID(), type: addType, order: blocks.length, props: defaultProps(addType) } as Block;
    setBlocks((bs) => reorder([...bs, newBlock]));
  }

  async function save() {
    const res = await fetch(`/api/admin/landing-pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks: reorder(blocks), title, status }),
    });
    const data = await res.json();
    if (data.ok) flash("Salvo ✓");
    else flash((data.error ?? "Falha") + (data.issues ? `: ${data.issues.map((i: { path: (string|number)[]; message: string }) => i.path.join(".") + " " + i.message).join("; ")}` : ""));
  }

  if (loading) return <main style={{ padding: 32 }}><p style={{ color: "var(--text-muted)" }}>Carregando…</p></main>;
  if (!lp) return <main style={{ padding: 32 }}><p style={{ color: "var(--text-muted)" }}>LP não encontrada. <Link href="/admin/landing-pages" style={{ color: "var(--accent)" }}>Voltar</Link></p></main>;

  return (
    <main style={{ padding: "28px 32px 64px", maxWidth: 820 }}>
      {msg && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100, background: "var(--accent)", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, maxWidth: 420 }}>{msg}</div>}

      <Link href="/admin/landing-pages" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>← Landing pages</Link>

      <div style={{ ...card, marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 160px auto" }}>
        <div><label style={label}>Título interno</label><input style={input} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div>
          <label style={label}>Status</label>
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicada</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
          <a href={`/lt/${lp.slug}`} target="_blank" rel="noreferrer" style={{ ...btnGhost, textDecoration: "none" }}>Ver</a>
          <button style={btn} onClick={save}>Salvar</button>
        </div>
      </div>

      {blocks.map((b, idx) => (
        <div key={b.id} style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              {idx + 1}. {BLOCK_TYPES.find((t) => t.type === b.type)?.label ?? b.type}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={btnGhost} onClick={() => move(idx, -1)} disabled={idx === 0}>↑</button>
              <button style={btnGhost} onClick={() => move(idx, 1)} disabled={idx === blocks.length - 1}>↓</button>
              <button style={{ ...btnGhost, color: "#d9534f" }} onClick={() => remove(idx)}>×</button>
            </div>
          </div>
          {BLOCK_FIELDS[b.type].map((f) => (
            <BlockField key={f.key} spec={f} value={(b.props as Record<string, unknown>)[f.key]} onChange={(v) => updateProp(idx, f.key, v)} />
          ))}
        </div>
      ))}

      <div style={{ ...card, display: "flex", gap: 10, alignItems: "center" }}>
        <select style={{ ...input, width: 280 }} value={addType} onChange={(e) => setAddType(e.target.value as BlockType)}>
          {BLOCK_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
        </select>
        <button style={btn} onClick={add}>+ Adicionar bloco</button>
      </div>
    </main>
  );
}

function BlockField({ spec, value, onChange }: { spec: FieldSpec; value: unknown; onChange: (v: unknown) => void }) {
  const ta: React.CSSProperties = { ...input, minHeight: 70, resize: "vertical", fontFamily: "inherit" };

  let control: React.ReactNode;
  switch (spec.kind) {
    case "text":
      control = <input style={input} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={spec.hint} />;
      break;
    case "textarea":
      control = <textarea style={ta} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={spec.hint} />;
      break;
    case "enum":
      control = (
        <select style={input} value={(value as string) ?? spec.options?.[0]} onChange={(e) => onChange(e.target.value)}>
          {spec.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case "pairs":
      control = <textarea style={ta} value={pairsToText((value as { title?: string; text: string }[]) ?? [])} onChange={(e) => onChange(textToPairs(e.target.value))} placeholder={spec.hint} />;
      break;
    case "faq":
      control = <textarea style={ta} value={faqToText((value as { q: string; a: string }[]) ?? [])} onChange={(e) => onChange(textToFaq(e.target.value))} placeholder={spec.hint} />;
      break;
    case "testimonials":
      control = <textarea style={ta} value={testimonialsToText((value as { name: string; text: string; avatar?: string }[]) ?? [])} onChange={(e) => onChange(textToTestimonials(e.target.value))} placeholder={spec.hint} />;
      break;
    case "columns":
      control = <textarea style={ta} value={columnsToText((value as { label: string; price?: string; items: string[]; highlight: boolean }[]) ?? [])} onChange={(e) => onChange(textToColumns(e.target.value))} placeholder={spec.hint} />;
      break;
    case "strings":
      control = <textarea style={ta} value={((value as string[]) ?? []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n").filter(Boolean))} placeholder={spec.hint} />;
      break;
    default:
      control = null;
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <label style={label}>{spec.label}</label>
      {control}
    </div>
  );
}
