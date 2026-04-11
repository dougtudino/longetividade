"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";

type AppUserRow = {
  id: string;
  email: string;
  plan: string;
  createdAt: string;
  profile: {
    name: string;
    objective: string;
    onboardingDone: boolean;
    currentWeight: number | null;
    goalWeight: number | null;
  } | null;
  level: { xp: number; level: number };
  counts: {
    checkins: number;
    waterLogs: number;
    weightLogs: number;
    moodLogs: number;
    achievements: number;
    challenges: number;
  };
  lastCheckin: { date: string; waterCount: number; exerciseDone: boolean } | null;
  firstWeight: { weight: number; loggedAt: string } | null;
  lastWeight: { weight: number; loggedAt: string } | null;
  weightLost: number;
  streak: number;
  order: {
    amount: number;
    createdAt: string;
    status: string;
    hotmartTransactionId: string | null;
  } | null;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export default function AppUsersPage() {
  const [users, setUsers] = useState<AppUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "no-onboarding">("all");

  useEffect(() => {
    fetch("/api/admin/app-users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        if (data.warning) setError(data.warning);
        setLoading(false);
      })
      .catch((e) => {
        setError((e as Error).message);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.profile?.name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === "no-onboarding" && u.profile?.onboardingDone) return false;
    if (filter === "active") {
      const days = daysSince(u.lastCheckin?.date);
      if (days === null || days > 7) return false;
    }
    if (filter === "inactive") {
      const days = daysSince(u.lastCheckin?.date);
      if (days !== null && days <= 7) return false;
    }
    return true;
  });

  // Stats agregados
  const total = users.length;
  const active7d = users.filter((u) => {
    const days = daysSince(u.lastCheckin?.date);
    return days !== null && days <= 7;
  }).length;
  const onboardingDone = users.filter((u) => u.profile?.onboardingDone).length;
  const avgStreak =
    users.length > 0
      ? Math.round((users.reduce((s, u) => s + u.streak, 0) / users.length) * 10) / 10
      : 0;
  const totalWeightLost = users.reduce((s, u) => s + Math.max(0, u.weightLost), 0);

  const card: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "0.5px solid var(--border-default)",
    borderRadius: 12,
    padding: 16,
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          VIP App · Clientes
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 6px 0" }}>
          Clientes do App
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px 0", lineHeight: 1.5 }}>
          Lista de AppUsers VIP com progresso real — streak, XP, perda de peso, engagement.
        </p>
      </div>

      <PageHelp
        pageId="admin-app-users"
        agent={{ icon: "👥", name: "Doug/Bárbara", role: "Visibilidade clientes VIP" }}
        title="Quem comprou VIP e como estão engajando"
        quickActions={[
          { label: "Filtros", description: "Ativos (últimos 7d), Inativos (>7d sem checkin), Sem onboarding" },
          { label: "Busca", description: "Por email ou nome do perfil" },
          { label: "Click no card", description: "Abre detalhe completo: peso/checkins/conquistas/streak" },
        ]}
      >
        <p>
          Agora você consegue ver <strong>cada cliente VIP</strong> que entrou no app, o que
          ele está registrando, quanto peso perdeu, quantas conquistas ganhou. Cada linha é
          clicável e abre histórico completo.
        </p>
        <p>
          <strong>Quando uma venda Hotmart VIP entra</strong> o webhook cria um AppUser
          automaticamente. Ele aparece aqui mesmo antes de fazer primeiro login (onboarding=falso).
          Se o webhook falhar, ele é criado no primeiro login via fallback de Order aprovada.
        </p>
      </PageHelp>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total VIP", value: total, color: "#3D5A3E" },
          { label: "Ativos (7d)", value: active7d, color: "#6B9E6B" },
          { label: "Onboarding feito", value: onboardingDone, color: "#7A9E7E" },
          { label: "Streak médio", value: `${avgStreak}d`, color: "#D4A94B" },
          { label: "Peso perdido total", value: `${totalWeightLost.toFixed(1)}kg`, color: "#6B9E6B" },
        ].map((s) => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 2 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email ou nome..."
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 14px",
            borderRadius: 10,
            border: "0.5px solid var(--border-default)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
        {(["all", "active", "inactive", "no-onboarding"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: filter === f ? "var(--accent)" : "var(--bg-secondary)",
              color: filter === f ? "#fff" : "var(--text-secondary)",
              border: "0.5px solid var(--border-default)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "inactive" ? "Inativos" : "Sem onboarding"}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(196,120,122,0.1)",
            border: "0.5px solid rgba(196,120,122,0.3)",
            borderRadius: 10,
            color: "#C4787A",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            ...card,
            textAlign: "center",
            padding: 48,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          {users.length === 0
            ? "Nenhum cliente VIP ainda. Quando vier a primeira venda VIP, vai aparecer aqui."
            : "Nenhum resultado para os filtros atuais."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((u) => {
            const lastDays = daysSince(u.lastCheckin?.date);
            const isActive = lastDays !== null && lastDays <= 7;
            return (
              <Link
                key={u.id}
                href={`/admin/app-users/${u.id}`}
                style={{
                  ...card,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto auto",
                  gap: 16,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.15s",
                }}
              >
                {/* Avatar/status */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: isActive ? "rgba(107,158,107,0.2)" : "rgba(160,160,160,0.15)",
                    color: isActive ? "#6B9E6B" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    border: `2px solid ${isActive ? "#6B9E6B" : "#ccc"}`,
                  }}
                >
                  {u.profile?.name
                    ? u.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "?"}
                </div>

                {/* Name + email */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.profile?.name ?? "(sem nome)"}
                    {!u.profile?.onboardingDone && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(212,169,75,0.2)",
                          color: "#D4A94B",
                          fontWeight: 700,
                        }}
                      >
                        SEM ONBOARDING
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                </div>

                {/* Streak */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#D4A94B" }}>
                    🔥 {u.streak}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>streak</div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    Nv {u.level.level}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.level.xp} XP</div>
                </div>

                {/* Peso */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: u.weightLost > 0 ? "#6B9E6B" : "var(--text-muted)",
                    }}
                  >
                    {u.weightLost > 0 ? `-${u.weightLost.toFixed(1)}kg` : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {u.counts.weightLogs} pesagens
                  </div>
                </div>

                {/* Last checkin */}
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>último checkin</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                    {lastDays === null
                      ? "—"
                      : lastDays === 0
                        ? "hoje"
                        : lastDays === 1
                          ? "ontem"
                          : `${lastDays}d atrás`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
