// Sequencia pos-compra: nurture pra quem JA COMPROU o Metodo S.E.M.
// Objetivo: reduzir refund, aumentar engajamento, preparar pra upsell.
//
// D+1: "Como comecar" — primeiros passos claros
// D+7: "Primeira semana" — checkin + dica de continuidade
// D+21: "Parabens" — celebracao + convite VIP (upsell se nao for VIP)
//
// Controle: campo sequenceStep no Order (reusar ou criar novo campo)
// Na verdade, usamos a tabela Lead com source="buyer-{plan}" OU
// criamos um campo dedicado no Order. Mais simples: criamos Leads
// pra compradores tambem, com source="buyer" e sequenceStep separado.

const SITE = "https://www.longetividade.com.br";
const APP_URL = `${SITE}/app/login`;
const CHECKOUT_VIP = `https://pay.hotmart.com/H105141835Q?off=h84hak4e&utm_source=brevo&utm_medium=email&utm_campaign=upsell-vip`;

function wrap(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#639922,#3D5A3E);color:#fff;text-align:center;">
      <div style="font-size:18px;font-weight:800;letter-spacing:0.05em;">Longetividade</div>
      <div style="font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Metodo S.E.M</div>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 18px 0;font-size:24px;font-weight:700;color:#3D5A3E;line-height:1.3;">${title}</h1>
      <div style="font-size:15px;line-height:1.7;color:#2D2D2D;">${body}</div>
      <div style="text-align:center;margin:32px 0 12px 0;">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:#639922;color:#ffffff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;">${ctaText}</a>
      </div>
    </div>
    <div style="padding:18px 28px;background:#F0EDE5;text-align:center;font-size:11px;color:#888;line-height:1.5;">
      Voce comprou o Metodo S.E.M em longetividade.com.br<br/>
      Longetividade · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
}

export type PostPurchaseEmail = { subject: string; html: string };

// D+1: Como comecar (comprador recebeu ebook ontem)
export function postPurchaseD1(name: string | null, plan: string): PostPurchaseEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";
  const hasApp = plan === "vip";

  return {
    subject: `${firstName}, por onde comecar?`,
    html: wrap(
      `${firstName}, aqui esta seu plano de acao`,
      `
      <p>Ontem voce deu um passo incrivel ao escolher o Metodo S.E.M. Agora vem a parte mais gostosa: <strong>comecar</strong>.</p>
      <p>Seu plano pra hoje (15 minutos):</p>
      <ol style="padding-left:20px;line-height:1.8;">
        <li><strong>Abra o ebook</strong> e leia a Introducao + Capitulo 1 (10 min)</li>
        <li><strong>Imprima o checklist diario</strong> e cole na geladeira</li>
        <li><strong>Escolha 1 habito</strong> pra comecar amanha (ex: beber 8 copos de agua)</li>
      </ol>
      <p>Nao tente mudar tudo de uma vez. <strong>Um habito por vez</strong> e o segredo do S.E.M.</p>
      ${hasApp ? `<p>Como voce e VIP, seu <strong>App de Acompanhamento</strong> ja esta liberado:</p>` : ""}
      `,
      hasApp ? "Abrir meu App VIP" : "Reler meu ebook",
      hasApp ? APP_URL : `${SITE}/api/download?utm_source=brevo&utm_medium=email&utm_campaign=post-purchase-d1`
    ),
  };
}

// D+7: Primeira semana — checkin
export function postPurchaseD7(name: string | null, plan: string): PostPurchaseEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";

  return {
    subject: `1 semana, ${firstName}! Como esta indo?`,
    html: wrap(
      `Uma semana ja, ${firstName}!`,
      `
      <p>Faz 7 dias que voce comecou o Metodo S.E.M. Quero saber: <strong>como esta se sentindo?</strong></p>
      <p>Se voce seguiu pelo menos 1 habito por dia, ja deve ter notado:</p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Menos fome de "leao" a tarde</li>
        <li>Mais disposicao pela manha</li>
        <li>Menos culpa depois de comer</li>
      </ul>
      <p>Se ainda nao comecou — <strong>tudo bem</strong>. Nao existe atraso. O Metodo S.E.M nao tem prazo, tem ritmo. E o ritmo e o <em>seu</em>.</p>
      <p>Dica da semana: <strong>experimente a Regra das 3 Horas</strong> (capitulo 5). Coma a cada 3 horas, mesmo que seja pouco. Seu metabolismo agradece.</p>
      `,
      "Rever o Metodo S.E.M",
      `${SITE}/emagreca-sem-dieta?utm_source=brevo&utm_medium=email&utm_campaign=post-purchase-d7`
    ),
  };
}

// D+21: Parabens + upsell VIP (se nao for VIP)
export function postPurchaseD21(name: string | null, plan: string): PostPurchaseEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";
  const isVip = plan === "vip";

  const upsellBlock = isVip
    ? `<p>Como VIP, voce tem acesso vitalicio ao App. Continue registrando seus habitos — cada check-in te aproxima da <strong>proxima conquista</strong>.</p>`
    : `
      <div style="background:#FFF8EC;border:2px solid #D4A94B;border-radius:14px;padding:20px;text-align:center;margin:24px 0;">
        <div style="font-size:13px;color:#8B7332;font-weight:700;text-transform:uppercase;">Oferta exclusiva pra quem ja esta no metodo</div>
        <div style="font-size:18px;font-weight:800;color:#3D5A3E;margin:10px 0;">Upgrade pro Plano VIP</div>
        <div style="font-size:14px;color:#666;margin-bottom:14px;">App de acompanhamento vitalicio + Desafio 21 Dias + Receitas S.E.M</div>
        <a href="${CHECKOUT_VIP}" style="display:inline-block;padding:12px 28px;background:#D4A94B;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Quero ser VIP →</a>
      </div>
    `;

  return {
    subject: `${firstName}, 21 dias! Voce e incrivel.`,
    html: wrap(
      `21 dias, ${firstName}! 🎉`,
      `
      <p>Tres semanas atras, voce tomou uma decisao. E aqui esta voce — <strong>ainda no jogo</strong>.</p>
      <p>Isso e raro. A maioria das pessoas desiste na primeira semana. Voce nao.</p>
      <p>Independente de quantos quilos perdeu (ou nao), o que importa e:</p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Voce mudou sua <strong>relacao com a comida</strong></li>
        <li>Voce aprendeu a comer <strong>sem culpa</strong></li>
        <li>Voce provou pra si mesma que <strong>consegue</strong></li>
      </ul>
      ${upsellBlock}
      `,
      isVip ? "Abrir meu App VIP" : "Ver Plano VIP",
      isVip ? APP_URL : CHECKOUT_VIP
    ),
  };
}
