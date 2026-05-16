// Manifesto de slots de imagem da LP.
// Admin mostra esses slots; se tiver registro em LpAsset pra (lpSlug, key),
// usa a imageUrl do DB; senão, fallback pro path estático em /public.

export type LpAssetSlot = {
  key: string;            // identificador estável — não mudar depois de migrado
  label: string;          // label no admin
  group: "hero" | "product" | "mockup" | "avatar";
  fallback: string;       // caminho /public pra fallback (string vazia = sem fallback, usa SVG component)
  // Dimensões alvo — upload é redimensionado + cropado pra esse aspecto exato.
  targetWidth: number;
  targetHeight: number;
  aspectHint?: string;    // dica visual no admin
  recommendedSize?: string;
  // Dica pro uploader: descreve a foto IDEAL pra esse slot.
  uploadGuide?: string;
  // Tamanho mínimo aceitável (pra qualidade). Abaixo disso, pode pixelar.
  minSize?: string;
  // Marca slots descontinuados (ebook → calendario). Admin agrupa em "Legacy"
  // mas preserva os dados ja cadastrados pra LPs alternativas (v2, /c/[slug]).
  legacy?: boolean;
  // Texto curto explicando onde aparece na LP nova.
  appearsIn?: string;
};

// LP /emagreca-sem-dieta — posicionamento: Calendario Detox 21 Dias.
// Cada slot tem fallback pra SVG component ou imagem estatica /public.
export const SLOTS_EMAGRECA: LpAssetSlot[] = [
  // ─── Hero ─────────────────────────────────────────────
  {
    key: "hero.calendar",
    label: "Hero — Foto do calendario",
    group: "hero",
    fallback: "", // sem fallback estatico — DetoxHero usa MockupCalendarDetox SVG quando nao tiver foto
    targetWidth: 1200,
    targetHeight: 1600,
    aspectHint: "3:4 vertical (calendario + mao de mulher marcando)",
    recommendedSize: "1200×1600px",
    minSize: "900×1200px",
    appearsIn: "Hero (lado direito, container redondo grande com sombra)",
    uploadGuide:
      "Foto vertical 3:4 do calendario A3 fisico em uso: pendurado na cozinha/quarto, alguns dias marcados com adesivo verde. Idealmente com mao de mulher marcando o dia. Luz natural suave, fundo creme/sage. Estetica wellness premium tipo Pinterest. IMPORTANTE: o motivo central (calendario+mao) deve estar no terco superior pra nao ser cortado em telas menores.",
  },
  {
    key: "hero.woman",
    label: "Hero — Mulher com calendario",
    group: "hero",
    fallback: "/images/hero-woman2.png",
    targetWidth: 1200,
    targetHeight: 1600,
    aspectHint: "3:4 vertical (mulher segurando/marcando calendario)",
    recommendedSize: "1200×1600px",
    minSize: "900×1200px",
    appearsIn: "Hero (alternativa a hero.calendar — uso adicional)",
    uploadGuide:
      "Foto vertical da mulher em rotina (cozinha/sala), segurando ou apontando pra o calendario. Expressao calma e confiante. Luz natural, fundo limpo creme/sage. Evite fotos muito formais ou de estudio.",
  },
  {
    key: "hero.phone",
    label: "Hero — App de acompanhamento",
    group: "hero",
    fallback: "/images/ebook-phone.jpg",
    targetWidth: 480,
    targetHeight: 640,
    aspectHint: "3:4 vertical (screenshot real do app)",
    recommendedSize: "480×640px",
    minSize: "360×480px",
    appearsIn: "Progresso e Veja o que recebe (substitui MockupAppDetox SVG)",
    uploadGuide:
      "Screenshot real do app de progresso aberto: streak counter, habitos do dia, calendario mensal. Fundo transparente ou neutro claro. Idealmente com algumas tarefas marcadas pra mostrar uso real.",
  },

  // ─── Produto (tangiveis) ──────────────────────────────
  {
    key: "product.kit-physical",
    label: "Produto — Kit fisico completo",
    group: "product",
    fallback: "",
    targetWidth: 1200,
    targetHeight: 1200,
    aspectHint: "1:1 quadrado (kit montado: calendario + cartilha + checklist)",
    recommendedSize: "1200×1200px",
    minSize: "800×800px",
    appearsIn: "Veja o que voce recebe (card destacado do Kit Detox)",
    uploadGuide:
      "Flat lay overhead do kit fisico montado: calendario A3 dobrado, cartilha de habitos, checklist impresso, embalagem premium. Fundo linho cru ou creme. Luz natural suave. Estetica planner premium tipo Pinterest wellness.",
  },
  {
    key: "product.checklist-paper",
    label: "Produto — Checklist impresso",
    group: "product",
    fallback: "",
    targetWidth: 800,
    targetHeight: 1000,
    aspectHint: "4:5 vertical (checklist na geladeira)",
    recommendedSize: "800×1000px",
    minSize: "600×750px",
    appearsIn: "Veja o que voce recebe (substitui MockupChecklistPaper SVG)",
    uploadGuide:
      "Foto do checklist impresso pendurado na geladeira com imã, alguns itens marcados a caneta. Fundo geladeira bege ou cozinha clara, luz da manha. Estetica realista (nao mockup digital).",
  },

  // ─── Mockups do ebook (LEGACY — pre Calendario Detox) ─
  {
    key: "mockup.spread",
    label: "Mockup — Páginas abertas do ebook",
    group: "mockup",
    fallback: "/images/ebook-spread.png",
    targetWidth: 1400,
    targetHeight: 800,
    aspectHint: "horizontal 7:4",
    recommendedSize: "1400×800px",
    minSize: "1050×600px",
    legacy: true,
    appearsIn: "Legacy: LPs alternativas (v2, /c/[slug])",
    uploadGuide:
      "[LEGACY — eram do ebook, nao usado na LP nova] Mockup horizontal de paginas internas. Mantido por compatibilidade com LPs antigas.",
  },
  {
    key: "mockup.cover",
    label: "Mockup — Capa do ebook",
    group: "mockup",
    fallback: "/images/ebook-mockup.png",
    targetWidth: 800,
    targetHeight: 1100,
    aspectHint: "vertical 8:11",
    recommendedSize: "800×1100px",
    minSize: "600×825px",
    legacy: true,
    appearsIn: "Legacy: LPs alternativas (v2, /c/[slug])",
    uploadGuide:
      "[LEGACY — era do ebook, nao usado na LP nova] Capa em perspectiva. Mantido por compatibilidade.",
  },

  // ─── Autora ───────────────────────────────────────────
  {
    key: "author.barbara",
    label: "Autora — Foto da Barbara",
    group: "hero",
    fallback: "/images/hero-woman2.png", // fallback temporário; SVG HeroAutora é usado se não tiver imagem customizada
    targetWidth: 520,
    targetHeight: 650,
    aspectHint: "4:5 vertical",
    recommendedSize: "520×650px",
    minSize: "400×500px",
    appearsIn: "AutoraSection",
    uploadGuide:
      "Foto da Barbara em ambiente natural (casa, cozinha, ao ar livre). Luz suave, expressão confiante. Enquadre do busto pra cima. Evite fotos muito formais ou de estúdio.",
  },

  // ─── Avatares (depoimentos) ───────────────────────────
  // Todos compartilham: quadrado 1:1, rosto bem centralizado, corte até ombros.
  // Foto de perfil estilo Instagram. Luz clara, expressão sorrindo/neutra.
  { key: "avatar.ana",      label: "Avatar — Ana",      group: "avatar", fallback: "/images/avatar-ana.jpg",      targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Ana, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.camila",   label: "Avatar — Camila",   group: "avatar", fallback: "/images/avatar-camila.png",   targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Camila, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.carla",    label: "Avatar — Carla",    group: "avatar", fallback: "/images/avatar-carla.jpg",    targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Carla, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.fernanda", label: "Avatar — Fernanda", group: "avatar", fallback: "/images/avatar-fernanda.png", targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Fernanda, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.juliana",  label: "Avatar — Juliana",  group: "avatar", fallback: "/images/avatar-juliana.png",  targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Juliana, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.marina",   label: "Avatar — Marina",   group: "avatar", fallback: "/images/avatar-marina.jpg",   targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Marina, centralizada. Corte até ombros. Estilo selfie natural." },
  { key: "avatar.patricia", label: "Avatar — Patricia", group: "avatar", fallback: "/images/avatar-patricia.jpg", targetWidth: 400, targetHeight: 400, aspectHint: "1:1 quadrado", recommendedSize: "400×400px", minSize: "300×300px", uploadGuide: "Foto de rosto da Patricia, centralizada. Corte até ombros. Estilo selfie natural." },
];

// Mapeamento de LPs → slots (expandir quando migrar outras)
export const LP_SLOTS: Record<string, LpAssetSlot[]> = {
  "emagreca-sem-dieta": SLOTS_EMAGRECA,
};

// Helper: resolve URL da imagem (DB > fallback)
export function resolveAssetUrl(
  assets: Record<string, { imageUrl: string }> | null | undefined,
  slot: LpAssetSlot
): string {
  return assets?.[slot.key]?.imageUrl ?? slot.fallback;
}
