// Helpers client-side pra Web Push: registrar SW, pedir permissao,
// subscrever no PushManager e mandar pro backend.

export const VAPID_PUBLIC_KEY =
  "BNO2qkTqtcU1p9EZnmL1GvZ733YLiUDiBw6Z-CfgU2YOOIgOSOVULeVV_HdYqeOJQA8uBAbTI7dRS0iq7f6S6yg";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "denied" | "default" | "error"; detail?: string };

export async function isPushSupported(): Promise<boolean> {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export type PlatformCheck = {
  supported: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean; // app foi instalado e aberto da tela inicial
  isInAppBrowser: boolean; // browser embutido (Instagram, WhatsApp, Facebook)
  reason: "ok" | "ios_needs_install" | "in_app_browser" | "no_pushmanager" | "no_serviceworker" | "unknown";
  suggestion: string;
};

// Diagnostico detalhado pra mostrar mensagem certa pro usuario.
// O motivo mais comum de "nao suporta" no mobile eh iOS Safari sem instalar.
export function checkPushCapability(): PlatformCheck {
  if (typeof window === "undefined") {
    return {
      supported: false, hasServiceWorker: false, hasPushManager: false, hasNotification: false,
      isIOS: false, isAndroid: false, isStandalone: false, isInAppBrowser: false,
      reason: "unknown", suggestion: "",
    };
  }
  const ua = navigator.userAgent;
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasPushManager = "PushManager" in window;
  const hasNotification = "Notification" in window;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const isAndroid = /Android/i.test(ua);
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isInAppBrowser = /(Instagram|FBAN|FBAV|FB_IAB|FBIOS|MicroMessenger|Line\/|TikTok|musical_ly|whatsapp|WhatsApp)/i.test(ua);

  const supported = hasServiceWorker && hasPushManager && hasNotification;

  let reason: PlatformCheck["reason"] = "ok";
  let suggestion = "";

  if (!supported) {
    if (isInAppBrowser) {
      reason = "in_app_browser";
      suggestion =
        "Você abriu o app dentro do Instagram/Facebook/WhatsApp. Esses navegadores não suportam notificações. Toque nos três pontinhos → 'Abrir no navegador' (Safari/Chrome).";
    } else if (isIOS && !isStandalone) {
      reason = "ios_needs_install";
      suggestion =
        "No iPhone, notificações só funcionam com o app instalado na tela inicial. Toque no botão Compartilhar (□↑) do Safari → 'Adicionar à Tela de Início'. Depois abra pelo ícone novo.";
    } else if (!hasPushManager) {
      reason = "no_pushmanager";
      suggestion = "Seu navegador não tem PushManager. Tente Chrome, Edge, Firefox ou Safari 16.4+.";
    } else if (!hasServiceWorker) {
      reason = "no_serviceworker";
      suggestion = "Seu navegador não suporta Service Worker. Atualize ou use Chrome/Edge/Firefox.";
    } else {
      reason = "unknown";
      suggestion = "Notificações não disponíveis nesse contexto.";
    }
  }

  return {
    supported, hasServiceWorker, hasPushManager, hasNotification,
    isIOS, isAndroid, isStandalone, isInAppBrowser,
    reason, suggestion,
  };
}

export async function getCurrentPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!(await isPushSupported())) return "unsupported";
  return Notification.permission;
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!(await isPushSupported())) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/sw.js");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("SW register failed:", e);
    return null;
  }
}

export async function subscribePush(): Promise<SubscribeResult> {
  if (!(await isPushSupported())) return { ok: false, reason: "unsupported" };

  const reg = await ensureServiceWorker();
  if (!reg) return { ok: false, reason: "error", detail: "SW nao registrou" };

  // Permission
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission === "denied") return { ok: false, reason: "denied" };
  if (permission !== "granted") return { ok: false, reason: "default" };

  // Subscribe
  try {
    // Cast pra BufferSource — Uint8Array<ArrayBufferLike> tem incompatibilidade
    // de tipo com BufferSource em algumas versoes do TS lib DOM.
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    // Manda pro backend
    const res = await fetch("/api/app/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth: arrayBufferToBase64(sub.getKey("auth")),
        },
        deviceLabel: navigator.userAgent.slice(0, 200),
      }),
    });
    if (!res.ok) return { ok: false, reason: "error", detail: `backend ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "error", detail: (e as Error).message };
  }
}

export async function unsubscribePush(): Promise<boolean> {
  if (!(await isPushSupported())) return false;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  await fetch(`/api/app/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, {
    method: "DELETE",
  });
  await sub.unsubscribe();
  return true;
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
