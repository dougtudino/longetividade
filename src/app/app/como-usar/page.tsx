"use client";
import { AppNav } from "@/components/app/app-nav";
import { AvatarFantasy, tierLabel } from "@/components/app/avatar-fantasy";
import Link from "next/link";

const STEPS = [
  {
    icon: "🎯",
    title: "1. Faca check-in todo dia",
    text: "Marque os habitos do dia (agua, refeicoes, fruta, movimento, sono...). Quanto mais dias seguidos, maior seu streak (🔥) e mais XP.",
    cta: "Ir pra Habitos",
    path: "/app/habitos",
  },
  {
    icon: "💧",
    title: "2. Beba 8 copos de agua",
    text: "Cada copo conta. Toque + na tela de Agua. Bater 8 = bonus de XP.",
    cta: "Ir pra Agua",
    path: "/app/agua",
  },
  {
    icon: "⚖️",
    title: "3. Registre seu peso",
    text: "Em Progresso > Peso. Grafico mostra evolucao. Linha tracejada = sua meta.",
    cta: "Registrar peso",
    path: "/app/progresso",
  },
  {
    icon: "💚",
    title: "4. Marque seu humor",
    text: "Em Emocional escolha o estado + gatilhos. A distribuicao aparece em Progresso > Humor.",
    cta: "Registrar humor",
    path: "/app/emocional",
  },
  {
    icon: "🔁",
    title: "5. Faca os ciclos de 21 dias",
    text: "Cada ciclo eh uma jornada de 21 dias. Voce escolhe a intensidade (Suave / Constante / Intenso). Marcou 5+ habitos no dia? O dia do desafio avanca sozinho.",
    cta: "Ver Desafio",
    path: "/app/desafio",
  },
  {
    icon: "🏆",
    title: "6. Suba de nivel",
    text: "Cada acao gera XP. Seu avatar evolui em 10 niveis (Aprendiz -> Lendaria Fenix). Veja conquistas em Conquistas.",
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

// ─── Sistema de pontos ──────────────────────────────
const XP_TABLE = [
  { acao: "Fazer check-in do dia", xp: 10 },
  { acao: "Bater meta de agua (8 copos)", xp: 15 },
  { acao: "Movimento / exercicio", xp: 20 },
  { acao: "Registrar peso", xp: 15 },
  { acao: "Registrar humor", xp: 10 },
  { acao: "Marcar dia do desafio", xp: 20 },
  { acao: "Completar 10/10 habitos no dia", xp: 25 },
  { acao: "Favoritar receita", xp: 5 },
];

// ─── Niveis ─────────────────────────────────────────
const LEVELS = [
  { range: "1-2", tier: 1, name: "Aprendiz", xp: "0 - 100" },
  { range: "3-4", tier: 3, name: "Druida", xp: "100 - 900" },
  { range: "5-6", tier: 5, name: "Sacerdotisa", xp: "900 - 2.500" },
  { range: "7-8", tier: 7, name: "Cavaleira Rosa", xp: "2.500 - 4.900" },
  { range: "9", tier: 9, name: "Campea Brilhante", xp: "6.400" },
  { range: "10", tier: 10, name: "Lendaria Fenix", xp: "8.100+" },
];

// ─── Beneficios cientificamente embasados ───────────
const BENEFITS = [
  {
    icon: "💧",
    habit: "Hidratacao (8 copos/dia)",
    science:
      "Estudos clinicos associam ingestao adequada de agua (cerca de 2L) a melhor funcao cognitiva, menos dor de cabeca e regulacao da temperatura corporal. A desidratacao leve (1-2%) ja prejudica memoria e humor.",
  },
  {
    icon: "🥗",
    habit: "Refeicoes regulares",
    science:
      "Pular refeicoes leva a maior compulsao a noite (estudos sobre 'chrononutrition'). Comer em intervalos de 3-4h mantem glicemia estavel, evita picos de cortisol e reduz ansiedade alimentar.",
  },
  {
    icon: "🚶",
    habit: "Movimento diario (mesmo leve)",
    science:
      "OMS recomenda 150 min/sem de atividade moderada. Caminhar 20-30 min reduz risco cardiovascular em ate 30%, melhora humor (libera serotonina) e qualidade do sono.",
  },
  {
    icon: "🌙",
    habit: "Sono de qualidade",
    science:
      "Dormir 7-9h regula leptina e grelina (hormonios da fome). Privacao de sono ta associada a ganho de peso, resistencia a insulina e depressao (meta-analises em sleep medicine).",
  },
  {
    icon: "🍎",
    habit: "Frutas e fibras",
    science:
      "Fibras alimentam microbiota intestinal saudavel. Eixo intestino-cerebro influencia humor, imunidade e metabolismo. 5 porcoes/dia de frutas/vegetais reduz mortalidade.",
  },
  {
    icon: "🧘",
    habit: "Registrar humor + respiracao",
    science:
      "Mindfulness e journaling emocional reduzem cortisol e melhoram regulacao emocional. Apenas 5 min/dia de auto-observacao ja mostram efeito em estudos controlados.",
  },
  {
    icon: "🙏",
    habit: "Gratidao + conexao",
    science:
      "Praticar gratidao (anotar 3 coisas/dia) por 21 dias reduz sintomas depressivos. Conexoes sociais sao previsor #1 de longevidade (Harvard Study of Adult Development, 85 anos).",
  },
];

export default function ComoUsarPage() {
  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-gray-900">Como usar o app</h1>
      <p className="mb-5 text-sm text-gray-500">
        Rotina + repeticao + melhoria. Cada acao real conta. O jogo eh a sua vida.
      </p>

      {/* ─── 1. Sete passos ─── */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Sete passos</h2>
      <div className="mb-8 flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-4 bg-white">
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

      {/* ─── 2. Sistema de pontos ─── */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
        Sistema de pontos (XP)
      </h2>
      <div className="mb-8 rounded-2xl border border-gray-100 p-4">
        <p className="mb-3 text-xs text-gray-600 leading-relaxed">
          Cada acao real no app gera XP. Os pontos sobem com consistencia, nao com intensidade.
          Voce nao precisa fazer tudo perfeito — basta voltar amanha.
        </p>
        <div className="space-y-2">
          {XP_TABLE.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{row.acao}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                +{row.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Niveis e tiers ─── */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
        Niveis e tiers (sua jornada)
      </h2>
      <div className="mb-8 rounded-2xl border border-gray-100 p-4">
        <p className="mb-4 text-xs text-gray-600 leading-relaxed">
          Voce comeca como <strong>Aprendiz</strong> e vai subindo em 10 niveis. Cada nivel cresce sua aventureira:
          cabelos, vestes, armadura, gemas, aura. Voce nunca perde nivel — so sobe.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {LEVELS.map((l) => (
            <div key={l.range} className="flex items-center gap-2 rounded-xl border border-gray-100 p-2">
              <div className="flex-shrink-0">
                <AvatarFantasy level={l.tier} size={50} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Nv {l.range}</p>
                <p className="text-xs font-bold text-gray-800 truncate">{l.name}</p>
                <p className="text-[10px] text-gray-500">{l.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Ciclos com dificuldade ─── */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
        Ciclos de 21 dias (3 intensidades)
      </h2>
      <div className="mb-8 rounded-2xl border border-gray-100 p-4">
        <p className="mb-3 text-xs text-gray-600 leading-relaxed">
          Voce escolhe a intensidade. Concluiu um ciclo? O app sugere subir um degrau no proximo.
        </p>
        <div className="space-y-2">
          {[
            { icon: "🌱", name: "Suave", desc: "Entrada gentil. Pequenos passos. Pra criar habito sem peso.", color: "#8BC34A" },
            { icon: "🌿", name: "Constante", desc: "Ritmo equilibrado. Voce ja se mexe e quer firmar.", color: "#639922" },
            { icon: "🌳", name: "Intenso", desc: "Pra quem ja consolidou e quer maxima cobranca consigo.", color: "#BA7517" },
          ].map((d) => (
            <div key={d.name} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: d.color + "20", border: `1px solid ${d.color}40` }}
              >
                {d.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: d.color }}>{d.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. Beneficios cientificamente embasados ─── */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
        O que melhora na sua vida (e por que)
      </h2>
      <div className="mb-8 rounded-2xl border border-gray-100 p-4">
        <p className="mb-4 text-xs text-gray-600 leading-relaxed">
          Cada habito do app eh baseado em evidencia clinica. Voce nao esta seguindo modinha — esta aplicando
          o que medicina, nutricao e psicologia ja sabem ha decadas.
        </p>
        <div className="space-y-3">
          {BENEFITS.map((b, i) => (
            <div key={i} className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{b.icon}</span>
                <p className="text-sm font-bold text-gray-800">{b.habit}</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{b.science}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-gray-400 italic">
          Referencias: OMS, Harvard Study of Adult Development, Lancet Public Health,
          Sleep Medicine Reviews, Cochrane.
        </p>
      </div>

      {/* ─── 6. Para quem importa ─── */}
      <div
        className="rounded-2xl p-5 text-center mb-6"
        style={{
          background: "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)",
          color: "white",
        }}
      >
        <p className="text-base font-black">A rotina muda voce.</p>
        <p className="mt-1 text-xs opacity-90 leading-relaxed">
          E quem ta perto sente. Mais energia pra brincar com filho, mais paciencia
          pra escutar quem ama, mais clareza pra tomar decisao. O app eh seu —
          mas o impacto eh de todo mundo na sua volta.
        </p>
      </div>

      <AppNav />
    </div>
  );
}
