# Guia: Publicar na Google Play Store

**Metodo:** TWA (Trusted Web Activity) — empacota a PWA como app Android nativo.
**Tempo:** 30 min pra submeter, 1-7 dias pra aprovacao.
**Custo:** $25 (Google Play Developer account, unico pagamento).

---

## Pre-requisitos

- [x] PWA funcional (longetividade.com.br/app)
- [x] manifest.json completo (name, icons 8 tamanhos, scope, categories)
- [x] HTTPS (Railway deploy)
- [x] Privacy Policy (longetividade.com.br/privacidade)
- [ ] Google Play Developer account ($25)
- [ ] Screenshots do app (5-8)
- [ ] Feature graphic (1024x500)

---

## Passo 1: Criar conta Google Play Developer

1. Abre: https://play.google.com/console/signup
2. Loga com conta Google (dougtudino@gmail.com ou conta da empresa)
3. Paga $25 (unico, nao recorrente)
4. Preenche dados de desenvolvedor:
   - Nome: Longetividade
   - Email: contato@longetividade.com.br
   - Site: https://www.longetividade.com.br
5. Aceita termos → conta criada

## Passo 2: Gerar o app Android via PWABuilder

**Metodo mais rapido — sem codigo:**

1. Abre: https://www.pwabuilder.com/
2. Cola a URL: `https://www.longetividade.com.br/app/home`
3. PWABuilder analisa a PWA e mostra score
4. Clica **"Package for stores"** → **"Android"**
5. Preenche:
   - Package name: `com.longetividade.app`
   - App name: `Longetividade`
   - Version: `1.0.0`
   - Launcher name: `Longetividade`
   - Theme color: `#639922`
   - Background color: `#ffffff`
   - Start URL: `/app/home`
   - Icon URL: `https://www.longetividade.com.br/api/og/pwa-icons?size=512`
6. **Generate** → baixa o ZIP com:
   - `app-release-signed.aab` (Android App Bundle)
   - `assetlinks.json` (Digital Asset Links)
   - `signing.keystore` (chave de assinatura — GUARDAR com seguranca!)

## Passo 3: Configurar Digital Asset Links

O arquivo `assetlinks.json` precisa estar acessivel em:
`https://www.longetividade.com.br/.well-known/assetlinks.json`

1. Copie o conteudo do `assetlinks.json` gerado pelo PWABuilder
2. Crie o arquivo em `public/.well-known/assetlinks.json`
3. Deploy → verifica acessando a URL

Ou: peça pro Claude Code criar o arquivo (eu faço se me mandar o conteudo).

## Passo 4: Criar listing na Play Console

1. Abre: https://play.google.com/console
2. **Create app** → preenche:
   - App name: `Longetividade — Metodo S.E.M`
   - Default language: Portuguese (Brazil)
   - App or game: App
   - Free or paid: Free
3. **Store listing:**
   - Short description (80 chars): `Reeducacao alimentar real. Habitos, agua, peso, humor. Metodo S.E.M.`
   - Full description:
     ```
     Longetividade e o app de acompanhamento do Metodo S.E.M — reeducacao
     alimentar pra mulher com rotina de verdade.

     ✅ Registre seus 10 habitos diarios (3 pilares S.E.M)
     ✅ Acompanhe agua, peso, humor e medidas
     ✅ Desafio 21 Dias com missoes diarias
     ✅ Sistema de conquistas e XP (10 niveis)
     ✅ 30 receitas praticas alinhadas ao metodo
     ✅ Relatorio de progresso visual

     O Metodo S.E.M (Simplicidade, Equilibrio, Movimento) e baseado em
     reeducacao alimentar sem dieta restritiva, sem contar calorias,
     sem culpa.

     Sem assinatura. Acesso vitalicio pra clientes VIP.
     ```
   - Screenshots: 5-8 prints do app (pode tirar do celular)
   - Feature graphic (1024x500): usar /api/og/facebook-cover adaptado
   - App icon (512x512): usar /api/og/pwa-icons?size=512

4. **Content rating:**
   - Preenche o questionario IARC
   - Categoria: Health & Fitness
   - Nao contem violencia, sexual, drogas → rating "Everyone"

5. **Target audience:**
   - Age: 18+ (conteudo de saude)
   - Not designed for children

6. **Privacy policy:**
   - URL: https://www.longetividade.com.br/privacidade

## Passo 5: Upload do AAB

1. **Production** → **Create new release**
2. Upload o `app-release-signed.aab` gerado pelo PWABuilder
3. Release name: `1.0.0`
4. Release notes: `Primeira versao do app Longetividade — Metodo S.E.M`
5. **Review release** → **Start rollout to production**

## Passo 6: Aguardar aprovacao

Google review leva 1-7 dias (primeira submissao pode demorar mais).

Resultado por email:
- ✅ Aprovado → app aparece na Play Store
- ❌ Rejeitado → ajustar conforme feedback e resubmeter

---

## Apos publicacao

- Link da Play Store: `https://play.google.com/store/apps/details?id=com.longetividade.app`
- Adicionar link na:
  - Homepage do site
  - Email de boas-vindas VIP
  - Bio do Instagram
  - Footer do site
- Badge "Disponivel no Google Play" nos materiais

## Atualizacoes futuras

PWA atualiza automaticamente (TWA carrega a versao mais recente do site).
So precisa resubmeter na Play Store se mudar:
- Icone
- Nome do app
- Permissoes Android
- Versao do TWA wrapper

O conteudo do app (telas, features, dados) atualiza via deploy normal
no Railway — sem precisar atualizar na Play Store.
