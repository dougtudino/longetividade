// Templates da sequencia de boas-vindas Brevo (STORY-EMAIL-001)
// 3 emails: D+0 (welcome), D+2 (valor), D+5 (oferta)

const SITE = "https://www.longetividade.com.br";
const PAGE = `${SITE}/emagreca-sem-dieta?utm_source=brevo&utm_medium=email&utm_campaign=welcome`;

function wrap(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7A9E7E,#3D5A3E);color:#fff;text-align:center;">
      <div style="font-size:18px;font-weight:800;letter-spacing:0.05em;">Longetividade</div>
      <div style="font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Método S.E.M</div>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 18px 0;font-size:24px;font-weight:700;color:#3D5A3E;line-height:1.3;">${title}</h1>
      <div style="font-size:15px;line-height:1.7;color:#2D2D2D;">${body}</div>
      <div style="text-align:center;margin:32px 0 12px 0;">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:#7A9E7E;color:#ffffff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;">${ctaText}</a>
      </div>
    </div>
    <div style="padding:18px 28px;background:#F0EDE5;text-align:center;font-size:11px;color:#888;line-height:1.5;">
      Você está recebendo porque se cadastrou em longetividade.com.br<br/>
      Longetividade · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;
}

export type SequenceEmail = { subject: string; html: string };

export function welcomeEmail(name: string | null): SequenceEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";
  return {
    subject: "Bem-vinda ao Método S.E.M!",
    html: wrap(
      `Bem-vinda, ${firstName}!`,
      `
      <p>Que bom ter você por aqui!</p>
      <p>Você acabou de dar o primeiro passo pra parar de brigar com a balança.</p>
      <p>O <strong>Método S.E.M</strong> é diferente de tudo que você já tentou — não tem dieta restritiva, não tem fome, não tem regra impossível de seguir na rotina.</p>
      <p>Nos próximos dias eu vou te mostrar:</p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Por que dieta tradicional <em>não funciona pra mulher</em></li>
        <li>Como reeducar seu paladar em 7 dias</li>
        <li>O passo-a-passo simples pra emagrecer sem sofrer</li>
      </ul>
      <p>Por enquanto, dá uma olhada no método completo:</p>
      `,
      "Conhecer o Método S.E.M",
      PAGE
    ),
  };
}

export function valueEmail(name: string | null): SequenceEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";
  return {
    subject: "A regra das 3 horas (e por que muda tudo)",
    html: wrap(
      `${firstName}, presta atenção nessa dica`,
      `
      <p>Se eu pudesse te dar UMA dica pra emagrecer sem sofrer, seria essa:</p>
      <p style="font-size:18px;color:#3D5A3E;font-weight:700;border-left:4px solid #7A9E7E;padding-left:14px;margin:24px 0;">Coma a cada 3 horas. Sem exceção.</p>
      <p>Parece simples, mas é o oposto do que toda dieta manda fazer.</p>
      <p><strong>Por quê funciona:</strong></p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Mantém seu metabolismo ativo o dia inteiro</li>
        <li>Evita a "fome de leão" que te faz atacar a despensa às 16h</li>
        <li>Estabiliza o açúcar no sangue (menos compulsão)</li>
      </ul>
      <p>Mas atenção: <strong>não é qualquer comida</strong>. Tem que ser combinação certa de proteína + fibra + gordura boa.</p>
      <p>No Método S.E.M eu detalho exatamente o que comer em cada uma dessas refeições — com cardápio de 7 dias e lista de substituições pra você nunca ficar sem opção.</p>
      `,
      "Quero ver o método completo",
      PAGE
    ),
  };
}

export function offerEmail(name: string | null): SequenceEmail {
  const firstName = name?.split(" ")[0] ?? "amiga";
  const offerUrl = `${SITE}/emagreca-sem-dieta?utm_source=brevo&utm_medium=email&utm_campaign=oferta-d5`;
  return {
    subject: `${firstName}, hoje é o último dia da oferta especial`,
    html: wrap(
      `Hoje é o último dia, ${firstName}`,
      `
      <p>Não vou enrolar.</p>
      <p>Você se cadastrou aqui há 5 dias porque quer mudança.</p>
      <p>Eu separei uma condição especial pra quem está na minha lista:</p>
      <div style="background:#FFF8EC;border:2px solid #D4A94B;border-radius:14px;padding:24px;text-align:center;margin:24px 0;">
        <div style="font-size:13px;color:#8B7332;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Método S.E.M completo</div>
        <div style="font-size:48px;font-weight:900;color:#3D5A3E;margin:8px 0;">R$ 37</div>
        <div style="font-size:13px;color:#666;">ou 6x de R$ 6,17 sem juros</div>
      </div>
      <p><strong>O que você leva:</strong></p>
      <ul style="padding-left:20px;line-height:1.8;">
        <li>Ebook completo Método S.E.M</li>
        <li>Plano de 7 dias + cardápio</li>
        <li>Lista de compras + substituições</li>
        <li>Checklist diário imprimível</li>
        <li>10 atalhos de aceleração</li>
      </ul>
      <p>Se hoje você não pode investir R$ 37 em você, não tem problema — vou continuar mandando conteúdo gratuito.</p>
      <p>Mas se você quer começar de verdade, esse é o momento.</p>
      `,
      "Quero começar agora · R$ 37",
      offerUrl
    ),
  };
}
