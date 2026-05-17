// Service Worker pro Web Push do app "21 Dias" (by Longetividade).
// Eventos:
//  - push: exibe a notificacao recebida
//  - notificationclick: abre o app na URL passada no payload

self.addEventListener("install", (event) => {
  // Ativa imediatamente sem aguardar a aba ser fechada
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "21 Dias", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "21 Dias";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "longetividade",
    data: { url: data.url || "/app/home" },
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app/home";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Se ja existe uma aba aberta do app, focar nela e navegar
        for (const client of clientList) {
          if (client.url.includes("/app") && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Senao, abrir nova
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});
