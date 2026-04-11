// Tokens de marca extraidos do site Longetividade
// Fonte: src/app/obrigado/page.tsx, src/app/page.tsx, paleta verde-oliva
export const BRAND = {
  // Paleta principal (verde-oliva)
  greenDark: "#3D5A3E",
  greenMid: "#7A9E7E",
  greenLight: "#9EBF9E",
  // Neutros (bege quente)
  cream: "#FAF8F5",
  ink: "#2D2D2D",
  inkMuted: "rgba(45,45,45,0.55)",
  // Acento (CTA dourado/destaque)
  accent: "#D4A94B",
  accentDark: "#8B7332",
  // Vermelho (urgência)
  red: "#C4787A",
  // Tipografia
  fontFamily: "'Nunito', Arial, sans-serif",
  // Logo
  logoText: "Longetividade",
  brandTag: "Método S.E.M",
} as const;

export const PRICING = {
  basico: { price: "37", label: "Básico" },
  completo: { price: "67", label: "Completo" },
  vip: { price: "97", label: "VIP" },
} as const;
