// Galeria de prova social — dados estáticos (sem admin)
// Para substituir: jogue 18 imagens em /public/images/social-proof/
// e troque os imageUrl abaixo. Enquanto não tiver as imagens reais,
// todos os cards usam o mesmo placeholder.svg.

export type SocialProofCard = {
  id: string;
  row: 1 | 2 | 3;
  imageUrl: string;
  alt: string;
  caption?: string;
};

const PLACEHOLDER = "/images/social-proof/placeholder.svg";

export const SOCIAL_PROOF_CARDS: SocialProofCard[] = [
  // ─── Linha 1 — Transformações (antes/depois) ───────────
  { id: "r1-01", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação de 21 dias — aluna 1", caption: "-7kg em 21 dias" },
  { id: "r1-02", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação — aluna 2", caption: "Sem dieta restritiva" },
  { id: "r1-03", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação — aluna 3", caption: "3 meses de método" },
  { id: "r1-04", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação — aluna 4", caption: "Antes e depois" },
  { id: "r1-05", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação — aluna 5", caption: "-12kg sem academia" },
  { id: "r1-06", row: 1, imageUrl: PLACEHOLDER, alt: "Transformação — aluna 6", caption: "Resultado real" },

  // ─── Linha 2 — Lifestyle saudável + refeições ──────────
  { id: "r2-01", row: 2, imageUrl: PLACEHOLDER, alt: "Prato saudável — rotina S.E.M", caption: "Prato do dia" },
  { id: "r2-02", row: 2, imageUrl: PLACEHOLDER, alt: "Lifestyle — caminhada matinal" },
  { id: "r2-03", row: 2, imageUrl: PLACEHOLDER, alt: "Refeição prática — cardápio 7 dias", caption: "Cardápio real" },
  { id: "r2-04", row: 2, imageUrl: PLACEHOLDER, alt: "Rotina de autocuidado" },
  { id: "r2-05", row: 2, imageUrl: PLACEHOLDER, alt: "Café da manhã do método" },
  { id: "r2-06", row: 2, imageUrl: PLACEHOLDER, alt: "Lifestyle saudável em casa", caption: "Sem drama" },

  // ─── Linha 3 — Depoimentos visuais + print zap ─────────
  { id: "r3-01", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento por mensagem — aluna 1", caption: "★★★★★" },
  { id: "r3-02", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento — print de conversa", caption: "Mudou minha vida" },
  { id: "r3-03", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento — vídeo feedback" },
  { id: "r3-04", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento — aluna 4", caption: "Voltei a me olhar no espelho" },
  { id: "r3-05", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento — aluna 5", caption: "★★★★★" },
  { id: "r3-06", row: 3, imageUrl: PLACEHOLDER, alt: "Depoimento — aluna 6", caption: "Finalmente funcionou" },
];
