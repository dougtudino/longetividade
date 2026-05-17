"use client";
import { useCallback, useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";
import {
  getCurrentPermission,
  subscribePush,
  unsubscribePush,
  checkPushCapability,
  type PlatformCheck,
} from "@/lib/push-client";

type Prefs = {
  water: boolean;
  challenge: boolean;
  cycle: boolean;
  weeklyRecap: boolean;
  generalMessages: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

type State = {
  hasSubscriptions: boolean;
  activeSubsCount: number;
  prefs: Prefs;
};

const CATEGORIES: Array<{ key: keyof Prefs; label: string; desc: string; icon: string }> = [
  { key: "water", label: "Lembrete de água", desc: "Te avisa se ainda não bateu 8 copos.", icon: "💧" },
  { key: "challenge", label: "Desafio diário", desc: "Lembra de marcar o dia do ciclo.", icon: "🎯" },
  { key: "cycle", label: "Status do ciclo", desc: "Avisa quando faltam poucos dias ou ciclo pausado.", icon: "🔁" },
  { key: "weeklyRecap", label: "Resumo semanal", desc: "Domingo manhã: como foi sua semana.", icon: "📅" },
  { key: "generalMessages", label: "Mensagens motivacionais", desc: "Frases e dicas pontuais.", icon: "✨" },
];

export default function NotificacoesPage() {
  const [capability, setCapability] = useState<PlatformCheck | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const refresh = useCallback(async () => {
    setCapability(checkPushCapability());
    setPermission(await getCurrentPermission());
    const r = await fetch("/api/app/push/prefs");
    if (r.ok) setState(await r.json());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleEnable() {
    setSaving(true);
    const result = await subscribePush();
    if (!result.ok) {
      const messages: Record<string, string> = {
        unsupported: "Seu navegador não suporta notificações push.",
        denied: "Você negou as notificações. Habilite nas configurações do navegador.",
        default: "Permissão não concedida ainda.",
        error: "Erro ao registrar notificações.",
      };
      alert(messages[result.reason] + (result.detail ? ` (${result.detail})` : ""));
    }
    await refresh();
    setSaving(false);
  }

  async function handleDisable() {
    if (!confirm("Desativar todas as notificações neste dispositivo?")) return;
    setSaving(true);
    await unsubscribePush();
    await refresh();
    setSaving(false);
  }

  async function handlePrefChange(key: keyof Prefs, value: boolean | number | null) {
    if (!state) return;
    const newPrefs = { ...state.prefs, [key]: value };
    setState({ ...state, prefs: newPrefs });
    setSaving(true);
    await fetch("/api/app/push/prefs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setSaving(false);
  }

  async function handleTest() {
    setTesting(true);
    const r = await fetch("/api/app/push/test", { method: "POST" });
    const d = await r.json();
    if (!d.sent || d.sent === 0) {
      alert(d.skipped ? "Categoria 'Mensagens motivacionais' desabilitada." : "Falha ao enviar push.");
    }
    setTesting(false);
  }

  if (state === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: "#639922" }} />
        <AppNav />
      </div>
    );
  }

  const subscribed = state.hasSubscriptions && permission === "granted";
  const blocked = permission === "denied";
  const supported = capability?.supported ?? false;

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Notificações</h1>
      <p className="mb-5 text-sm text-gray-500">
        Lembretes pra te ajudar a manter a rotina. Você escolhe o que e quando receber.
      </p>

      {/* Status / Permission */}
      <div
        className="mb-5 rounded-2xl p-5"
        style={{
          background: subscribed
            ? "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)"
            : blocked
              ? "#FBEDED"
              : "#FFF8EE",
          color: subscribed ? "white" : blocked ? "#7A2A2C" : "#8B5A0F",
        }}
      >
        {!supported && capability && (
          <>
            <p className="text-sm font-bold">
              {capability.reason === "ios_needs_install" && "Adicione o app à tela inicial"}
              {capability.reason === "in_app_browser" && "Abra no navegador completo"}
              {capability.reason === "no_pushmanager" && "Navegador não suporta push"}
              {capability.reason === "no_serviceworker" && "Service Worker indisponível"}
              {capability.reason === "unknown" && "Notificações não disponíveis"}
            </p>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">{capability.suggestion}</p>
            {capability.reason === "ios_needs_install" && (
              <div className="mt-3 rounded-xl bg-white p-3 text-[11px] text-gray-700 leading-relaxed">
                <p className="font-bold mb-1">Passo a passo no iPhone:</p>
                <ol className="ml-4 list-decimal space-y-0.5">
                  <li>Use o Safari (não Chrome no iPhone)</li>
                  <li>Toque no botão <strong>Compartilhar</strong> (□ com seta pra cima)</li>
                  <li>Role e toque em <strong>Adicionar à Tela de Início</strong></li>
                  <li>Toque em <strong>Adicionar</strong></li>
                  <li>Abra o app pelo ícone novo na tela inicial</li>
                  <li>Volte nessa tela e ative as notificações</li>
                </ol>
              </div>
            )}
          </>
        )}
        {supported && blocked && (
          <>
            <p className="text-sm font-bold">Notificações bloqueadas</p>
            <p className="text-xs mt-1 opacity-90">
              Você bloqueou anteriormente. Habilite manualmente: ícone do cadeado na URL → Notificações → Permitir.
            </p>
          </>
        )}
        {supported && !blocked && !subscribed && (
          <>
            <p className="text-sm font-bold">Notificações desativadas</p>
            <p className="text-xs mt-1 mb-3 opacity-90">
              Ative pra receber lembretes de água, desafio e ciclo. Você pode escolher quais categorias quer.
            </p>
            <button
              onClick={handleEnable}
              disabled={saving}
              className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
              style={{ backgroundColor: "#639922", color: "white" }}
            >
              {saving ? "..." : "Ativar notificações"}
            </button>
          </>
        )}
        {subscribed && (
          <>
            <p className="text-sm font-bold">✓ Ativas neste dispositivo</p>
            <p className="text-xs mt-1 mb-3 opacity-90">
              {state.activeSubsCount} {state.activeSubsCount === 1 ? "dispositivo" : "dispositivos"} recebendo.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTest}
                disabled={testing}
                className="rounded-xl py-2 text-xs font-bold disabled:opacity-60"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
              >
                {testing ? "..." : "Enviar teste"}
              </button>
              <button
                onClick={handleDisable}
                disabled={saving}
                className="rounded-xl py-2 text-xs font-bold disabled:opacity-60"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
              >
                Desativar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Categorias */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
        O que você quer receber
      </h2>
      <div className="mb-5 flex flex-col gap-2">
        {CATEGORIES.map((cat) => {
          const enabled = state.prefs[cat.key] as boolean;
          return (
            <button
              key={cat.key}
              onClick={() => handlePrefChange(cat.key, !enabled)}
              disabled={saving}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 text-left transition-all disabled:opacity-60"
              style={{ backgroundColor: enabled ? "#FAFAF7" : "white" }}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: "#EAF3DE" }}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{cat.label}</p>
                <p className="text-[11px] text-gray-500">{cat.desc}</p>
              </div>
              <div
                className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
                style={{ backgroundColor: enabled ? "#639922" : "#d1d5db" }}
              >
                <div
                  className="h-5 w-5 rounded-full bg-white transition-transform"
                  style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Horario silencioso */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
        Horário silencioso
      </h2>
      <div className="mb-5 rounded-2xl border border-gray-100 p-4">
        <p className="mb-3 text-xs text-gray-600 leading-relaxed">
          Defina horas em que NÃO quer receber notificações (ex: noite e madrugada).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500">De</label>
            <select
              value={state.prefs.quietHoursStart ?? ""}
              onChange={(e) =>
                handlePrefChange("quietHoursStart", e.target.value === "" ? null : Number(e.target.value))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Desligado</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{`${i.toString().padStart(2, "0")}:00`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500">Até</label>
            <select
              value={state.prefs.quietHoursEnd ?? ""}
              onChange={(e) =>
                handlePrefChange("quietHoursEnd", e.target.value === "" ? null : Number(e.target.value))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Desligado</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{`${i.toString().padStart(2, "0")}:00`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AppNav />
    </div>
  );
}
