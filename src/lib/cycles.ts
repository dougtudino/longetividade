import { prisma } from "./prisma";

export const CYCLE_LENGTH_DAYS = 21;

export type CycleStatus = "active" | "paused" | "completed" | "abandoned";
export type CycleDifficulty = "easy" | "normal" | "hard";

export type CycleSummary = {
  id: string;
  cycleNumber: number;
  difficulty: CycleDifficulty;
  status: CycleStatus;
  startDate: Date;
  endDate: Date | null;
  daysCompleted: number;
  daysRemaining: number;
  percent: number;
  pausedAt: Date | null;
  resumedAt: Date | null;
  completedAt: Date | null;
};

function toSummary(c: {
  id: string;
  cycleNumber: number;
  difficulty?: string | null;
  status: string;
  startDate: Date;
  endDate: Date | null;
  daysCompleted: number;
  pausedAt: Date | null;
  resumedAt: Date | null;
  completedAt: Date | null;
}): CycleSummary {
  const diff = (c.difficulty ?? "normal") as CycleDifficulty;
  return {
    id: c.id,
    cycleNumber: c.cycleNumber,
    difficulty: ["easy", "normal", "hard"].includes(diff) ? diff : "normal",
    status: c.status as CycleStatus,
    startDate: c.startDate,
    endDate: c.endDate,
    daysCompleted: c.daysCompleted,
    daysRemaining: Math.max(0, CYCLE_LENGTH_DAYS - c.daysCompleted),
    percent: Math.min(100, Math.round((c.daysCompleted / CYCLE_LENGTH_DAYS) * 100)),
    pausedAt: c.pausedAt,
    resumedAt: c.resumedAt,
    completedAt: c.completedAt,
  };
}

// Sugere dificuldade pro proximo ciclo baseado em historico:
// - Sem ciclos: easy (primeira jornada, foco em criar habito)
// - Ultimo concluido em easy: sugere normal (subir 1 degrau)
// - Ultimo concluido em normal: sugere hard
// - Ultimo concluido em hard: sugere hard (mestria)
// - Ultimo pausado/incompleto: sugere mesma dificuldade (consolidar)
export async function suggestNextDifficulty(userId: string): Promise<CycleDifficulty> {
  const last = await prisma.appCycle.findFirst({
    where: { userId },
    orderBy: { cycleNumber: "desc" },
  });
  if (!last) return "easy";
  const lastDiff = ((last.difficulty ?? "normal") as CycleDifficulty);
  if (last.status !== "completed") return lastDiff; // consolida o mesmo
  if (lastDiff === "easy") return "normal";
  if (lastDiff === "normal") return "hard";
  return "hard"; // mestria continua hard
}

// Garante que o user tem um ciclo "vivo" (active ou paused) e migra
// AppChallenge antigos (sem cycleId) pro Ciclo 1 retroativo.
//
// Retorna o ciclo vivo se existir, ou null se o user precisa decidir
// (caso: ciclo 21 completed sem novo iniciado).
export async function ensureActiveCycle(userId: string) {
  // Existe algum cycle pro user?
  const existing = await prisma.appCycle.findFirst({
    where: { userId, status: { in: ["active", "paused"] } },
    orderBy: { cycleNumber: "desc" },
  });

  if (existing) {
    await backfillLegacyChallenges(userId, existing.id);
    return existing;
  }

  // Tem algum cycle completed? entao user precisa decidir comecar o proximo
  const lastCompleted = await prisma.appCycle.findFirst({
    where: { userId, status: "completed" },
    orderBy: { cycleNumber: "desc" },
  });
  if (lastCompleted) return null;

  // Primeiro acesso pos-feature OU user antigo com AppChallenge sem cycleId.
  // Cria Cycle 1 retroativo: startDate = data do primeiro challenge se existir.
  const firstChallenge = await prisma.appChallenge.findFirst({
    where: { userId },
    orderBy: { completedAt: "asc" },
  });

  const legacyCount = await prisma.appChallenge.count({
    where: { userId, cycleId: null },
  });

  const startDate = firstChallenge?.completedAt ?? new Date();
  const newCycle = await prisma.appCycle.create({
    data: {
      userId,
      cycleNumber: 1,
      difficulty: "easy", // Ciclo 1 retroativo eh sempre easy (entrada gentil)
      startDate,
      status: legacyCount >= CYCLE_LENGTH_DAYS ? "completed" : "active",
      daysCompleted: Math.min(CYCLE_LENGTH_DAYS, legacyCount),
      completedAt: legacyCount >= CYCLE_LENGTH_DAYS ? new Date() : null,
    },
  });

  await backfillLegacyChallenges(userId, newCycle.id);

  // Se Cycle 1 retroativo ja foi completed, retorna null (user decide proximo)
  return newCycle.status === "completed" ? null : newCycle;
}

// Aponta AppChallenge legados (cycleId=null) pro ciclo informado.
// Idempotente: se ja foi migrado nao mexe.
async function backfillLegacyChallenges(userId: string, cycleId: string) {
  await prisma.appChallenge.updateMany({
    where: { userId, cycleId: null },
    data: { cycleId },
  });
}

// Marca um dia (1..21) como completo no ciclo ativo. Auto-completa o ciclo
// quando atinge 21. Retorna info pra UI (dia novo, ciclo, se acabou de
// terminar).
export async function markDayCompleted(userId: string, day: number) {
  if (day < 1 || day > CYCLE_LENGTH_DAYS) {
    throw new Error(`Dia invalido: ${day} (esperado 1..${CYCLE_LENGTH_DAYS})`);
  }

  const cycle = await ensureActiveCycle(userId);
  if (!cycle) {
    throw new Error(
      "Voce nao tem ciclo ativo. Comece um novo ciclo via POST /api/app/cycles/start."
    );
  }
  if (cycle.status === "paused") {
    throw new Error("Ciclo pausado. Retome antes de marcar dias.");
  }

  // Ja marcou esse dia?
  const already = await prisma.appChallenge.findFirst({
    where: { userId, cycleId: cycle.id, day },
  });
  if (already) {
    return { alreadyDone: true, day, cycle: toSummary(cycle), justCompleted: false };
  }

  await prisma.appChallenge.create({
    data: { userId, cycleId: cycle.id, day },
  });

  const newCount = cycle.daysCompleted + 1;
  const justCompleted = newCount >= CYCLE_LENGTH_DAYS;

  const updated = await prisma.appCycle.update({
    where: { id: cycle.id },
    data: {
      daysCompleted: newCount,
      status: justCompleted ? "completed" : cycle.status,
      completedAt: justCompleted ? new Date() : cycle.completedAt,
      endDate: justCompleted ? new Date() : cycle.endDate,
    },
  });

  return {
    alreadyDone: false,
    day,
    cycle: toSummary(updated),
    justCompleted,
  };
}

export async function pauseCycle(userId: string) {
  const cycle = await prisma.appCycle.findFirst({
    where: { userId, status: "active" },
    orderBy: { cycleNumber: "desc" },
  });
  if (!cycle) throw new Error("Nenhum ciclo ativo pra pausar.");
  const updated = await prisma.appCycle.update({
    where: { id: cycle.id },
    data: { status: "paused", pausedAt: new Date() },
  });
  return toSummary(updated);
}

export async function resumeCycle(userId: string) {
  const cycle = await prisma.appCycle.findFirst({
    where: { userId, status: "paused" },
    orderBy: { cycleNumber: "desc" },
  });
  if (!cycle) throw new Error("Nenhum ciclo pausado pra retomar.");
  const updated = await prisma.appCycle.update({
    where: { id: cycle.id },
    data: { status: "active", resumedAt: new Date() },
  });
  return toSummary(updated);
}

// Abandona ciclo ativo/pausado e cria um novo zerado.
// Mantem mesma difficulty por default (pessoa quer recomecar do zero
// pra consolidar), mas pode passar uma nova explicita.
export async function resetCycle(userId: string, newDifficulty?: CycleDifficulty) {
  const current = await prisma.appCycle.findFirst({
    where: { userId, status: { in: ["active", "paused"] } },
    orderBy: { cycleNumber: "desc" },
  });
  if (!current) {
    // Sem ciclo ativo — apenas comeca um novo
    return startNewCycle(userId, newDifficulty);
  }
  const inheritDifficulty = (current.difficulty as CycleDifficulty) ?? "normal";
  const chosen = newDifficulty ?? inheritDifficulty;

  // Marca atual como abandoned (preserva historico, nao apaga challenges)
  await prisma.appCycle.update({
    where: { id: current.id },
    data: { status: "abandoned", endDate: new Date() },
  });

  // Cria novo logo apos (cycleNumber + 1)
  const created = await prisma.appCycle.create({
    data: {
      userId,
      cycleNumber: current.cycleNumber + 1,
      difficulty: chosen,
      startDate: new Date(),
      status: "active",
    },
  });
  return toSummary(created);
}

// Comeca o proximo ciclo (cycleNumber = max+1). Exige que nao haja ciclo
// active/paused pendente. Se difficulty nao passada, usa suggestNextDifficulty.
export async function startNewCycle(userId: string, difficulty?: CycleDifficulty) {
  const blocking = await prisma.appCycle.findFirst({
    where: { userId, status: { in: ["active", "paused"] } },
  });
  if (blocking) {
    throw new Error(
      `Voce ainda tem o Ciclo ${blocking.cycleNumber} ${blocking.status}. Conclua ou pause antes.`
    );
  }

  const last = await prisma.appCycle.findFirst({
    where: { userId },
    orderBy: { cycleNumber: "desc" },
  });
  const nextNumber = (last?.cycleNumber ?? 0) + 1;
  const chosen: CycleDifficulty =
    difficulty && ["easy", "normal", "hard"].includes(difficulty)
      ? difficulty
      : await suggestNextDifficulty(userId);

  const created = await prisma.appCycle.create({
    data: {
      userId,
      cycleNumber: nextNumber,
      difficulty: chosen,
      startDate: new Date(),
      status: "active",
    },
  });
  return toSummary(created);
}

export async function listCycles(userId: string): Promise<CycleSummary[]> {
  // Garante backfill antes de listar
  await ensureActiveCycle(userId);
  const cycles = await prisma.appCycle.findMany({
    where: { userId },
    orderBy: { cycleNumber: "desc" },
  });
  return cycles.map(toSummary);
}

export async function getCurrentCycle(userId: string): Promise<CycleSummary | null> {
  const cycle = await ensureActiveCycle(userId);
  return cycle ? toSummary(cycle) : null;
}

// Retorna stats agregadas: total de ciclos completados, em andamento, etc.
export async function getCycleStats(userId: string) {
  const all = await prisma.appCycle.findMany({
    where: { userId },
    select: { status: true, daysCompleted: true, cycleNumber: true },
  });
  return {
    totalCycles: all.length,
    completedCycles: all.filter((c) => c.status === "completed").length,
    activeCycles: all.filter((c) => c.status === "active").length,
    pausedCycles: all.filter((c) => c.status === "paused").length,
    totalDaysCompleted: all.reduce((s, c) => s + c.daysCompleted, 0),
    highestCycleNumber: all.reduce((m, c) => Math.max(m, c.cycleNumber), 0),
  };
}
