import webpush from "web-push";
import { prisma } from "./prisma";
import { brasilHour, brasilStartOfDay } from "./tz";

// Public key vai pro client (NEXT_PUBLIC_VAPID_PUBLIC_KEY) com fallback
// hardcoded porque o Railway/Nixpacks/Turbopack tem bug que NAO injeta
// NEXT_PUBLIC_* no build (memoria do projeto).
export const VAPID_PUBLIC_KEY =
  "BNO2qkTqtcU1p9EZnmL1GvZ733YLiUDiBw6Z-CfgU2YOOIgOSOVULeVV_HdYqeOJQA8uBAbTI7dRS0iq7f6S6yg";

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:contato@longetividade.com.br";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  if (!VAPID_PRIVATE_KEY) {
    console.warn("VAPID_PRIVATE_KEY nao setado — push notifications desabilitadas");
    return false;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export type NotificationCategory = "water" | "challenge" | "cycle" | "weeklyRecap" | "generalMessages";

export type PushPayload = {
  title: string;
  body: string;
  url?: string; // path pra abrir ao clicar (ex: "/app/agua")
  icon?: string;
  tag?: string; // pra agrupar/substituir notifs do mesmo tipo
};

// Envia push pra todas as subscriptions ativas de um user, respeitando
// preferencia da categoria e quietHours. Remove subscriptions invalidas
// automaticamente (410 Gone).
export async function sendPushToUser(
  userId: string,
  category: NotificationCategory,
  payload: PushPayload
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!ensureConfigured()) return { sent: 0, failed: 0, skipped: true };

  // Verifica preferencia da categoria + quiet hours
  const pref = await prisma.appNotificationPref.findUnique({ where: { userId } });
  if (pref) {
    const enabled = pref[category];
    if (!enabled) return { sent: 0, failed: 0, skipped: true };

    if (pref.quietHoursStart != null && pref.quietHoursEnd != null) {
      // brasilHour pra respeitar configuracao da usuaria em hora BR (server eh UTC)
      const nowHour = brasilHour();
      const start = pref.quietHoursStart;
      const end = pref.quietHoursEnd;
      // quiet hours pode atravessar meia-noite (ex: 22h-7h)
      const inQuiet = start < end ? nowHour >= start && nowHour < end : nowHour >= start || nowHour < end;
      if (inQuiet) return { sent: 0, failed: 0, skipped: true };
    }
  }

  const subs = await prisma.appPushSubscription.findMany({
    where: { userId, active: true },
  });

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 } // 1h — push de habito nao faz sentido demorar mais
      );
      sent += 1;
      await prisma.appPushSubscription.update({
        where: { id: sub.id },
        data: { lastUsedAt: new Date() },
      });
    } catch (e: unknown) {
      failed += 1;
      // 404 Not Found e 410 Gone -> subscription expirada, marcar inativa
      const statusCode = (e as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.appPushSubscription.update({
          where: { id: sub.id },
          data: { active: false },
        });
      } else {
        console.error(`Push falhou pra sub ${sub.id}:`, (e as Error).message);
      }
    }
  }

  return { sent, failed, skipped: false };
}

// Helper pra montar quietHours friendly
export function isInQuietHours(
  hour: number,
  start: number | null,
  end: number | null
): boolean {
  if (start == null || end == null) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}
