"use client";

import { useEffect, useRef, useState } from "react";

/* eslint-disable react-hooks/exhaustive-deps */

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
};

type MayaContext = {
  vendasHoje: { count: number; receita: number };
  receitaMes: number;
  totalVendas: number;
  usuariosVip: number;
  checkinsHoje: number;
  pendencias: ChecklistItem[];
  dataHoje: string;
  horaAtual: string;
  adminName: string;
};

export default function MayaChat({
  onContextLoaded,
}: {
  onContextLoaded?: (ctx: MayaContext) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);
  const onContextLoadedRef = useRef(onContextLoaded);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onContextLoadedRef.current = onContextLoaded;
  }, [onContextLoaded]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      setLoading(true);
      try {
        const ctxRes = await fetch("/api/admin/maya/context");
        if (ctxRes.ok) {
          const ctx = (await ctxRes.json()) as MayaContext;
          onContextLoadedRef.current?.(ctx);
        }

        const initRes = await fetch("/api/admin/maya", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "__init__" }),
        });

        if (initRes.ok) {
          const data = (await initRes.json()) as {
            reply: string;
            context: MayaContext;
          };
          onContextLoadedRef.current?.(data.context);
          setMessages([{ role: "assistant", content: data.reply }]);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Oi! Tive um probleminha para carregar o painel agora, mas ja estou aqui. Me pergunta qualquer coisa.",
            },
          ]);
        }
      } catch {
        setMessages([
          {
            role: "assistant",
            content: "Oi! Estou com dificuldade de me conectar. Tente recarregar.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newHistory: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/maya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });
      if (!res.ok) {
        setMessages([
          ...newHistory,
          {
            role: "assistant",
            content: "Desculpa, tive um erro. Pode tentar de novo?",
          },
        ]);
      } else {
        const data = (await res.json()) as { reply: string; context: MayaContext };
        if (onContextLoaded) onContextLoaded(data.context);
        setMessages([...newHistory, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([
        ...newHistory,
        {
          role: "assistant",
          content: "Perdi a conexao. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        minHeight: 520,
      }}
    >
      <style>{`
        @keyframes mayaFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mayaDot {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        .maya-msg { animation: mayaFadeIn 0.25s ease-out; }
        .maya-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%;
                    background: #7A9E7E; margin: 0 2px; animation: mayaDot 1.2s infinite; }
        .maya-dot:nth-child(2) { animation-delay: 0.2s; }
        .maya-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "0.5px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #9EBF9E, #3D5A3E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          M
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Maya — Sua Assistente
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Amiga, estrategista e parceira de negocio
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6B9E6B",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#6B9E6B",
              display: "inline-block",
            }}
          />
          online
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: 400,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingRight: 4,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className="maya-msg"
            style={{
              alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: 14,
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              background:
                m.role === "assistant"
                  ? "rgba(158, 191, 158, 0.15)"
                  : "var(--bg-secondary)",
              border:
                m.role === "assistant"
                  ? "0.5px solid rgba(122, 158, 126, 0.4)"
                  : "0.5px solid var(--border-subtle)",
              color: "var(--text-primary)",
              borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
              borderBottomRightRadius: m.role === "user" ? 4 : 14,
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div
            className="maya-msg"
            style={{
              alignSelf: "flex-start",
              padding: "10px 14px",
              borderRadius: 14,
              background: "rgba(158, 191, 158, 0.15)",
              border: "0.5px solid rgba(122, 158, 126, 0.4)",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            Maya esta digitando
            <span className="maya-dot" />
            <span className="maya-dot" />
            <span className="maya-dot" />
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 14,
          paddingTop: 14,
          borderTop: "0.5px solid var(--border-subtle)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pergunte algo para a Maya..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "0.5px solid var(--border-default)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background:
              loading || !input.trim()
                ? "var(--border-default)"
                : "linear-gradient(135deg, #7A9E7E, #3D5A3E)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
