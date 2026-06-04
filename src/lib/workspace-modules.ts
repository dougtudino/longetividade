// Fonte ÚNICA dos módulos de menu por workspace. Arquivo client-safe (sem
// import de prisma) pra poder ser importado tanto por server (lib/workspace.ts)
// quanto por componentes client (tela Workspaces, AdminSidebar). Antes isto
// estava duplicado em 3 lugares.

export const WORKSPACE_MODULES = [
  { key: "sales", label: "Vendas & Funil" },
  { key: "lp", label: "Landing pages" },
  { key: "ads", label: "Tráfego pago" },
  { key: "social", label: "Social orgânico" },
  { key: "app", label: "App VIP" },
] as const;

export type WorkspaceModuleKey = (typeof WORKSPACE_MODULES)[number]["key"];
