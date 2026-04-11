"use client";

import { useState } from "react";
import Link from "next/link";

export default function AppIconPage() {
  const [loading, setLoading] = useState(false);

  async function downloadIcon() {
    setLoading(true);
    try {
      const res = await fetch("/api/og/app-icon", { cache: "no-store" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "longetividade-app-icon-1024.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 6px 0",
        }}
      >
        App Icon (Meta for Developers)
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          margin: "0 0 24px 0",
          lineHeight: 1.5,
        }}
      >
        Icone 1024×1024 PNG necessario para subir o app Longetividade Admin
        para modo Live no Meta for Developers.
      </p>

      {/* Preview */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <img
          src="/api/og/app-icon"
          alt="App icon preview"
          width={200}
          height={200}
          style={{
            borderRadius: 32,
            flexShrink: 0,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            Logo Longetividade
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
            Gradiente verde-oliva do brand · Letra &ldquo;L&rdquo; em branco
            sobre fundo arredondado · 1024×1024 PNG
          </div>
          <button
            onClick={downloadIcon}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Baixando..." : "↓ Baixar PNG 1024×1024"}
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 20,
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.7,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
          Como usar no Meta for Developers:
        </div>
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          <li>
            Baixa o PNG usando o botao acima
          </li>
          <li>
            Abre{" "}
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              developers.facebook.com/apps
            </a>{" "}
            → <strong>Longetividade Admin</strong>
          </li>
          <li>
            Menu lateral: <strong>Configurações → Básico</strong>
          </li>
          <li>
            Rola ate a secao <strong>Icone do App</strong> → <strong>+ Upload</strong>
          </li>
          <li>
            Seleciona o PNG baixado → Save Changes
          </li>
          <li>
            Na mesma pagina, preenche os outros campos pendentes:
            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
              <li>URL da Politica de Privacidade: <code>https://www.longetividade.com.br/privacidade</code></li>
              <li>Email de contato: <code>contato@longetividade.com.br</code></li>
              <li>Categoria: <strong>Business and Pages</strong></li>
            </ul>
          </li>
          <li>
            Topo da pagina: toggle <strong>Em Desenvolvimento → Em funcionamento (Live)</strong>
          </li>
          <li>
            Volta aqui em{" "}
            <Link href="/admin/campanhas/launch-plan" style={{ color: "var(--accent)", fontWeight: 600 }}>
              /admin/campanhas/launch-plan
            </Link>{" "}
            e clica <strong>Launch campaign</strong> de novo — agora os creatives vao ser criados com sucesso
          </li>
        </ol>
      </div>
    </div>
  );
}
