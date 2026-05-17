// Branding centralizado do app VIP.
//
// Decisão de produto (2026-05-17): o app vira "21 Dias" (focado no
// loop de 21 dias) e a Longetividade fica como marca-mãe / empresa
// que entrega. Permite no futuro variantes por módulo trocando só
// o tagline (ex: "21 Dias Detox", "21 Dias pra Dormir Melhor")
// sem refatorar.
//
// Override via env vars (Railway/Vercel):
//   NEXT_PUBLIC_APP_BRAND_NAME       (default "21 Dias")
//   NEXT_PUBLIC_APP_BRAND_TAGLINE    (default "Sua Rotina Saudável")
//   NEXT_PUBLIC_APP_BRAND_FULL_NAME  (default "21 Dias · Sua Rotina Saudável")
//
// IMPORTANTE: Railway/Nixpacks/Turbopack tem bug que NÃO injeta
// NEXT_PUBLIC_* no build (memoria project_railway_nextpublic_quirk).
// Por isso o fallback hardcoded eh o caminho confiavel. Variants
// por modulo devem trocar essas constantes diretamente no codigo.

export const APP_BRAND = {
  // Como aparece no icone do celular, splash e barra de status
  name: process.env.NEXT_PUBLIC_APP_BRAND_NAME || "21 Dias",
  // Subheadline / descritor curto do que esse modulo entrega
  tagline: process.env.NEXT_PUBLIC_APP_BRAND_TAGLINE || "Sua Rotina Saudável",
  // Nome completo (Play Store, splash, About)
  fullName:
    process.env.NEXT_PUBLIC_APP_BRAND_FULL_NAME ||
    "21 Dias · Sua Rotina Saudável",
  // Marca-mae / empresa por tras (mantida pra contexto, rodape, e-mail)
  parentBrand: "Longetividade",
  // Atribuicao no rodape e e-mails
  by: "by Longetividade",
  // Dominio para links absolutos em e-mails
  domain: "longetividade.com.br",
} as const;
