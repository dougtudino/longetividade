// Manifesto de slots de imagem da LP.
// Admin mostra esses slots; se tiver registro em LpAsset pra (lpSlug, key),
// usa a imageUrl do DB; senão, fallback pro path estático em /public.

export type LpAssetSlot = {
  key: string;            // identificador estável — não mudar depois de migrado
  label: string;          // label no admin
  group: "hero" | "mockup" | "avatar";
  fallback: string;       // caminho /public pra fallback
  // Dimensões alvo — upload é redimensionado + cropado pra esse aspecto exato.
  targetWidth: number;
  targetHeight: number;
  aspectHint?: string;    // dica visual no admin
  recommendedSize?: string;
  // Dica pro uploader: descreve a foto IDEAL pra esse slot.
  uploadGuide?: string;
  // Tamanho mínimo aceitável (pra qualidade). Abaixo disso, pode pixelar.
  minSize?: string;
};

// LP /emagreca-sem-dieta
export const SLOTS_EMAGRECA: LpAssetSlot[] = [
  // ─── Hero ─────────────────────────────────────────────
  {
    key: "hero.woman",
    label: "Hero — Foto da mulher",
    group: "hero",
    fallback: "/images/hero-woman2.png",
    targetWidth: 1200,
    targetHeight: 1600,
    aspectHint: "3:4 vertical (cara/busto centralizado)",
    recommendedSize: "1200×1600px",
    minSize: "900×1200px",
    uploadGuide:
      "Foto vertical de corpo 3/4 ou meio-corpo. Rosto no terço superior da imagem, olhando pra frente ou levemente de lado. Luz natural, fundo limpo. Evite fotos muito escuras ou com muitos elementos atrás.",
  },
  {
    key: "hero.phone",
    label: "Hero — Mockup celular",
    group: "hero",
    fallback: "/images/ebook-phone.jpg",
    targetWidth: 480,
    targetHeight: 640,
    aspectHint: "3:4 vertical",
    recommendedSize: "480×640px",
    minSize: "360×480px",
    uploadGuide:
      "Screenshot ou render do ebook visto no celular. Idealmente da capa. Fundo transparente ou neutro claro.",
  },

  // ─── Mockups do ebook ─────────────────────────────────
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
    uploadGuide:
      "Mockup horizontal de páginas internas do ebook (checklist, cardápio, dia 1 de 7). Mostra conteúdo rico — o usuário quer ver o que tem dentro.",
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
    uploadGuide:
      "Capa do ebook em perspectiva vertical (pode ser mockup 3D). Fundo transparente ou bem neutro. A capa inteira precisa estar visível.",
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
