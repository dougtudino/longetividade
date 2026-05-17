"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { InstallPwaButton } from "@/components/app/install-pwa-button";

const CHALLENGES = [
  { id: "fome_emocional", label: "Fome emocional" },
  { id: "ansiedade", label: "Ansiedade" },
  { id: "tpm", label: "TPM" },
  { id: "beliscar_noite", label: "Beliscar a noite" },
  { id: "pular_refeicoes", label: "Pular refeicoes" },
  { id: "nao_bebo_agua", label: "Nao bebo agua" },
  { id: "sedentarismo", label: "Sedentarismo" },
  { id: "estresse", label: "Estresse" },
  { id: "sono_ruim", label: "Sono ruim" },
  { id: "falta_tempo", label: "Falta de tempo" },
];

type FormData = {
  name: string;
  objective: string;
  currentWeight: number | null;
  height: number | null;
  age: number | null;
  goalType: string;
  goalCustom: string;
  goalWeight: number | null;
  challenges: string[];
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    objective: "",
    currentWeight: null,
    height: null,
    age: null,
    goalType: "",
    goalCustom: "",
    goalWeight: null,
    challenges: [],
  });

  function update(patch: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleChallenge(id: string) {
    setForm((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(id)
        ? prev.challenges.filter((c) => c !== id)
        : [...prev.challenges, id],
    }));
  }

  function calcGoalWeight(): number | null {
    const w = form.currentWeight;
    if (!w) return null;
    switch (form.goalType) {
      case "primeiro_kg": return w - 1;
      case "5kg": return w - 5;
      case "10kg": return w - 10;
      case "peso_ideal": return form.goalWeight;
      default: return null;
    }
  }

  async function finish() {
    setSaving(true);
    const goalWeight = calcGoalWeight();
    await fetch("/api/app/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        goalWeight,
        onboardingDone: true,
      }),
    });
    router.push("/app/home");
  }

  const canAdvance = () => {
    switch (step) {
      case 1: return form.name && form.objective;
      case 2: return true; // opcional
      case 3: return form.goalType;
      case 4: return form.challenges.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: s <= step ? "#639922" : "#e5e7eb" }}
          />
        ))}
      </div>
      <p className="mb-2 text-xs font-medium text-gray-400">Etapa {step} de 5</p>

      {/* Step 1 — Apresentação do Broto + Nome + Objetivo */}
      {step === 1 && (
        <div className="flex-1">
          {/* Broto apresentação — antes de pedir qualquer coisa, mostra
              quem vai acompanhar a jornada. Sem login state ainda, então
              renderizamos direto a sprite stage-2 (acolhedora). */}
          <div className="mb-6 flex flex-col items-center text-center">
            <Image
              src="/broto/stage-2-brotinho.png"
              alt="Broto, seu companheiro de jornada"
              width={140}
              height={140}
              priority
              style={{ animation: "brotoBreath 4s ease-in-out infinite", transformOrigin: "center bottom" }}
            />
            <p className="mt-3 text-sm font-bold" style={{ color: "#3B6D11" }}>
              Oi, eu sou o Broto 🌱
            </p>
            <p className="mt-1 text-xs text-gray-500 max-w-xs leading-relaxed">
              Vou te acompanhar nessa jornada. Cada cuidado seu me faz crescer junto.
            </p>
            <style jsx>{`
              @keyframes brotoBreath {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.035); }
              }
            `}</style>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">Como posso te chamar?</h2>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Seu nome"
            className="mb-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-[#639922]"
          />
          <h2 className="mb-4 text-2xl font-bold text-gray-900">O que voce quer conquistar?</h2>
          {[
            { value: "emagrecer", label: "Quero emagrecer" },
            { value: "habitos", label: "Quero criar habitos saudaveis" },
            { value: "ambos", label: "Quero os dois" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ objective: opt.value })}
              className="mb-3 w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors"
              style={{
                borderColor: form.objective === opt.value ? "#639922" : "#e5e7eb",
                backgroundColor: form.objective === opt.value ? "#EAF3DE" : "white",
                color: form.objective === opt.value ? "#3B6D11" : "#374151",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Step 2 — Dados corporais */}
      {step === 2 && (
        <div className="flex-1">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Seus dados</h2>
          <p className="mb-6 text-sm text-gray-500">Opcional — ajuda a personalizar sua experiencia.</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Peso atual (kg)</label>
              <input
                type="number"
                value={form.currentWeight ?? ""}
                onChange={(e) => update({ currentWeight: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex: 72"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Altura (cm)</label>
              <input
                type="number"
                value={form.height ?? ""}
                onChange={(e) => update({ height: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex: 165"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Idade</label>
              <input
                type="number"
                value={form.age ?? ""}
                onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex: 35"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Meta de peso */}
      {step === 3 && (
        <div className="flex-1">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Qual e sua meta?</h2>
          {[
            { value: "primeiro_kg", label: "Perder o primeiro quilo" },
            { value: "5kg", label: "Perder 5 kg" },
            { value: "10kg", label: "Perder 10 kg" },
            { value: "peso_ideal", label: "Atingir meu peso ideal" },
            { value: "custom", label: "Definir minha meta" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ goalType: opt.value })}
              className="mb-3 w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors"
              style={{
                borderColor: form.goalType === opt.value ? "#639922" : "#e5e7eb",
                backgroundColor: form.goalType === opt.value ? "#EAF3DE" : "white",
                color: form.goalType === opt.value ? "#3B6D11" : "#374151",
              }}
            >
              {opt.label}
            </button>
          ))}
          {form.goalType === "peso_ideal" && (
            <input
              type="number"
              value={form.goalWeight ?? ""}
              onChange={(e) => update({ goalWeight: e.target.value ? Number(e.target.value) : null })}
              placeholder="Peso ideal (kg)"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
            />
          )}
          {form.goalType === "custom" && (
            <input
              type="text"
              value={form.goalCustom}
              onChange={(e) => update({ goalCustom: e.target.value })}
              placeholder="Descreva sua meta"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
            />
          )}
        </div>
      )}

      {/* Step 4 — Desafios */}
      {step === 4 && (
        <div className="flex-1">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Seus maiores desafios</h2>
          <p className="mb-6 text-sm text-gray-500">
            Selecione pelo menos 1. Seus lembretes serao personalizados.
          </p>
          <div className="flex flex-wrap gap-2">
            {CHALLENGES.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleChallenge(c.id)}
                className="rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: form.challenges.includes(c.id) ? "#639922" : "#e5e7eb",
                  backgroundColor: form.challenges.includes(c.id) ? "#EAF3DE" : "white",
                  color: form.challenges.includes(c.id) ? "#3B6D11" : "#6b7280",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — Resumo */}
      {step === 5 && (
        <div className="flex-1">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Tudo pronto, {form.name}!</h2>
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div>
              <p className="text-xs font-medium text-gray-400">Objetivo</p>
              <p className="font-medium text-gray-900">
                {form.objective === "emagrecer" ? "Emagrecer" : form.objective === "habitos" ? "Criar habitos saudaveis" : "Emagrecer + habitos"}
              </p>
            </div>
            {form.currentWeight && (
              <div>
                <p className="text-xs font-medium text-gray-400">Peso atual</p>
                <p className="font-medium text-gray-900">{form.currentWeight} kg</p>
              </div>
            )}
            {form.goalType && (
              <div>
                <p className="text-xs font-medium text-gray-400">Meta</p>
                <p className="font-medium text-gray-900">
                  {form.goalType === "custom" ? form.goalCustom : `${calcGoalWeight() ?? "—"} kg`}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-400">Desafios</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {form.challenges.map((id) => (
                  <span key={id} className="rounded-full bg-[#EAF3DE] px-3 py-1 text-xs font-medium text-[#3B6D11]">
                    {CHALLENGES.find((c) => c.id === id)?.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Marcos */}
          {form.currentWeight && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-gray-700">Seus marcos de conquista</h3>
              {[
                { kg: 1, label: "Primeiro quilo", time: "~2 semanas", icon: "🏅" },
                { kg: 5, label: "5 kg perdidos", time: "~2 meses", icon: "🥈" },
                { kg: 10, label: "10 kg perdidos", time: "~4 meses", icon: "🥇" },
              ].map((m) => (
                <div key={m.kg} className="mb-2 flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500">
                      {form.currentWeight! - m.kg} kg — {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Instalar app — só aparece se browser suportar e nao estiver instalado */}
          <div className="mt-6 rounded-2xl p-4" style={{ backgroundColor: "#FFF8EE", border: "1px solid #f5e6cc" }}>
            <p className="mb-2 text-sm font-bold" style={{ color: "#8B5A0F" }}>
              📲 Instale o app no celular
            </p>
            <p className="mb-3 text-xs" style={{ color: "#BA7517" }}>
              Acessa direto da tela inicial, receba lembretes de água, humor e desafio.
              Funciona offline.
            </p>
            <InstallPwaButton variant="primary" hideWhenInstalled={true} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 rounded-xl border-2 border-gray-200 py-3.5 text-base font-bold text-gray-500"
          >
            Voltar
          </button>
        )}
        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex-1 rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: "#639922" }}
          >
            Continuar
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="flex-1 rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#639922" }}
          >
            {saving ? "Salvando..." : "Comecar minha jornada"}
          </button>
        )}
      </div>
    </div>
  );
}
