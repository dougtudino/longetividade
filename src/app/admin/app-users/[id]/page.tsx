"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type UserDetail = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    plan: string;
    accessType: string;
    createdAt: string;
    profile: {
      name: string;
      objective: string;
      currentWeight: number | null;
      height: number | null;
      age: number | null;
      goalType: string;
      goalWeight: number | null;
      waterGoal: number;
      challenges: string[];
      onboardingDone: boolean;
    } | null;
    level: { xp: number; level: number };
  };
  order?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    hotmartTransactionId: string | null;
  } | null;
  weightLogs?: Array<{ weight: number; note: string | null; loggedAt: string }>;
  waterLogs?: Array<{ cups: number; loggedAt: string }>;
  moodLogs?: Array<{ mood: string; note: string | null; triggers: string[]; loggedAt: string }>;
  measurements?: Array<{ waist: number | null; hip: number | null; note: string | null; loggedAt: string }>;
  challenges?: Array<{ day: number; completedAt: string }>;
  achievements?: Array<{
    achievement: { name: string; icon: string; description: string; xp: number };
    earnedAt: string;
  }>;
  recentCheckins?: Array<{
    date: string;
    waterCount: number;
    exerciseDone: boolean;
    note: string | null;
  }>;
  error?: string;
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
};

const h2: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text-primary)",
  margin: "0 0 12px 0",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AppUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/app-users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", padding: 40, textAlign: "center" }}>Carregando...</div>;
  }

  if (!data || !data.ok || !data.user) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/admin/app-users" style={{ color: "var(--accent)", fontSize: 13 }}>
          ← Voltar
        </Link>
        <div style={{ padding: 40, textAlign: "center", color: "#C4787A" }}>
          {data?.error ?? "Usuário não encontrado"}
        </div>
      </div>
    );
  }

  const { user, order, weightLogs = [], waterLogs = [], moodLogs = [], measurements = [], challenges = [], achievements = [], recentCheckins = [] } = data;
  const firstWeight = weightLogs[0]?.weight;
  const lastWeight = weightLogs[weightLogs.length - 1]?.weight;
  const weightLost = firstWeight && lastWeight ? firstWeight - lastWeight : 0;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Link
        href="/admin/app-users"
        style={{
          display: "inline-block",
          marginBottom: 14,
          color: "var(--accent)",
          fontSize: 13,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ← Todos clientes
      </Link>

      {/* Header */}
      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7A9E7E, #3D5A3E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {user.profile?.name
              ? user.profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
              : "?"}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
              {user.profile?.name ?? "(sem nome)"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.email}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(61,90,62,0.15)",
                  color: "#3D5A3E",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {user.plan}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: user.profile?.onboardingDone
                    ? "rgba(107,158,107,0.15)"
                    : "rgba(212,169,75,0.15)",
                  color: user.profile?.onboardingDone ? "#6B9E6B" : "#D4A94B",
                  fontWeight: 700,
                }}
              >
                {user.profile?.onboardingDone ? "Onboarding OK" : "Onboarding pendente"}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                cliente desde {fmtDate(user.createdAt)}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#D4A94B" }}>
              Nv {user.level.level}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.level.xp} XP</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Checkins", value: recentCheckins.length },
          { label: "Pesagens", value: weightLogs.length },
          { label: "Copos de água", value: waterLogs.reduce((s, w) => s + w.cups, 0) },
          { label: "Humor logs", value: moodLogs.length },
          { label: "Conquistas", value: achievements.length },
          { label: "Desafio 21d", value: `${challenges.length}/21` },
          { label: "Medidas", value: measurements.length },
        ].map((s) => (
          <div key={s.label} style={{ ...card, marginBottom: 0 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Profile */}
      {user.profile && (
        <div style={card}>
          <h2 style={h2}>Perfil</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Objetivo</div>
              <div style={{ fontWeight: 600 }}>{user.profile.objective}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Meta</div>
              <div style={{ fontWeight: 600 }}>
                {user.profile.goalType}
                {user.profile.goalWeight && ` · ${user.profile.goalWeight}kg`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Peso inicial</div>
              <div style={{ fontWeight: 600 }}>
                {user.profile.currentWeight ? `${user.profile.currentWeight}kg` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Altura · Idade</div>
              <div style={{ fontWeight: 600 }}>
                {user.profile.height ? `${user.profile.height}cm` : "—"} ·{" "}
                {user.profile.age ? `${user.profile.age}a` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Meta água</div>
              <div style={{ fontWeight: 600 }}>{user.profile.waterGoal} copos/dia</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Desafios escolhidos</div>
              <div style={{ fontWeight: 600 }}>{user.profile.challenges.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Peso série temporal */}
      {weightLogs.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Série temporal de peso</h2>
          <div style={{ fontSize: 13, marginBottom: 10 }}>
            Peso inicial: <strong>{firstWeight}kg</strong> · Atual: <strong>{lastWeight}kg</strong> ·{" "}
            {weightLost > 0 && (
              <span style={{ color: "#6B9E6B", fontWeight: 700 }}>-{weightLost.toFixed(1)}kg</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontFamily: "monospace" }}>
            {weightLogs.slice(-10).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "var(--bg-secondary)", borderRadius: 4 }}>
                <span style={{ color: "var(--text-muted)" }}>{fmtDate(w.loggedAt)}</span>
                <strong>{w.weight}kg</strong>
                {w.note && <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{w.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas */}
      {achievements.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Conquistas ganhas ({achievements.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {achievements.map((a, i) => (
              <div key={i} style={{ padding: 10, background: "var(--bg-secondary)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>{a.achievement.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{a.achievement.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {fmtDate(a.earnedAt)} · +{a.achievement.xp} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimos checkins */}
      {recentCheckins.length > 0 && (
        <div style={card}>
          <h2 style={h2}>Últimos checkins ({recentCheckins.length})</h2>
          <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.7 }}>
            {recentCheckins.slice(0, 10).map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                <span>{fmtDate(c.date)}</span>
                <span>💧{c.waterCount}</span>
                <span>{c.exerciseDone ? "🏃✓" : "🏃—"}</span>
                {c.note && <span style={{ color: "var(--text-muted)", fontStyle: "italic", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{c.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order info */}
      {order && (
        <div style={card}>
          <h2 style={h2}>Compra Hotmart</h2>
          <div style={{ fontSize: 13, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Data</div>
              <div>{fmtDate(order.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Valor</div>
              <div>R$ {(order.amount / 100).toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Status</div>
              <div>{order.status}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hotmart ID</div>
              <code style={{ fontSize: 11 }}>{order.hotmartTransactionId ?? "—"}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
