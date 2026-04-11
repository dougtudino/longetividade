import { prisma } from "./prisma";
import { fetchAccountInsights } from "./meta-ads";

export type DailyReportData = {
  date: string;
  greeting: string;
  vendasHoje: { count: number; receita: number };
  vendasOntem: { count: number; receita: number };
  receitaMes: number;
  receitaMesAnterior: number;
  totalVendasHistorico: number;
  ticketMedio: number;
  usuariosVip: number;
  vipNovosHoje: number;
  checkinsHoje: number;
  abandonosHoje: number;
  pendenciasAbertas: number;
  metaAds: {
    spend: number;
    impressions: number;
    clicks: number;
    purchases: number;
    purchaseValue: number;
    roas: number;
  } | null;
  topPlanoMes: { plan: string; count: number } | null;
};

function fmtBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export async function buildDailyReportData(): Promise<DailyReportData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = monthStart;

  let vendasHojeCount = 0;
  let vendasHojeReceita = 0;
  let vendasOntemCount = 0;
  let vendasOntemReceita = 0;
  let receitaMes = 0;
  let receitaMesAnterior = 0;
  let totalVendasHistorico = 0;
  let totalReceita = 0;
  const planCounts: Record<string, number> = {};

  try {
    const orders = await prisma.order.findMany({
      where: { status: "approved" },
      select: { amount: true, plan: true, createdAt: true },
    });
    totalVendasHistorico = orders.length;
    for (const o of orders) {
      totalReceita += o.amount / 100;
      if (o.createdAt >= todayStart) {
        vendasHojeCount += 1;
        vendasHojeReceita += o.amount / 100;
      } else if (o.createdAt >= yesterdayStart && o.createdAt < todayStart) {
        vendasOntemCount += 1;
        vendasOntemReceita += o.amount / 100;
      }
      if (o.createdAt >= monthStart) {
        receitaMes += o.amount / 100;
      } else if (o.createdAt >= lastMonthStart && o.createdAt < lastMonthEnd) {
        receitaMesAnterior += o.amount / 100;
      }
      if (o.createdAt >= monthStart) {
        planCounts[o.plan] = (planCounts[o.plan] ?? 0) + 1;
      }
    }
  } catch {
    /* tabela pode nao existir */
  }

  const ticketMedio = totalVendasHistorico > 0 ? totalReceita / totalVendasHistorico : 0;
  const topPlanoMes = Object.entries(planCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([plan, count]) => ({ plan, count }))[0] ?? null;

  let usuariosVip = 0;
  let vipNovosHoje = 0;
  let checkinsHoje = 0;
  let abandonosHoje = 0;
  try {
    usuariosVip = await prisma.appUser.count({ where: { plan: "vip" } });
    vipNovosHoje = await prisma.appUser.count({
      where: { plan: "vip", createdAt: { gte: todayStart } },
    });
    checkinsHoje = await prisma.appCheckin.count({ where: { createdAt: { gte: todayStart } } });
    abandonosHoje = await prisma.abandonedCheckout.count({
      where: { createdAt: { gte: todayStart } },
    });
  } catch {
    /* tabelas podem nao existir */
  }

  let pendenciasAbertas = 0;
  try {
    const settingKeys = ["BREVO_API_KEY", "META_ADS_ACCOUNT_ID", "NEXT_PUBLIC_META_PIXEL_ID", "META_ADS_ACCESS_TOKEN", "EMAIL_PRO_DNS_OK"];
    const settings = await prisma.appSetting.findMany({
      where: { key: { in: settingKeys } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    if (!map.get("BREVO_API_KEY")) pendenciasAbertas += 1;
    if (!map.get("META_ADS_ACCOUNT_ID")) pendenciasAbertas += 1;
    if (!map.get("NEXT_PUBLIC_META_PIXEL_ID")) pendenciasAbertas += 1;
    if (!map.get("META_ADS_ACCESS_TOKEN")) pendenciasAbertas += 1;
    if (map.get("EMAIL_PRO_DNS_OK") !== "true") pendenciasAbertas += 1;
    if (totalVendasHistorico === 0) pendenciasAbertas += 1;
  } catch {
    /* tabela pode nao existir */
  }

  let metaAds: DailyReportData["metaAds"] = null;
  try {
    const insights = await fetchAccountInsights("yesterday");
    if (insights.ok) {
      metaAds = {
        spend: insights.spend,
        impressions: insights.impressions,
        clicks: insights.clicks,
        purchases: insights.purchases,
        purchaseValue: insights.purchaseValue,
        roas: insights.roas,
      };
    }
  } catch {
    /* meta nao configurado */
  }

  return {
    date: now.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    greeting: greetingByHour(),
    vendasHoje: { count: vendasHojeCount, receita: vendasHojeReceita },
    vendasOntem: { count: vendasOntemCount, receita: vendasOntemReceita },
    receitaMes,
    receitaMesAnterior,
    totalVendasHistorico,
    ticketMedio,
    usuariosVip,
    vipNovosHoje,
    checkinsHoje,
    abandonosHoje,
    pendenciasAbertas,
    metaAds,
    topPlanoMes,
  };
}

function deltaPct(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+∞" : "0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function pickHighlight(d: DailyReportData): string {
  if (d.totalVendasHistorico === 0) {
    return "Hoje e o dia perfeito pra disparar a primeira campanha — tudo armado, faltam clientes chegando.";
  }
  if (d.metaAds && d.metaAds.spend > 0 && d.metaAds.purchases === 0) {
    return `Atencao: gastei R$ ${fmtBRL(d.metaAds.spend)} no Meta ontem sem nenhuma conversao. Vale revisar a segmentacao.`;
  }
  if (d.metaAds && d.metaAds.roas >= 2) {
    return `Roteiro escalavel: ROAS ${d.metaAds.roas.toFixed(2)}x ontem. Considere subir o orcamento da campanha campea em 20%.`;
  }
  if (d.vendasHoje.count > d.vendasOntem.count && d.vendasOntem.count > 0) {
    return `Estamos em ritmo melhor que ontem (${d.vendasHoje.count} vs ${d.vendasOntem.count} vendas). Mantenha o foco.`;
  }
  if (d.pendenciasAbertas > 0) {
    return `${d.pendenciasAbertas} pendencias de setup abertas — acessa /admin/setup quando puder pra fechar elas.`;
  }
  return "Tudo fluindo. Hoje e dia de monitorar e ajustar criativos se necessario.";
}

export function renderDailyReportHTML(d: DailyReportData, adminName: string): string {
  const monthDelta = deltaPct(d.receitaMes, d.receitaMesAnterior);
  const monthDeltaColor = d.receitaMes >= d.receitaMesAnterior ? "#6B9E6B" : "#C4787A";
  const highlight = pickHighlight(d);
  const metaBlock = d.metaAds
    ? `
      <tr><td colspan="2" style="padding-top:18px;">
        <h3 style="margin:0 0 8px 0;font-size:14px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Meta Ads (ontem)</h3>
      </td></tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#666;">Gasto</td>
        <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">R$ ${fmtBRL(d.metaAds.spend)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#666;">Impressoes / Cliques</td>
        <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.metaAds.impressions.toLocaleString("pt-BR")} / ${d.metaAds.clicks.toLocaleString("pt-BR")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#666;">Compras (Pixel)</td>
        <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.metaAds.purchases.toFixed(0)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#666;">ROAS</td>
        <td style="padding:6px 0;font-size:14px;color:${d.metaAds.roas >= 1 ? "#6B9E6B" : "#C4787A"};text-align:right;font-weight:700;">${d.metaAds.roas.toFixed(2)}x</td>
      </tr>
    `
    : `
      <tr><td colspan="2" style="padding-top:18px;font-size:12px;color:#999;font-style:italic;">
        Meta Ads ainda nao configurado ou sem dados de ontem.
      </td></tr>
    `;

  const topPlanBlock = d.topPlanoMes
    ? `<p style="margin:6px 0 0 0;font-size:12px;color:#888;">Plano lider do mes: <strong>${d.topPlanoMes.plan}</strong> (${d.topPlanoMes.count} vendas)</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">

    <div style="padding:24px 28px;background:linear-gradient(135deg,#7A9E7E,#3D5A3E);color:#fff;">
      <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">Maya — Relatorio Diario</div>
      <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">${d.greeting}, ${adminName}!</h1>
      <p style="margin:4px 0 0 0;font-size:13px;opacity:0.9;text-transform:capitalize;">${d.date}</p>
    </div>

    <div style="padding:20px 28px;border-bottom:1px solid #F0EDE5;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3D5A3E;font-style:italic;">
        ${highlight}
      </p>
    </div>

    <div style="padding:24px 28px;">
      <h3 style="margin:0 0 12px 0;font-size:14px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Vendas hoje</h3>
      <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Receita hoje</td>
          <td style="padding:6px 0;font-size:18px;color:#2D2D2D;text-align:right;font-weight:700;">R$ ${fmtBRL(d.vendasHoje.receita)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Vendas hoje</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.vendasHoje.count} ${d.vendasHoje.count === 1 ? "venda" : "vendas"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Comparativo de ontem</td>
          <td style="padding:6px 0;font-size:13px;color:#888;text-align:right;">R$ ${fmtBRL(d.vendasOntem.receita)} (${d.vendasOntem.count})</td>
        </tr>

        <tr><td colspan="2" style="padding-top:18px;">
          <h3 style="margin:0 0 8px 0;font-size:14px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Mes</h3>
        </td></tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Receita do mes</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">R$ ${fmtBRL(d.receitaMes)} <span style="color:${monthDeltaColor};font-size:12px;">${monthDelta}</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Ticket medio</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">R$ ${fmtBRL(d.ticketMedio)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Total historico</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.totalVendasHistorico} vendas</td>
        </tr>

        <tr><td colspan="2" style="padding-top:18px;">
          <h3 style="margin:0 0 8px 0;font-size:14px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">App VIP</h3>
        </td></tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Usuarios VIP</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.usuariosVip}${d.vipNovosHoje > 0 ? ` (+${d.vipNovosHoje} hoje)` : ""}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Check-ins hoje</td>
          <td style="padding:6px 0;font-size:14px;color:#2D2D2D;text-align:right;font-weight:600;">${d.checkinsHoje}</td>
        </tr>

        ${metaBlock}
      </table>
      ${topPlanBlock}
    </div>

    ${d.pendenciasAbertas > 0 ? `
    <div style="padding:18px 28px;background:#FFF8EC;border-top:1px solid #F0EDE5;">
      <p style="margin:0;font-size:13px;color:#8B7332;">
        <strong>${d.pendenciasAbertas} pendencias de setup abertas.</strong>
        <a href="https://www.longetividade.com.br/admin/setup" style="color:#3D5A3E;text-decoration:underline;">Ver checklist</a>
      </p>
    </div>` : ""}

    <div style="padding:18px 28px;background:#FAF8F5;border-top:1px solid #F0EDE5;text-align:center;">
      <a href="https://www.longetividade.com.br/admin/dashboard" style="display:inline-block;padding:10px 22px;background:#7A9E7E;color:#ffffff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Abrir Dashboard</a>
    </div>

    <div style="padding:14px 28px;background:#F0EDE5;text-align:center;font-size:11px;color:#888;">
      Maya · Longetividade · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
}
