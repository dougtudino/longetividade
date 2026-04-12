import { getSetting } from "./settings";

interface SendEmailParams {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({
  to,
  toName,
  subject,
  htmlContent,
}: SendEmailParams): Promise<void> {
  // Prioridade: env Railway > AppSetting (mesmo padrão do META_ACCESS_TOKEN)
  const apiKey = process.env.BREVO_API_KEY || (await getSetting("BREVO_API_KEY"));
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set (nem em env, nem em AppSetting), skipping email send");
    return;
  }

  const senderEmail = process.env.EMAIL_FROM ?? "contato@longetividade.com.br";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "Longetividade",
        email: senderEmail,
      },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error: ${response.status} - ${errorBody}`);
  }
}

export function buildDeliveryEmail(
  customerName: string,
  downloadUrl: string
): { subject: string; htmlContent: string } {
  return {
    subject: "Seu ebook chegou! Aqui esta o Metodo S.E.M",
    htmlContent: `
      <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #3D5A3E; font-size: 24px;">Parabens, ${customerName}!</h1>
        <p style="color: #2D2D2D; font-size: 16px; line-height: 1.7;">
          Seu ebook <strong>"Emagreca sem Dieta"</strong> com o Metodo S.E.M esta pronto para download.
        </p>
        <p style="color: #2D2D2D; font-size: 16px; line-height: 1.7;">
          Clique no botao abaixo para baixar:
        </p>
        <a href="${downloadUrl}"
           style="display: inline-block; background: #7A9E7E; color: #FFFFFF; padding: 16px 32px;
                  border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 24px 0;">
          BAIXAR MEU EBOOK AGORA
        </a>
        <p style="color: #8A8A8A; font-size: 14px; line-height: 1.5;">
          Este link expira em 72 horas e permite ate 3 downloads.<br/>
          Se tiver qualquer duvida, responda este email.
        </p>
        <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 32px 0;" />
        <p style="color: #8A8A8A; font-size: 13px;">
          Emagreca sem Dieta - Metodo S.E.M
        </p>
      </div>
    `,
  };
}
