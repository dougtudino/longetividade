# Guia: Meta App Review — liberar auto-posting

**Objetivo:** Aprovar `pages_manage_posts` + `instagram_content_publish`
no app "Longetividade Admin" pra que Luna poste automaticamente no
Facebook e Instagram sem intervenção manual.

**Tempo estimado:** 5-10 min pra submeter, 1-2 semanas pra aprovação.

---

## Pré-requisitos (já temos)

- [x] App "Longetividade Admin" criado no Meta for Developers
- [x] Marketing API product adicionado
- [x] Privacy Policy URL: https://www.longetividade.com.br/privacidade
- [x] App icon 1024x1024 uploadado
- [x] Categoria e email configurados
- [x] App em modo Live (não Development)

## Passo a passo

### 1. Acessar App Review
- https://developers.facebook.com/apps/ → Longetividade Admin
- Menu lateral: **App Review** → **Permissions and Features**

### 2. Solicitar permissões

Buscar e clicar "Request" em cada uma:

| Permissão | Pra quê |
|---|---|
| `pages_manage_posts` | Postar no Facebook Page automaticamente |
| `pages_read_engagement` | Ler métricas de posts |
| `instagram_basic` | Acessar Instagram Business Account |
| `instagram_content_publish` | Postar no Instagram automaticamente |
| `instagram_manage_insights` | Ler métricas de posts IG |

### 3. Preencher formulário de review

Pra CADA permissão, Meta pede:

**a) Descrição de uso (em inglês):**
```
We use this permission to automatically publish health and wellness 
content to our Facebook Page and Instagram account on behalf of our 
business. Our application generates pre-approved content about 
nutrition, emotional wellbeing, and movement (our "S.E.M Method") 
and publishes it on a scheduled basis. All content is reviewed for 
compliance before publishing. This is for our own business page, 
not third-party pages.
```

**b) Como o usuário interage com a feature:**
```
Our admin team creates and approves content through our internal 
dashboard (admin panel). The approved content is then automatically 
published to our Facebook Page and Instagram Business account at 
optimal times. The admin can also manually publish through the 
dashboard. Only authorized administrators of our business can 
trigger publishing.
```

**c) Screencast/vídeo mostrando o fluxo:**
- Grave um vídeo de 1-2 min mostrando:
  1. Login no admin panel
  2. Abrir /admin/social-media
  3. Ver posts na fila
  4. Aprovar um post
  5. (Simular) postar
- Upload ou link do YouTube (não-listado)
- **Dica:** pode usar Loom (grátis) pra gravar

**d) Privacy Policy URL:**
```
https://www.longetividade.com.br/privacidade
```

### 4. Submeter

- Clica **Submit for Review**
- Meta analisa em 1-5 dias úteis (às vezes até 2 semanas)
- Resultado por email: aprovado ou com feedback

### 5. Após aprovação

1. Gerar novo Page Token com as permissões aprovadas:
   - Graph Explorer → App Longetividade Admin
   - Get User Access Token → marcar TODAS as permissões
   - Trocar pra Page Token
   - Copiar

2. Salvar token:
```js
fetch("/api/admin/settings", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({ SOCIAL_PAGE_TOKEN: "COLE_AQUI" })
}).then(r=>r.json()).then(console.log)
```

3. Descobrir Instagram Account ID:
```
https://www.longetividade.com.br/api/admin/social/discover-ig
```

4. Pronto — Luna auto-posta via cron diário 12h BRT.

---

## Se Meta rejeitar

Motivos comuns e como resolver:

| Motivo | Solução |
|---|---|
| "Insufficient description" | Expandir a descrição com mais detalhes |
| "Need screencast" | Gravar vídeo mostrando o admin panel |
| "Must demonstrate user benefit" | Explicar que é pra proprio negócio, não third-party |
| "Privacy policy incomplete" | A nossa já cobre tudo (LGPD completa) |

Resubmeter após ajustar — Meta permite tentativas ilimitadas.
