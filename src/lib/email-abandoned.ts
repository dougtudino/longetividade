// Templates de email pra recuperacao de carrinho abandonado.
// Disparam via /api/cron/abandoned-cart baseado na tabela AbandonedCheckout.
//
// Sequencia:
//   Email 1 (30min apos abandono): lembrete gentil
//   Email 2 (24h apos abandono): urgencia + beneficios

const SITE = "https://www.longetividade.com.br";
const SALES_PAGE = `${SITE}/emagreca-sem-dieta?utm_source=brevo&utm_medium=email&utm_campaign=abandoned-cart`;
const CHECKOUT = `https://pay.hotmart.com/H105141835Q?off=zxq5tgew&utm_source=brevo&utm_medium=email&utm_campaign=abandoned-cart`;

function wrap(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#D4A94B,#8B7332);color:#fff;text-align:center;">
      <div style="font-size:18px;font-weight:800;letter-spacing:0.05em;">Longetividade</div>
      <div style="font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Metodo S.E.M</div>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 18px 0;font-size:24px;font-weight:700;color:#3D5A3E;line-height:1.3;">${title}</h1>
      <div style="font-size:15px;line-height:1.7;color:#2D2D2D;">${body}</div>
      <div style="text-align:center;margin:32px 0 12px 0;">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:#D4A94B;color:#ffffff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;">${ctaText}</a>
      </div>
    </div>
    <div style="padding:18px 28px;background:#F0EDE5;text-align:center;font-size:11px;color:#888;line-height:1.5;">
      Voce recebeu porque iniciou uma compra em longetividade.com.br<br/>
      Longetividade · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
}

export type AbandonedEmail = { subject: string; html: string };

export function abandonedEmail30min(email: string): AbandonedEmail {
  const name = email.split("@")[0];
  return {
    subject: "Voce esqueceu algo...",
    html: wrap(
      `${name}, voce deixou algo pra tras`,
      `
      <p>Notei que voce comecou a conhecer o <strong>Metodo S.E.M</strong> mas nao finalizou.</p>
      <p>Sem problemas — as vezes a vida interrompe. Mas queria te lembrar que seu acesso esta guardado:</p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Ebook completo do Metodo S.E.M</li>
        <li>Plano de 7 dias + cardapio</li>
        <li>Lista de compras + checklist diario</li>
      </ul>
      <p>Tudo isso por <strong>R$ 37</strong> (ou 6x de R$ 6,17).</p>
      <p>Se tiver alguma duvida, responda esse email que eu ajudo.</p>
      `,
      "Finalizar minha compra →",
      CHECKOUT
    ),
  };
}

export function abandonedEmail24h(email: string): AbandonedEmail {
  const name = email.split("@")[0];
  return {
    subject: `${name}, sua vaga ainda esta aberta`,
    html: wrap(
      `Sua vaga esta aberta — mas por pouco tempo`,
      `
      <p>Ontem voce demonstrou interesse no <strong>Metodo S.E.M</strong> e eu quero te ajudar a dar esse passo.</p>
      <p>Vou ser direta: <strong>o que te impediu de finalizar?</strong></p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li><strong>"E caro?"</strong> — Sao R$ 37, menos que um delivery. E o investimento mais barato que voce vai fazer na sua saude.</li>
        <li><strong>"Sera que funciona?"</strong> — Garantia de 7 dias. Se nao gostar, devolvemos 100% sem perguntas.</li>
        <li><strong>"Nao tenho tempo"</strong> — O metodo foi feito pra mulher com rotina corrida. 15 minutos por dia.</li>
      </ul>
      <div style="background:#FFF8EC;border:2px solid #D4A94B;border-radius:14px;padding:20px;text-align:center;margin:24px 0;">
        <div style="font-size:13px;color:#8B7332;font-weight:700;text-transform:uppercase;">Metodo S.E.M completo</div>
        <div style="font-size:42px;font-weight:900;color:#3D5A3E;margin:8px 0;">R$ 37</div>
        <div style="font-size:13px;color:#666;">Garantia 7 dias · Acesso imediato</div>
      </div>
      `,
      "Quero comecar agora →",
      CHECKOUT
    ),
  };
}
