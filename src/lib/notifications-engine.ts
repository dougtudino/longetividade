import { prisma } from "./prisma";
import { sendPushToUser, type NotificationCategory, type PushPayload } from "./push";
import { brasilHour, brasilDayOfWeek, brasilStartOfDay, brasilEndOfDay } from "./tz";

// ─── Engine de notificacoes personalizadas ─────────────────
// Decide o que mandar pra CADA usuaria individualmente baseado em:
//   • horario atual (janelas por regra)
//   • estado real dela (checkin, agua, mood, peso, ciclo)
//   • preferencia da categoria (pref toggles + quietHours)
//   • anti-spam (nao manda mesma categoria 2x no mesmo dia)
//
// Roda no cron /api/cron/notifications-dispatcher a cada 30min.

type Rule = {
  category: NotificationCategory;
  // Hora local (assumindo TZ unico do servidor — BR UTC-3 por enquanto).
  // Cron precisa rodar dentro da janela pra disparar.
  windowStart: number; // 0-23
  windowEnd: number;   // 0-23 (exclusivo)
  dayOfWeek?: number;  // 0=Domingo, 1=Segunda, ..., 6=Sabado. undefined = todo dia
  evaluate: (ctx: UserContext) => PushPayload | null;
};

export type UserContext = {
  userId: string;
  firstName: string;
  brotoName: string; // nome do Broto (default "Broto") — usado nas microcopies
  daysSinceLastActivity: number; // dias desde qualquer atividade — pra regra "saudoso"
  hour: number; // hora atual (server)
  waterCountToday: number;
  habitsDoneToday: number;
  hasMoodToday: boolean;
  daysSinceLastWeight: number | null;
  cycle: { id: string; cycleNumber: number; status: string; daysCompleted: number } | null;
  weekSummary: { habitsPercent: number; checkinDays: number; weightLost: number | null } | null;
};

// Saudacao por horario
function timePrefix(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// ─── Regras ────────────────────────────────────────────────
const RULES: Rule[] = [
  // Agua manha: 11h-12h se < 3 copos
  {
    category: "water",
    windowStart: 11,
    windowEnd: 12,
    evaluate: (c) =>
      c.waterCountToday < 3
        ? {
            title: `${timePrefix(c.hour)}, ${c.firstName} 💧`,
            body: `Você bebeu ${c.waterCountToday} de 8 copos hoje. Que tal mais um agora?`,
            url: "/app/home",
            tag: "water-morning",
          }
        : null,
  },
  // Agua tarde: 16h-17h se < 6 copos
  {
    category: "water",
    windowStart: 16,
    windowEnd: 17,
    evaluate: (c) =>
      c.waterCountToday < 6
        ? {
            title: `${c.firstName}, ainda dá tempo 💧`,
            body: `Faltam ${Math.max(1, 8 - c.waterCountToday)} copos pra meta de hoje. Você consegue!`,
            url: "/app/home",
            tag: "water-afternoon",
          }
        : null,
  },
  // Humor noite: 19h-20h se ainda nao registrou
  {
    category: "generalMessages",
    windowStart: 19,
    windowEnd: 20,
    evaluate: (c) =>
      !c.hasMoodToday
        ? {
            title: `Como foi seu dia, ${c.firstName}? 💚`,
            body: "Toca aqui e registra seu humor — 3 segundos pra se conhecer melhor.",
            url: "/app/home",
            tag: "mood-evening",
          }
        : null,
  },
  // Desafio noite: 20h-21h se ciclo ativo e ainda nao fechou 5+ habitos hoje
  {
    category: "challenge",
    windowStart: 20,
    windowEnd: 21,
    evaluate: (c) =>
      c.cycle && c.cycle.status === "active" && c.habitsDoneToday < 5
        ? {
            title: `${c.firstName}, você ainda pode fechar o dia 🎯`,
            body: `Marcou ${c.habitsDoneToday} de 5 hábitos. Faltam ${5 - c.habitsDoneToday} pra ${c.cycle.cycleNumber > 1 ? "manter o" : "começar o"} ciclo.`,
            url: "/app/home",
            tag: "challenge-evening",
          }
        : null,
  },
  // Peso semanal: segunda 9h-10h se ultima pesagem > 7d
  {
    category: "weeklyRecap",
    windowStart: 9,
    windowEnd: 10,
    dayOfWeek: 1, // segunda
    evaluate: (c) =>
      c.daysSinceLastWeight === null || c.daysSinceLastWeight >= 7
        ? {
            title: `Segunda-feira, ${c.firstName} ⚖️`,
            body: "Hora da pesagem semanal — uma referência pra entender sua evolução.",
            url: "/app/home",
            tag: "weight-monday",
          }
        : null,
  },
  // Broto saudoso: 9h-11h se ausente 3+ dias.
  // Categoria generalMessages (toggle de "mensagens motivacionais" controla
  // se a usuaria quer receber). Tom acolhedor, sem cobrar.
  // Anti-spam: dedup pela categoria — so manda uma vez por dia.
  {
    category: "generalMessages",
    windowStart: 9,
    windowEnd: 11,
    evaluate: (c) =>
      c.daysSinceLastActivity >= 3
        ? {
            title: `${c.brotoName} sentiu sua falta 🌱`,
            body: `Que bom te ver de volta, ${c.firstName}. Sem pressão — só apareceu já é cuidado.`,
            url: "/app/home",
            tag: "broto-saudoso",
          }
        : null,
  },
  // Broto bom dia: 7h-9h se ja apareceu nos ultimos 2 dias (ativa) — saudacao
  // diaria amorosa. Frequente mas leve. So uma vez ao dia via dedup.
  {
    category: "generalMessages",
    windowStart: 7,
    windowEnd: 9,
    evaluate: (c) =>
      c.daysSinceLastActivity <= 2
        ? {
            title: `${c.brotoName} acordou 🌱`,
            body: `${timePrefix(c.hour)}, ${c.firstName}. Que bom passar mais um dia com você 💚`,
            url: "/app/home",
            tag: "broto-bom-dia",
          }
        : null,
  },
  // Recap semanal: domingo 10h-11h
  {
    category: "weeklyRecap",
    windowStart: 10,
    windowEnd: 11,
    dayOfWeek: 0, // domingo
    evaluate: (c) => {
      const w = c.weekSummary;
      if (!w) return null;
      const parts: string[] = [];
      parts.push(`${w.habitsPercent}% hábitos`);
      parts.push(`${w.checkinDays} dias`);
      if (w.weightLost != null && w.weightLost > 0) {
        parts.push(`−${w.weightLost.toFixed(1)}kg`);
      }
      return {
        title: `Sua semana, ${c.firstName} 📊`,
        body: parts.join(" · ") + ". Toque pra ver tudo.",
        url: "/app/jornada",
        tag: "weekly-recap",
      };
    },
  },
];

// Verifica se ja enviou essa categoria hoje (em BR, nao UTC)
async function alreadySentToday(userId: string, category: string): Promise<boolean> {
  const count = await prisma.appNotificationLog.count({
    where: { userId, category, sentAt: { gte: brasilStartOfDay() } },
  });
  return count > 0;
}

// Constroi contexto da usuaria pra avaliar regras
async function buildContext(userId: string, hour: number): Promise<UserContext | null> {
  const profile = await prisma.appProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  // Tudo em BR — servidor Railway eh UTC mas o app eh 100% BR
  const today = brasilStartOfDay();
  const todayEnd = brasilEndOfDay();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [checkin, moodToday, lastWeight, cycle, weekCheckins, lastCheckin, lastWaterLog, lastMoodLog] = await Promise.all([
    prisma.appCheckin.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.appMoodLog.findFirst({
      where: { userId, loggedAt: { gte: today, lt: todayEnd } },
    }),
    prisma.appWeightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.appCycle.findFirst({
      where: { userId, status: { in: ["active", "paused"] } },
      orderBy: { cycleNumber: "desc" },
    }),
    prisma.appCheckin.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      select: { habits: true, exerciseDone: true },
    }),
    prisma.appCheckin.findFirst({ where: { userId }, orderBy: { date: "desc" }, select: { date: true } }),
    prisma.appWaterLog.findFirst({ where: { userId }, orderBy: { loggedAt: "desc" }, select: { loggedAt: true } }),
    prisma.appMoodLog.findFirst({ where: { userId }, orderBy: { loggedAt: "desc" }, select: { loggedAt: true } }),
  ]);

  // daysSinceLastActivity: pega max das datas (checkin/water/mood) e calcula
  // diferenca em dias BR. Usado pela regra "saudoso" do Broto.
  const activityDates = [
    lastCheckin?.date,
    lastWaterLog?.loggedAt,
    lastMoodLog?.loggedAt,
    lastWeight?.loggedAt,
  ].filter(Boolean) as Date[];
  const daysSinceLastActivity =
    activityDates.length === 0
      ? 999
      : Math.max(
          0,
          Math.floor(
            (today.getTime() - Math.max(...activityDates.map((d) => d.getTime()))) /
              (1000 * 60 * 60 * 24),
          ),
        );

  const habits = (checkin?.habits ?? {}) as Record<string, boolean>;
  const habitsDoneToday = Object.values(habits).filter(Boolean).length;
  const waterCountToday = checkin?.waterCount ?? 0;
  const daysSinceLastWeight = lastWeight
    ? Math.floor((Date.now() - new Date(lastWeight.loggedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Week summary
  let weekSummary: UserContext["weekSummary"] = null;
  if (weekCheckins.length > 0) {
    let totalPct = 0;
    for (const c of weekCheckins) {
      const h = (c.habits ?? {}) as Record<string, boolean>;
      const total = Object.keys(h).length || 10;
      const done = Object.values(h).filter(Boolean).length;
      totalPct += total > 0 ? (done / total) * 100 : 0;
    }
    const habitsPercent = Math.round(totalPct / weekCheckins.length);
    weekSummary = {
      habitsPercent,
      checkinDays: weekCheckins.length,
      weightLost: null, // requereria queries adicionais; deixar null por enquanto
    };
  }

  return {
    userId,
    firstName: profile.name?.split(" ")[0] ?? "amiga",
    brotoName: (profile as { brotoName?: string }).brotoName?.trim() || "Broto",
    daysSinceLastActivity,
    hour,
    waterCountToday,
    habitsDoneToday,
    hasMoodToday: !!moodToday,
    daysSinceLastWeight,
    cycle: cycle
      ? {
          id: cycle.id,
          cycleNumber: cycle.cycleNumber,
          status: cycle.status,
          daysCompleted: cycle.daysCompleted,
        }
      : null,
    weekSummary,
  };
}

// Roda regras pra UMA usuaria. Retorna lista de pushes enviados.
export async function evaluateAndSendUserNotifications(userId: string): Promise<{
  sent: number;
  rules: Array<{ category: string; tag: string }>;
}> {
  // Hora e dia da semana em BR (servidor eh UTC)
  const hour = brasilHour();
  const dayOfWeek = brasilDayOfWeek();

  const ctx = await buildContext(userId, hour);
  if (!ctx) return { sent: 0, rules: [] };

  const sent: Array<{ category: string; tag: string }> = [];

  for (const rule of RULES) {
    // Janela de horario
    if (hour < rule.windowStart || hour >= rule.windowEnd) continue;
    // Dia da semana (se especificado)
    if (rule.dayOfWeek !== undefined && dayOfWeek !== rule.dayOfWeek) continue;

    const payload = rule.evaluate(ctx);
    if (!payload) continue;

    // Anti-spam por categoria+tag — combina pra permitir agua-manha + agua-tarde
    const dedupKey = `${rule.category}:${payload.tag ?? rule.category}`;
    if (await alreadySentToday(userId, dedupKey)) continue;

    const result = await sendPushToUser(userId, rule.category, payload);
    if (result.sent > 0) {
      await prisma.appNotificationLog.create({
        data: { userId, category: dedupKey },
      });
      sent.push({ category: rule.category, tag: payload.tag ?? rule.category });
    }
  }

  return { sent: sent.length, rules: sent };
}

// Dispara avaliacao pra TODOS users com subscription ativa.
// Chamado pelo cron a cada 30min.
export async function runDispatcher(): Promise<{
  evaluated: number;
  totalSent: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const usersWithSubs = await prisma.appUser.findMany({
    where: {
      pushSubscriptions: { some: { active: true } },
      notificationPrefs: { isNot: null },
    },
    select: { id: true },
  });

  let totalSent = 0;
  const errors: Array<{ userId: string; error: string }> = [];

  for (const u of usersWithSubs) {
    try {
      const result = await evaluateAndSendUserNotifications(u.id);
      totalSent += result.sent;
    } catch (e) {
      errors.push({ userId: u.id, error: (e as Error).message });
    }
  }

  return { evaluated: usersWithSubs.length, totalSent, errors };
}
