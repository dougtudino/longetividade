"use client";

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  link?: string;
};

export default function PendingChecklist({
  items,
  loading,
}: {
  items: ChecklistItem[] | null;
  loading?: boolean;
}) {
  const list = items ?? [];
  const openCount = list.filter((i) => !i.done).length;
  const doneCount = list.filter((i) => i.done).length;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "0.5px solid var(--border-subtle)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Pendencias
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {loading
              ? "carregando..."
              : `${openCount} aberta${openCount === 1 ? "" : "s"} · ${doneCount} concluida${doneCount === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      {loading && list.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Carregando...</div>
      )}

      {!loading && list.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Tudo em dia por aqui.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: item.done
                ? "rgba(107, 158, 107, 0.08)"
                : "var(--bg-secondary)",
              border: item.done
                ? "0.5px solid rgba(107, 158, 107, 0.3)"
                : "0.5px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: item.done
                  ? "1.5px solid #6B9E6B"
                  : "1.5px solid var(--border-default)",
                background: item.done ? "#6B9E6B" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {item.done && (
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  color: item.done ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: item.done ? "line-through" : "none",
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </div>
              {item.link && !item.done && (
                <a
                  href={item.link}
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    textDecoration: "none",
                    marginTop: 2,
                    display: "inline-block",
                  }}
                >
                  Abrir →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
