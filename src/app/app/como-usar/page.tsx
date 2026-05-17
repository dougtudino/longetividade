"use client";
import { AppNav } from "@/components/app/app-nav";
import Link from "next/link";

const STEPS = [
  {
    icon: "🎯",
    title: "1. Faca check-in todo dia",
    text: "Na home, marque os habitos do dia. Quanto mais dias seguidos, maior seu streak (🔥) e mais XP.",
    cta: "Ir pra Habitos",
    path: "/app/habitos",
  },
  {
    icon: "💧",
    title: "2. Beba 8 copos de agua",
    text: "Cada copo conta. Toque em + na tela de Agua. Bater 8 = bonus de XP.",
    cta: "Ir pra Agua",
    path: "/app/agua",
  },
  {
    icon: "⚖️",
    title: "3. Registre seu peso",
    text: "Na aba Progresso > Peso. Grafico mostra evolucao. Linha tracejada = sua meta.",
    cta: "Registrar peso",
    path: "/app/progresso",
  },
  {
    icon: "💚",
    title: "4. Marque seu humor",
    text: "Autoconhecimento eh chave. Em Emocional escolha o estado + gatilhos. Distribuicao aparece em Progresso > Humor.",
    cta: "Registrar humor",
    path: "/app/emocional",
  },
  {
    icon: "🔁",
    title: "5. Faca os ciclos de 21 dias",
    text: "Cada ciclo eh uma jornada de 21 dias com 1 missao diaria. Pode pausar e retomar. Ao completar, comece o proximo. Quantos mais ciclos, mais consolidacao.",
    cta: "Ver Desafio",
    path: "/app/desafio",
  },
  {
    icon: "🏆",
    title: "6. Suba de nivel",
    text: "Cada acao gera XP. Seu avatar evolui em 10 niveis (Aventureira → Lendaria Fenix). Veja todas conquistas em Conquistas.",
    cta: "Ver Conquistas",
    path: "/app/conquistas",
  },
  {
    icon: "📅",
    title: "7. Navegue pelos dias passados",
    text: "Use o seletor de dias na home pra ver registros antigos. Util pra avaliar consistencia.",
    cta: "Ir pra Home",
    path: "/app/home",
  },
];

export default function ComoUsarPage() {
  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-gray-900">Como usar o app</h1>
      <p className="mb-5 text-sm text-gray-500">Sete passos simples pra extrair o maximo da jornada.</p>

      <div className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 p-4"
            style={{ background: "white" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: "#EAF3DE" }}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800">{s.title}</h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">{s.text}</p>
                <Link
                  href={s.path}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold"
                  style={{ color: "#639922" }}
                >
                  {s.cta} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 rounded-2xl p-5 text-center"
        style={{
          background: "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)",
          color: "white",
        }}
      >
        <p className="text-base font-black">O jogo eh a sua realidade.</p>
        <p className="mt-1 text-xs opacity-80">Cada acao real conta XP. Cada dia eh uma quest. Boa jornada, guerreira.</p>
      </div>

      <AppNav />
    </div>
  );
}
