import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade · Longetividade",
  description:
    "Como coletamos, usamos e protegemos seus dados no Longetividade. Em conformidade com a LGPD (Lei 13.709/2018) e o Marco Civil da Internet.",
};

const SECTION_H2: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "#3D5A3E",
  margin: "32px 0 12px 0",
  letterSpacing: "-0.01em",
};

const SECTION_H3: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#2D2D2D",
  margin: "20px 0 8px 0",
};

const P: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: "#2D2D2D",
  margin: "0 0 12px 0",
};

const UL: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.8,
  color: "#2D2D2D",
  paddingLeft: 22,
  margin: "0 0 16px 0",
};

export default function PrivacidadePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F5",
        fontFamily: "'Nunito', Arial, sans-serif",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid rgba(122,158,126,0.15)",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#7A9E7E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              L
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#3D5A3E" }}>
              Longetividade
            </span>
          </Link>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "rgba(45,45,45,0.55)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            &larr; Voltar
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <header style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 24px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#7A9E7E",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          Política de Privacidade
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#3D5A3E",
            margin: "0 0 12px 0",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Como cuidamos dos seus dados
        </h1>
        <p style={{ fontSize: 15, color: "rgba(45,45,45,0.55)", margin: 0 }}>
          Última atualização: <strong>11 de abril de 2026</strong> · Em conformidade com a{" "}
          <strong>LGPD (Lei 13.709/2018)</strong> e o <strong>Marco Civil da Internet</strong>.
        </p>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "16px 24px 64px" }}>
        <p style={P}>
          Esta Política de Privacidade descreve como a <strong>Longetividade</strong> (&ldquo;nós&rdquo;,
          &ldquo;nosso&rdquo;) coleta, utiliza, armazena e protege as informações pessoais dos usuários
          (&ldquo;você&rdquo;) ao acessar o site <code>longetividade.com.br</code>, adquirir nossos
          produtos digitais ou interagir com nossas comunicações.
        </p>

        <p style={P}>
          Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
          Se não concordar, pedimos que não utilize o site.
        </p>

        <h2 style={SECTION_H2}>1. Quem é o controlador dos dados</h2>
        <p style={P}>
          O controlador dos seus dados pessoais é a Longetividade, responsável pelo domínio{" "}
          <code>longetividade.com.br</code>. Para qualquer questão sobre privacidade, entre em
          contato através do e-mail{" "}
          <a href="mailto:contato@longetividade.com.br" style={{ color: "#7A9E7E", fontWeight: 600 }}>
            contato@longetividade.com.br
          </a>
          .
        </p>

        <h2 style={SECTION_H2}>2. Quais dados coletamos</h2>

        <h3 style={SECTION_H3}>2.1 Dados que você fornece diretamente</h3>
        <ul style={UL}>
          <li>
            <strong>Nome, e-mail e telefone</strong> — quando você preenche um formulário de captura
            de lead ou faz uma compra
          </li>
          <li>
            <strong>Dados de pagamento</strong> — processados pela <strong>Hotmart</strong> (nossa
            plataforma de checkout). Não armazenamos informações de cartão de crédito em nossos
            servidores
          </li>
          <li>
            <strong>Dados do perfil VIP</strong> — se você é usuário do App VIP: peso, altura,
            objetivos, check-ins, fotos (todos voluntários)
          </li>
        </ul>

        <h3 style={SECTION_H3}>2.2 Dados coletados automaticamente</h3>
        <ul style={UL}>
          <li>
            <strong>Endereço IP, tipo de dispositivo, navegador, sistema operacional</strong> — para
            análise de tráfego e prevenção de fraude
          </li>
          <li>
            <strong>Páginas visitadas, tempo de permanência, ações realizadas</strong> — via Google
            Analytics 4 e Meta Pixel
          </li>
          <li>
            <strong>Origem da visita (UTM parameters)</strong> — para entender de onde você chegou
            (Instagram, Google, e-mail, etc.)
          </li>
          <li>
            <strong>Eventos de compra e checkout</strong> — para otimização de campanhas publicitárias
          </li>
        </ul>

        <h2 style={SECTION_H2}>3. Como usamos seus dados</h2>
        <p style={P}>Usamos seus dados para as seguintes finalidades legítimas:</p>
        <ul style={UL}>
          <li>
            <strong>Entregar o produto adquirido</strong> — enviar o link de download do ebook,
            liberar acesso ao App VIP, emitir nota fiscal via Hotmart
          </li>
          <li>
            <strong>Comunicação</strong> — enviar e-mails transacionais (confirmação de compra,
            link de download) e comunicação de marketing (apenas com seu consentimento expresso)
          </li>
          <li>
            <strong>Melhoria do serviço</strong> — analisar como os usuários interagem com o site
            para melhorar a experiência
          </li>
          <li>
            <strong>Otimização de campanhas publicitárias</strong> — via Meta Pixel e Google Ads
            para mostrar anúncios mais relevantes
          </li>
          <li>
            <strong>Prevenção de fraude e cumprimento legal</strong> — proteção contra uso indevido
            e cumprimento de obrigações fiscais
          </li>
        </ul>

        <h2 style={SECTION_H2}>4. Base legal (LGPD)</h2>
        <p style={P}>Processamos seus dados com base nas seguintes hipóteses da LGPD (Art. 7):</p>
        <ul style={UL}>
          <li>
            <strong>Execução de contrato</strong> — quando você compra nosso produto (Art. 7, V)
          </li>
          <li>
            <strong>Consentimento</strong> — para envio de e-mails de marketing e captura de
            leads (Art. 7, I)
          </li>
          <li>
            <strong>Legítimo interesse</strong> — para análise de tráfego, prevenção de fraude e
            otimização de anúncios (Art. 7, IX)
          </li>
          <li>
            <strong>Cumprimento de obrigação legal</strong> — emissão de nota fiscal, retenção
            fiscal (Art. 7, II)
          </li>
        </ul>

        <h2 style={SECTION_H2}>5. Com quem compartilhamos seus dados</h2>
        <p style={P}>
          Compartilhamos dados com parceiros estritamente necessários para operação do serviço:
        </p>
        <ul style={UL}>
          <li>
            <strong>Hotmart</strong> — processamento de pagamento e emissão fiscal (
            <a href="https://www.hotmart.com/pt-br/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#7A9E7E" }}>
              política de privacidade Hotmart
            </a>
            )
          </li>
          <li>
            <strong>Brevo (ex-Sendinblue)</strong> — envio de e-mails transacionais e marketing (
            <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer" style={{ color: "#7A9E7E" }}>
              política Brevo
            </a>
            )
          </li>
          <li>
            <strong>Meta (Facebook/Instagram)</strong> — Meta Pixel para otimização de anúncios (
            <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" style={{ color: "#7A9E7E" }}>
              política Meta
            </a>
            )
          </li>
          <li>
            <strong>Google</strong> — Google Analytics 4 para análise de tráfego (
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#7A9E7E" }}>
              política Google
            </a>
            )
          </li>
          <li>
            <strong>Railway</strong> — hospedagem do site e banco de dados (
            <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#7A9E7E" }}>
              política Railway
            </a>
            )
          </li>
        </ul>
        <p style={P}>
          <strong>Não vendemos seus dados</strong> para terceiros sob nenhuma circunstância.
        </p>

        <h2 style={SECTION_H2}>6. Cookies e tecnologias similares</h2>
        <p style={P}>Usamos cookies para:</p>
        <ul style={UL}>
          <li>
            <strong>Cookies essenciais</strong> — sessão de login, carrinho, preferências básicas
            (não podem ser desativados)
          </li>
          <li>
            <strong>Cookies de análise</strong> — Google Analytics 4, para entender como os
            usuários navegam
          </li>
          <li>
            <strong>Cookies de marketing</strong> — Meta Pixel, para personalizar anúncios (pode
            desativar nas configurações do seu navegador)
          </li>
        </ul>
        <p style={P}>
          Você pode gerenciar cookies diretamente nas configurações do seu navegador. A desativação
          de cookies essenciais pode impactar o funcionamento do site.
        </p>

        <h2 style={SECTION_H2}>7. Por quanto tempo guardamos seus dados</h2>
        <ul style={UL}>
          <li>
            <strong>Dados de compra</strong> — pelo prazo legal fiscal (5 anos a partir da
            emissão da nota)
          </li>
          <li>
            <strong>Dados de conta e perfil</strong> — enquanto sua conta estiver ativa, ou até
            você solicitar exclusão
          </li>
          <li>
            <strong>Logs de acesso</strong> — 6 meses (exigência do Marco Civil, Art. 15)
          </li>
          <li>
            <strong>Dados de marketing</strong> — até você solicitar descadastro
          </li>
        </ul>

        <h2 style={SECTION_H2}>8. Seus direitos (LGPD Art. 18)</h2>
        <p style={P}>Como titular dos dados, você tem direito a:</p>
        <ul style={UL}>
          <li>
            <strong>Confirmação e acesso</strong> — saber se processamos seus dados e obter uma
            cópia
          </li>
          <li>
            <strong>Correção</strong> — solicitar correção de dados incompletos, inexatos ou
            desatualizados
          </li>
          <li>
            <strong>Anonimização, bloqueio ou exclusão</strong> — de dados desnecessários ou
            tratados em desconformidade
          </li>
          <li>
            <strong>Portabilidade</strong> — receber seus dados em formato estruturado e legível
          </li>
          <li>
            <strong>Eliminação</strong> — dos dados tratados com base no seu consentimento
          </li>
          <li>
            <strong>Informação sobre compartilhamento</strong> — saber com quem seus dados foram
            compartilhados
          </li>
          <li>
            <strong>Revogação do consentimento</strong> — a qualquer momento, sem custo
          </li>
          <li>
            <strong>Reclamação à ANPD</strong> — Autoridade Nacional de Proteção de Dados
          </li>
        </ul>
        <p style={P}>
          Para exercer qualquer desses direitos, envie um e-mail para{" "}
          <a href="mailto:contato@longetividade.com.br" style={{ color: "#7A9E7E", fontWeight: 600 }}>
            contato@longetividade.com.br
          </a>{" "}
          com o assunto <em>&ldquo;LGPD — Solicitação de Titular&rdquo;</em>. Respondemos em até
          15 dias.
        </p>

        <h2 style={SECTION_H2}>9. Segurança</h2>
        <p style={P}>
          Adotamos medidas técnicas e organizacionais para proteger seus dados: conexões
          criptografadas (HTTPS/TLS), banco de dados com acesso restrito por credenciais, senhas
          armazenadas com hash bcrypt, tokens de acesso com expiração, backup regular e
          monitoramento de acesso. Apesar dessas medidas, nenhum sistema é 100% seguro — em caso
          de incidente de segurança que coloque dados em risco, notificaremos a ANPD e os
          titulares afetados conforme exigido pela LGPD.
        </p>

        <h2 style={SECTION_H2}>10. Transferência internacional</h2>
        <p style={P}>
          Alguns dos nossos provedores (Hotmart, Brevo, Meta, Google, Railway) podem armazenar ou
          processar dados em servidores fora do Brasil. Garantimos que essas transferências
          ocorram apenas para países com nível adequado de proteção de dados, ou mediante
          cláusulas contratuais padrão, conforme Art. 33 da LGPD.
        </p>

        <h2 style={SECTION_H2}>11. Menores de idade</h2>
        <p style={P}>
          Nossos produtos são direcionados a adultos (maiores de 18 anos). Não coletamos
          conscientemente dados de menores sem consentimento dos responsáveis. Se você é pai/mãe
          ou responsável e identificou que seu filho nos forneceu dados sem autorização, entre em
          contato para que possamos removê-los.
        </p>

        <h2 style={SECTION_H2}>12. Alterações nesta política</h2>
        <p style={P}>
          Podemos atualizar esta política de tempos em tempos. A data da última atualização está
          no topo da página. Mudanças significativas serão comunicadas por e-mail aos usuários
          cadastrados.
        </p>

        <h2 style={SECTION_H2}>13. Contato</h2>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(122,158,126,0.25)",
            borderRadius: 12,
            padding: 20,
            margin: "12px 0 24px 0",
          }}
        >
          <p style={{ ...P, margin: 0 }}>
            <strong>Longetividade</strong>
            <br />
            E-mail:{" "}
            <a href="mailto:contato@longetividade.com.br" style={{ color: "#7A9E7E", fontWeight: 600 }}>
              contato@longetividade.com.br
            </a>
            <br />
            Domínio: <code>longetividade.com.br</code>
            <br />
            Responsável pelo tratamento: Longetividade
          </p>
        </div>

        <p style={{ ...P, fontSize: 13, color: "rgba(45,45,45,0.5)", fontStyle: "italic", marginTop: 32 }}>
          Esta política foi elaborada em conformidade com a Lei Geral de Proteção de Dados Pessoais
          (Lei 13.709/2018), o Marco Civil da Internet (Lei 12.965/2014) e o Código de Defesa do
          Consumidor (Lei 8.078/1990).
        </p>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(122,158,126,0.15)",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 12,
            color: "rgba(45,45,45,0.4)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          &larr; Voltar para longetividade.com.br
        </Link>
      </footer>
    </div>
  );
}
