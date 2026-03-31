// src/app/emagreca-sem-dieta/page.tsx — Pagina de vendas completa
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/lib/tracking";
import ThemeToggle from "@/components/ThemeToggle";
import { IdentificationChecklist } from "@/components/landing/identification-checklist";
import { MockupEbookCover } from "@/components/mockups/mockup-ebook-cover";
import { MockupPhoneTela } from "@/components/mockups/mockup-phone-tela";
import { MockupEbookSpread } from "@/components/mockups/mockup-ebook-spread";
import { BadgeResultado } from "@/components/visual";
import Image from "next/image";

const AVATAR_MAP: Record<string, string> = {
  fernanda: "/images/avatar-fernanda.png",
  camila: "/images/avatar-camila.png",
  patricia: "/images/avatar-patricia.jpg",
  ana: "/images/avatar-ana.jpg",
  carla: "/images/avatar-carla.jpg",
  juliana: "/images/avatar-juliana.png",
  marina: "/images/avatar-marina.jpg",
};

const LINKS = {
  hotmart: "https://pay.hotmart.com/H105141835Q",
  kiwify: "https://pay.kiwify.com.br/3fle7dM",
};

function handleBuyClick() {
  trackInitiateCheckout("Emagreca Sem Dieta", 37);
}

const bullets = [
  {
    cat: "Alimentacao sem restricao",
    items: [
      "Como montar refeicoes que ajudam a emagrecer sem pesar nada, contar caloria ou seguir cardapio complicado",
      "O alimento 'saudavel' que pode estar sabotando seu emagrecimento sem voce desconfiar (pagina 23)",
      "Como cozinhar UMA refeicao pra familia inteira e ainda emagrecer — sem fazer comida separada",
      "Por que 'comer menos' e exatamente o que esta impedindo voce de emagrecer — e o que fazer em vez disso",
      "Por que voce NAO precisa eliminar carboidrato, acucar ou gluten pra perder peso de forma saudavel",
    ],
  },
  {
    cat: "Controle emocional",
    items: [
      "Como controlar a fome da noite sem forca de vontade — usando uma tecnica simples de 3 minutos",
      "Como parar de comer por ansiedade sem se privar dos alimentos que voce gosta",
      "O pilar que 99% dos programas de emagrecimento ignoram — e sem ele, nenhuma dieta sustenta",
      "A razao real pela qual voce sente fome descontrolada a partir das 17h — e o ajuste simples que resolve",
    ],
  },
  {
    cat: "Movimento pratico",
    items: [
      "Como encaixar movimento no seu dia sem pisar numa academia e sem acordar as 5h da manha",
      "O tipo de movimento que queima mais gordura que 1 hora de esteira — e voce ja faz sem perceber",
      "15 minutos por dia: a rotina minima de movimento que funciona pra quem nao tem tempo pra mais nada",
    ],
  },
  {
    cat: "Verdades que mudam tudo",
    items: [
      "Por que a forca de vontade NAO e o fator que separa quem emagrece de quem nao emagrece — e qual e",
      "Por que mulheres acima de 30 tem MAIS dificuldade com dietas tradicionais — e a abordagem que funciona",
      "A razao cientifica pela qual dietas restritivas fazem voce ENGORDAR a medio prazo",
      "Os 3 sinais que realmente indicam progresso (e nenhum deles e o numero na balanca)",
    ],
  },
];

const bonuses = [
  {
    icon: "✅",
    titulo: "Checklist Diario Imprimivel",
    desc: "Imprima, cole na geladeira e siga todos os dias. Nos dias que voce nao quiser pensar, e so seguir a lista.",
    valor: "R$ 19,90",
  },
  {
    icon: "🔄",
    titulo: "Tabela de Substituicoes Alimentares",
    desc: "Nao gosta de brocolis? Troque. Nao come peixe? Troque. Flexibilidade total pra adaptar ao SEU gosto.",
    valor: "R$ 14,90",
  },
  {
    icon: "⚡",
    titulo: "10 Atalhos que Quem Emagrece Usa Todo Dia",
    desc: "Ajustes pequenos que aceleram seus resultados sem esforco extra. Nenhum exige dinheiro ou forca de vontade.",
    valor: "R$ 24,90",
  },
  {
    icon: "🛒",
    titulo: "Lista de Compras Estrategica",
    desc: "Chegue no mercado, siga a lista, gaste 20 minutos e saia com tudo que precisa pra semana inteira.",
    valor: "R$ 9,90",
  },
];

const faq = [
  {
    q: "Ja comprei outros ebooks e nao funcionaram. Por que esse seria diferente?",
    a: "A maioria dos ebooks de emagrecimento foca so em alimentacao — te da um cardapio e pronto. O Metodo S.E.M e diferente porque trabalha os 3 pilares que realmente importam: como voce come, como voce se sente e como voce se move. Nao adianta ter o cardapio perfeito se voce come por ansiedade. O S.E.M trata isso.",
  },
  {
    q: "Nao tenho tempo pra ler.",
    a: "O ebook tem 20-30 paginas de leitura direta e objetiva. Da pra ler em 1 hora. E a aplicacao leva 5 minutos por dia. Foi feito pra quem nao tem tempo — inclusive pra ler.",
  },
  {
    q: "Funciona pra quem tem mais de 35 anos?",
    a: "Sim. Na verdade, o Metodo S.E.M e especialmente eficaz para mulheres acima de 30, porque nao depende de metabolismo acelerado ou treinos intensos. Ele trabalha com habitos simples que funcionam em qualquer fase da vida.",
  },
  {
    q: "Preciso ir na academia?",
    a: "Nao. O Pilar 3 (Movimento) e baseado em movimento integrado a rotina: caminhar, subir escada, brincar com os filhos. 15 minutos por dia, sem sair de casa, sem trocar de roupa.",
  },
  {
    q: "Isso e mais uma dieta disfarcada?",
    a: "Nao. Zero restricao alimentar. Zero alimento proibido. Zero contagem de calorias. O Metodo S.E.M te ensina a comer com inteligencia, nao com restricao. Voce vai comer chocolate, pao, arroz — e emagrecer.",
  },
  {
    q: "E se nao funcionar pra mim?",
    a: "Voce tem 7 dias de garantia incondicional. Se nao gostar, nao sentir valor ou simplesmente mudar de ideia, e so pedir o reembolso. Devolvemos 100% sem perguntas.",
  },
  {
    q: "Esse ebook substitui nutricionista?",
    a: "Nao. O ebook e um guia pratico de habitos alimentares, emocionais e de movimento. Se voce tem condicoes medicas especificas, continue com seu profissional de saude. O ebook complementa qualquer acompanhamento.",
  },
  {
    q: "Como recebo o ebook?",
    a: "Imediatamente apos a confirmacao do pagamento, voce recebe o link de acesso por email. O download e instantaneo. Voce pode ler no celular, tablet ou computador.",
  },
];

const depoimentos = [
  {
    nome: "Ana Paula M.",
    local: "Sao Paulo, SP",
    resultado: "-8kg em 6 semanas",
    texto:
      "Perdi 8kg em 6 semanas sem passar fome. O metodo e completamente diferente de tudo que tentei antes. Pela primeira vez nao me sinto culpada por comer.",
  },
  {
    nome: "Fernanda R.",
    local: "Curitiba, PR",
    resultado: "-6kg em 3 semanas",
    texto:
      "Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estrategia. Em 3 semanas ja sentia diferenca na roupa.",
  },
  {
    nome: "Carla S.",
    local: "Rio de Janeiro, RJ",
    resultado: "-11kg em 3 meses",
    texto:
      "Finalmente um metodo que faz sentido. Aprendi a me relacionar com a comida de forma diferente. Nao sinto mais aquela compulsao noturna.",
  },
];

function CTA({ label = "Garantir Meu Acesso — R$37" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={LINKS.hotmart}
        onClick={handleBuyClick}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white transition-all active:scale-[0.98]"
        style={{
          backgroundColor: "var(--accent)",
          boxShadow: "0 8px 32px var(--accent-soft)",
        }}
      >
        {label}{" "}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
      <div className="flex flex-wrap justify-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <span>🔒 Pagamento 100% seguro</span>
        <span>·</span>
        <span>📲 Acesso imediato</span>
        <span>·</span>
        <span>🛡️ Garantia 7 dias</span>
      </div>
      <div className="mt-1 flex justify-center gap-3">
        <a
          href={LINKS.hotmart}
          onClick={handleBuyClick}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border px-4 py-2 text-xs font-medium transition-all"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          Pagar via Hotmart
        </a>
        <a
          href={LINKS.kiwify}
          onClick={handleBuyClick}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border px-4 py-2 text-xs font-medium transition-all"
          style={{
            borderColor: "var(--border-default)",
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          Pagar via Kiwify
        </a>
      </div>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        style={{ color: "var(--accent)" }}
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M5 8l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {text}
    </li>
  );
}

export default function EmagrecaSemDietaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    trackViewContent("Emagreca Sem Dieta", 37);
  }, []);

  return (
    <div className="themed min-h-screen antialiased">
      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="flex h-7 w-5 items-center justify-center rounded-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #7A9E7E, #FAF8F5)', boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              <span className="text-[5px] font-bold text-white leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>S.E.M</span>
            </div>
            <span className="text-xs font-bold">Longetividade</span>
          </Link>
          <div
            className="hidden items-center gap-2 rounded-full border px-4 py-1.5 sm:flex"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-medium text-red-400">
              Oferta por tempo limitado — R$37
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={LINKS.hotmart}
              onClick={handleBuyClick}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Comprar Agora
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--accent-soft)" }}
          />
        </div>
        <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Texto — 60% */}
          <div className="flex-1 text-center md:text-left">
            <p className="mb-4 text-sm italic" style={{ color: "var(--text-muted)" }}>
              Para mulheres que ja tentaram de tudo pra emagrecer e estao cansadas de se sentir culpadas
            </p>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--accent-soft)" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
                Mais de 12.400 mulheres ja transformaram sua relacao com a comida
              </span>
            </div>
            <h1
              className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              Voce Nao Precisa de Mais Uma Dieta.
              <br />
              <span style={{ color: "var(--accent)" }}>
                Precisa de um Metodo que Funcione na Sua Vida Real.
              </span>
            </h1>
            <p
              className="mb-8 max-w-2xl text-lg leading-relaxed md:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              Descubra o Metodo S.E.M — 3 pilares simples que estao ajudando mulheres ocupadas a
              emagrecerem sem cortar alimentos, sem academia e sem aquela culpa de todo dia. Inclui
              plano pratico de 7 dias com cardapio, lista de compras e checklist diario.
            </p>
            <div
              className="mx-auto md:mx-0 mb-8 max-w-md rounded-2xl border p-6"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
            >
              <div className="mb-3 flex items-baseline justify-center gap-3">
                <span className="text-lg line-through" style={{ color: "var(--text-hint)" }}>R$97</span>
                <span className="text-5xl font-black" style={{ color: "var(--text-primary)" }}>R$37</span>
                <span className="rounded-full px-2 py-1 text-xs font-bold" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>-72%</span>
              </div>
              <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>Ou 3x de R$9,90 sem juros</p>
              <CTA label="Quero Emagrecer Agora — R$37" />
            </div>
          </div>
          {/* Mockup do ebook — 40% */}
          <div className="flex-shrink-0 w-full max-w-[280px] md:max-w-[320px]">
            <Image
              src="/images/ebook-mockup.png"
              alt="Ebook Emagreca Sem Dieta — Metodo S.E.M"
              width={320}
              height={427}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="border-y py-8" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-around gap-6 px-6">
          {[
            { n: "12.400+", l: "alunas" },
            { n: "4.9 ★", l: "avaliacao" },
            { n: "97%", l: "satisfacao" },
            { n: "21 dias", l: "resultados" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.n}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LEAD STORY */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            Sabe aquele momento em que voce abre o guarda-roupa de manha...
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              Voce pega aquela calca jeans que cabia perfeitamente ha 2 anos. Tenta vestir. Nao fecha.
              Entao voce respira fundo, guarda de volta e pega a mesma legging preta de sempre. E sai
              de casa fingindo que esta tudo bem.
            </p>
            <p>
              Mas nao esta tudo bem. Porque enquanto voce dirige pro trabalho, cuida das criancas,
              resolve problema dos outros o dia inteiro... tem uma voz la no fundo repetindo:{" "}
              <em>&ldquo;Voce precisava cuidar de voce. Mas quando? Como? Se voce ja tentou de tudo e
              nada funcionou?&rdquo;</em>
            </p>
            <p>
              E ai chega a noite, voce esta exausta, e o unico conforto que aparece e aquele pacote
              de bolacha. E voce come. E depois sente culpa. E promete: &ldquo;Segunda eu comeco de novo.&rdquo;
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Se voce se reconheceu nessas linhas, preciso te dizer uma coisa importante:{" "}
              <span style={{ color: "var(--accent)" }}>o problema nunca foi voce.</span>
            </p>
            <p>
              Nunca foi falta de disciplina, de forca de vontade ou de comprometimento. O problema foi
              o metodo. Ou melhor — a falta de um metodo que funcione pra quem vive na vida real.
            </p>
          </div>
        </div>
      </section>

      {/* IDENTIFICACAO — componente interativo com barra de progresso e contador */}
      <IdentificationChecklist />

      {/* PROBLEMA NAO E VOCE */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Por que nada funcionou ate agora (e por que NAO e culpa sua)
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              Se dietas funcionassem de verdade, a industria de emagrecimento nao faturaria bilhoes
              todo ano. Se o produto resolvesse o problema, voce nao precisaria voltar. Mas voce
              volta. E volta. E volta.
            </p>
            <div
              className="rounded-xl border-l-4 p-4"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--accent-soft)" }}
            >
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Pesquisas mostram que mais de 93% das pessoas que fazem dieta restritiva recuperam
                todo o peso em ate 2 anos. Muitas recuperam com juros.
              </p>
            </div>
            <p>
              Porque dietas restritivas trabalham CONTRA o seu corpo. Elas criam privacao. Privacao
              gera compulsao. Compulsao gera culpa. Culpa gera mais restricao. E o ciclo nao para nunca.
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              O problema nunca foi disciplina. Foi estrategia.
            </p>
            <p>
              Voce nao precisa de mais forca de vontade. Voce precisa de um metodo que trabalhe COM
              o seu corpo, COM a sua rotina e COM as suas emocoes. Nao contra elas.
            </p>
          </div>
        </div>
      </section>

      {/* METODO S.E.M */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>A metodologia</p>
            <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Conheca o Metodo S.E.M</h2>
            <p className="mt-3 text-lg" style={{ color: "var(--text-secondary)" }}>Simplicidade. Equilibrio. Movimento.</p>
            <p className="mt-2 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Nao e mais uma dieta. E um sistema de 3 pilares que funcionam juntos pra criar um
              emagrecimento que dura — sem sofrimento, sem privacao e que cabe na sua rotina real.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                letra: "S",
                nome: "Simplicidade",
                desc: "Voce vai aprender a montar refeicoes que ajudam a emagrecer sem pesar comida, sem contar caloria e sem eliminar nada do prato. Sem lista de proibido. Sem culpa. Comer de verdade, emagrecer de verdade.",
              },
              {
                letra: "E",
                nome: "Equilibrio",
                desc: "Este e o pilar que ninguem fala. Voce vai entender por que come quando nao tem fome, por que a ansiedade dispara a noite, e o que fazer de verdade quando isso acontece.",
              },
              {
                letra: "M",
                nome: "Movimento",
                desc: "Esqueca academia. Aqui voce vai aprender a integrar movimento no seu dia em 15 minutos, sem trocar de roupa, sem sair de casa. Movimento que queima gordura e melhora seu humor.",
              },
            ].map((p) => (
              <div
                key={p.letra}
                className="flex flex-col gap-4 rounded-2xl border p-7"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl font-black text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {p.letra}
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{p.nome}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
          <div
            className="mt-8 rounded-xl border p-5 text-center"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--accent-soft)" }}
          >
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Enquanto dietas tratam so a alimentacao, o Metodo S.E.M trata voce por inteiro: corpo,
              mente e rotina.{" "}
              <span style={{ color: "var(--accent)" }}>Esse e o diferencial.</span>
            </p>
          </div>
        </div>
      </section>

      {/* O QUE VOCE VAI APRENDER */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Dentro do ebook, voce vai descobrir:
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {bullets.map((section) => (
              <div
                key={section.cat}
                className="rounded-2xl border p-6"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <h3 className="mb-4 font-bold" style={{ color: "var(--accent-text)" }}>{section.cat}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BONUSES */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Incluso no seu pedido</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Voce ainda recebe esses bonus exclusivos</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Valor total dos bonus: <strong>R$ 69,60</strong> —{" "}
              <span style={{ color: "var(--accent)" }}>Hoje, tudo GRATIS com o ebook.</span>
            </p>
          </div>
          {/* Mockup das paginas internas */}
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-[550px]">
              <MockupEbookSpread className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bonuses.map((b) => (
              <div
                key={b.titulo}
                className="flex gap-4 rounded-2xl border p-5"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="text-3xl">{b.icon}</div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{b.titulo}</h3>
                    <span className="text-xs line-through" style={{ color: "var(--text-hint)" }}>{b.valor}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-text)" }}>GRATIS</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Resultados reais</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Quem ja transformou sua vida</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {depoimentos.map((d) => (
              <div
                key={d.nome}
                className="flex flex-col gap-4 rounded-2xl border p-6"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z" />
                      </svg>
                    ))}
                  </div>
                  <BadgeResultado resultado={d.resultado} />
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  {AVATAR_MAP[d.nome.split(" ")[0].toLowerCase()] ? (
                    <Image
                      src={AVATAR_MAP[d.nome.split(" ")[0].toLowerCase()]}
                      alt={d.nome}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      style={{ width: 40, height: 40 }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-text)" }}
                    >
                      {d.nome.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{d.nome}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.local}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM E */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border p-7" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
              <h3 className="mb-5 text-xl font-bold" style={{ color: "var(--accent)" }}>
                ✅ Este ebook e pra voce se:
              </h3>
              <ul className="space-y-3">
                {[
                  "Voce e mulher entre 25 e 55 anos com rotina corrida",
                  "Voce ja tentou varias dietas e nao conseguiu manter o resultado",
                  "Voce quer emagrecer sem abrir mao da qualidade de vida",
                  "Voce precisa de algo pratico, direto e aplicavel a partir de amanha",
                  "Voce esta cansada de se sentir culpada por comer",
                  "Voce nao tem tempo (nem vontade) pra academia",
                  "Voce come por ansiedade ou emocao e quer entender por que",
                ].map((item) => <CheckItem key={item} text={item} />)}
              </ul>
            </div>
            <div className="rounded-2xl border p-7" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
              <h3 className="mb-5 text-xl font-bold" style={{ color: "var(--text-muted)" }}>
                ❌ Este ebook NAO e pra voce se:
              </h3>
              <ul className="space-y-3">
                {[
                  "Voce busca resultado magico em 3 dias (isso nao existe)",
                  "Voce quer mais um cardapio ultra-restritivo",
                  "Voce nao esta disposta a fazer pequenas mudancas",
                  "Voce quer substituir acompanhamento medico especializado",
                  "Voce quer ouvir que existe pilula magica ou atalho sem esforco",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span className="mt-0.5 text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="comprar" className="py-20 px-6">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Investimento</p>
            <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              Quanto vale transformar sua relacao com o seu corpo?
            </h2>
            {/* Phone mockup */}
            <div className="flex justify-center mt-6">
              <div className="w-[160px]">
                <MockupPhoneTela className="w-full" />
              </div>
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Acesso imediato no celular</p>
          </div>
          <div className="mb-8 rounded-2xl border p-6" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
            <h3 className="mb-4 font-semibold" style={{ color: "var(--text-secondary)" }}>
              Facilmente voce gasta mais do que isso tentando resolver o problema de outras formas:
            </h3>
            <div className="space-y-2">
              {[
                ["Consulta com nutricionista", "R$ 200 - R$ 400"],
                ["Programa de emagrecimento online (mes)", "R$ 97 - R$ 297"],
                ["1 mes de academia que voce nao vai", "R$ 80 - R$ 150"],
                ["Roupas novas porque as antigas nao cabem", "R$ 150 - R$ 500"],
                ["Delivery e fast food por falta de planejamento", "R$ 300+/mes"],
              ].map(([item, valor]) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                >
                  <span>{item}</span>
                  <span className="font-semibold whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{valor}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-3xl border p-8"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)", boxShadow: "0 0 60px var(--accent-soft)" }}
          >
            <div className="mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>
              72% de desconto — Oferta por tempo limitado
            </div>
            <div className="my-6 flex items-baseline justify-center gap-3">
              <span className="text-lg line-through" style={{ color: "var(--text-hint)" }}>R$97</span>
              <span className="text-7xl font-black" style={{ color: "var(--text-primary)" }}>R$37</span>
            </div>
            <p className="mb-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Ou 3x de R$9,90 sem juros — menos que um cafe com pao de queijo
            </p>
            <CTA label="Garantir Meu Acesso Agora" />
            <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="mb-4 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Tudo que voce recebe:</p>
              <ul className="space-y-2">
                {[
                  "Ebook Emagreca Sem Dieta — Metodo S.E.M completo",
                  "Plano pratico de 7 dias com cardapio dia a dia",
                  "Lista de compras estrategica pronta pra imprimir",
                  "Checklist diario imprimivel",
                  "Tabela de substituicoes alimentares",
                  "Guia 10 Atalhos de Aceleracao de Resultados",
                  "Acesso vitalicio — sem mensalidade",
                  "Garantia incondicional de 7 dias",
                ].map((item) => <CheckItem key={item} text={item} />)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-16 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-6 rounded-2xl border p-8" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
            <div className="text-5xl">🛡️</div>
            <div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Garantia Incondicional de 7 Dias: Risco ZERO pra Voce
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Eu sei que voce ja foi enganada antes. Sei que ja comprou coisas que prometiam o mundo
                e entregaram nada. Por isso, a garantia e simples:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  Compre o ebook. Leia. Aplique. Se nos proximos 7 dias voce sentir que nao valeu cada
                  centavo, me mande um email e eu devolvo 100% do seu dinheiro. Sem perguntas. Sem burocracia.
                </strong>{" "}
                O unico risco que voce corre e continuar fazendo a mesma coisa e esperando resultados diferentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Perguntas Frequentes
          </h2>
          <div className="flex flex-col gap-3">
            {faq.map((f, idx) => (
              <div
                key={f.q}
                className="rounded-2xl border transition-colors"
                style={{ borderColor: openFaq === idx ? "var(--border-hover)" : "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.q}</span>
                  <span
                    className="flex-shrink-0 text-lg leading-none transition-transform"
                    style={{ color: "var(--text-muted)", transform: openFaq === idx ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: "var(--text-primary)" }}>
            Voce tem duas opcoes agora.
          </h2>
          <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2 text-left">
            <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.04)" }}>
              <p className="mb-1 font-bold text-red-400">Opcao 1</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Fechar essa pagina, continuar fazendo o que sempre fez e esperar que algo mude.
                Comecar mais uma dieta na segunda. Desistir na quarta. Se sentir culpada na sexta. Repetir.
              </p>
            </div>
            <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--accent-soft)" }}>
              <p className="mb-1 font-bold" style={{ color: "var(--accent)" }}>Opcao 2</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Investir R$ 37 — o preco de um delivery — e dar uma chance pra um metodo que respeita
                sua rotina, seu corpo e suas emocoes. Com plano de 7 dias pronto. Para comecar AMANHA.
              </p>
            </div>
          </div>
          <p className="mb-8 text-lg" style={{ color: "var(--text-secondary)" }}>
            A escolha e sua. Mas se voce chegou ate aqui, la no fundo voce ja sabe qual e.
          </p>
          <CTA label="SIM, EU QUERO O METODO S.E.M — R$37" />
          <div className="mt-10 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>P.S.</strong> — Se voce esta pensando
              &ldquo;talvez depois&rdquo;: quantas vezes voce ja adiou cuidar de voce? Quantas
              &ldquo;segundas-feiras&rdquo; ja passaram? R$37 e 1 hora de leitura podem ser o inicio
              de uma mudanca que voce vai agradecer daqui a 6 meses.
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>P.P.S.</strong> — Voce tem 7 dias de
              garantia. Se nao gostar, devolvo seu dinheiro. O unico risco e nao tentar.
            </p>
          </div>
        </div>
      </section>

      {/* DISCLAIMER + FOOTER */}
      <footer className="border-t py-10 px-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="mb-6 rounded-xl border p-4 text-xs leading-relaxed"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <strong>Aviso importante:</strong> Este produto e um guia de habitos alimentares, emocionais
            e de movimento. Nao substitui acompanhamento medico ou nutricional profissional. Se voce tem
            condicoes de saude especificas, consulte seu medico ou nutricionista antes de iniciar qualquer
            mudanca alimentar. Resultados podem variar de pessoa para pessoa.
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link href="/" className="text-xs font-bold transition-colors" style={{ color: "var(--text-muted)" }}>
              ← Voltar para Longetividade
            </Link>
            <p className="text-xs" style={{ color: "var(--text-hint)" }}>
              © {new Date().getFullYear()} Longetividade. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
