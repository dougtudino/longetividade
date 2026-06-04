// Conteúdo do template de Low Ticket (LT) — data-driven, por workspace.
// O LtLanding renderiza a partir disto; Workspace.landingContent (Json) faz
// override do DEFAULT. Assim cada produto novo = preencher conteúdo no admin,
// sem código. Assets vêm do LpAsset; preços do WorkspacePlan.

export type LtDor = { t: string; d: string };

export type LtContent = {
  heroBadge: string;
  heroTitle: string; // 1ª linha do h1
  heroHighlight: string; // 2ª linha (destaque/cor)
  heroSubtitle: string;
  heroCtaPrefix: string; // texto do CTA; o preço é anexado
  heroNote: string;
  doresTitle: string;
  dores: LtDor[];
  reframeTitle: string;
  reframeHighlight: string;
  reframeBody: string;
  modulesTitle: string;
  modules: string[];
  pricingTitle: string;
  pricingSubtitle: string;
  guarantee: string;
  // tema (opcional — default navy+gold)
  accent?: string;
  bg?: string;
};

// DEFAULT = conteúdo do Corretor Blindado (estudo dos 550 comentários).
// É o fallback: a LP renderiza idêntica mesmo sem registro no banco.
export const DEFAULT_LT_CONTENT: LtContent = {
  heroBadge: "Pra corretor que está começando",
  heroTitle: "Fez o curso e saiu cru?",
  heroHighlight: "Você não está sozinho.",
  heroSubtitle:
    "O curso não ensinou. O estágio te abandonou. Aqui está a papelada que ninguém te mostrou — pra você não travar sua próxima venda por não saber ler uma matrícula.",
  heroCtaPrefix: "QUERO PARAR DE TER MEDO DA PAPELADA — ",
  heroNote: "Acesso imediato · consome em 1–2h · 7 dias de garantia",
  doresTitle: "Se isso é você, esse material foi feito pra te tirar do buraco",
  dores: [
    { t: "Saiu cru do curso", d: "“Fiz o curso online e parece que não sei absolutamente nada.” O TTI tira o CRECI, mas não te prepara pra prática." },
    { t: "O estágio te abandonou", d: "“Ninguém quer te ajudar, cada um por si.” Você foi jogado num plantão e teve que se virar sozinho." },
    { t: "E a papelada?", d: "Certidões, matrícula, cartório, quem paga, quando vai a registro. O buraco que ninguém preenche — e o que mais dá medo de travar uma venda." },
  ],
  reframeTitle: "Documentação não é a parte chata.",
  reframeHighlight: "É a sua arma de venda.",
  reframeBody:
    "O corretor que domina a papelada fecha mais — porque passa segurança ao comprador — e perde menos — porque capta com exclusividade e vira autoridade pro dono do imóvel. É o pilar com menos concorrência e o que mais decide uma venda.",
  modulesTitle: "O que tem dentro",
  modules: [
    "A mentalidade que transforma documentação em arma de venda",
    "As certidões essenciais: quais, pra quê e em que ordem",
    "Ler uma matrícula sem medo — ônus, hipoteca, averbação, linha a linha",
    "Onde tirar cada documento: sites, cartórios, custo e prazo",
    "Quem paga o quê e quando: comprador × vendedor × corretor",
    "Os 7 sinais de uma venda que vai travar — antes de perder tempo",
    "Captação com exclusividade usando documentação (vira autoridade pro dono)",
  ],
  pricingTitle: "Quanto custa parar de travar suas vendas?",
  pricingSubtitle: "pagamento único · acesso imediato",
  guarantee: "Garantia incondicional de 7 dias. Se não te ajudar, devolvemos cada centavo.",
  accent: "#d4af37",
  bg: "#0c1626",
};

// Mescla o conteúdo do banco (parcial) sobre o default.
export function resolveLtContent(dbContent: unknown): LtContent {
  if (!dbContent || typeof dbContent !== "object") return DEFAULT_LT_CONTENT;
  return { ...DEFAULT_LT_CONTENT, ...(dbContent as Partial<LtContent>) };
}
