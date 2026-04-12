// Email de convite VIP — enviado quando admin clica "Dar acesso VIP"
// Contem link pro app + instrucoes de login

const SITE = "https://www.longetividade.com.br";
const APP_LOGIN = `${SITE}/app/login`;

export function buildVipInviteEmail(name: string, email: string): {
  subject: string;
  htmlContent: string;
} {
  const firstName = name.split(" ")[0] || "amiga";

  return {
    subject: `${firstName}, seu acesso VIP esta liberado!`,
    htmlContent: `<!DOCTYPE html>
<html lang="pt-br">
<head><meta charset="UTF-8" /></head>
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">
    <div style="padding:28px;background:linear-gradient(135deg,#639922,#3D5A3E);color:#fff;text-align:center;">
      <div style="font-size:20px;font-weight:800;letter-spacing:0.05em;">Longetividade</div>
      <div style="font-size:12px;opacity:0.85;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">Acesso VIP Liberado</div>
    </div>
    <div style="padding:32px 28px;">
      <h1 style="margin:0 0 18px 0;font-size:26px;font-weight:800;color:#3D5A3E;">
        Parabens, ${firstName}! 🎉
      </h1>
      <p style="font-size:15px;line-height:1.7;color:#2D2D2D;">
        Seu acesso ao <strong>App VIP do Metodo S.E.M</strong> foi liberado. Voce agora tem acesso vitalicio a:
      </p>
      <ul style="padding-left:20px;line-height:1.8;font-size:15px;color:#2D2D2D;">
        <li>Acompanhamento diario de habitos</li>
        <li>Registro de agua, peso e humor</li>
        <li>Desafio 21 Dias completo</li>
        <li>Sistema de conquistas e XP</li>
        <li>30 receitas do Metodo S.E.M</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${APP_LOGIN}" style="display:inline-block;padding:16px 40px;background:#639922;color:#ffffff;border-radius:12px;text-decoration:none;font-size:16px;font-weight:800;box-shadow:0 8px 24px rgba(99,153,34,0.3);">
          Acessar meu App VIP →
        </a>
      </div>
      <div style="background:#F0EDE5;border-radius:10px;padding:16px;margin-top:24px;">
        <p style="margin:0;font-size:14px;color:#2D2D2D;line-height:1.6;">
          <strong>Como entrar:</strong><br/>
          1. Clique no botao acima<br/>
          2. Use o email <strong>${email}</strong> pra fazer login<br/>
          3. Voce pode entrar com Google ou criar uma senha<br/>
          4. Na primeira vez, preencha o onboarding (3 min)
        </p>
      </div>
    </div>
    <div style="padding:18px 28px;background:#F0EDE5;text-align:center;font-size:11px;color:#888;">
      Longetividade · longetividade.com.br · ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`,
  };
}
