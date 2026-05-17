// Helpers de timezone Brasil (UTC-3, sem horario de verao desde 2019).
//
// IMPORTANTE: o servidor Railway roda em UTC, mas o app eh 100% BR.
// Usar Date().toISOString() ingenuamente causa o bug "caixas marcadas
// no dia seguinte": user marca habito as 22h BR (= 01h UTC do dia +1),
// o checkin eh gravado no dia UTC errado. De manha (11h UTC = 8h BR),
// GET retorna esse checkin como sendo "hoje" porque eh o mesmo dia UTC.
//
// Solucao: tratar tudo como BR. Quem usa estes helpers fica imune ao
// problema. Substituir todas as ocorrencias de
//   new Date().toISOString().split("T")[0]
// por brasilToday() / brasilStartOfDay().

const BR_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3

export function brasilNow(): Date {
  return new Date(Date.now() - BR_OFFSET_MS);
}

// Data hoje em BR, formato "YYYY-MM-DD"
export function brasilToday(): string {
  return brasilNow().toISOString().split("T")[0];
}

// Inicio do dia BR (em Date UTC ajustado pra meia-noite BR).
// Useful pra queries Prisma que filtram por `date >= startOfDay`.
// Note: o Date retornado est'a em UTC mas representa 00:00 BR
// (= 03:00 UTC). Pra Prisma que armazena em UTC, isso bate.
export function brasilStartOfDay(yyyyMmDd?: string): Date {
  const dateStr = yyyyMmDd ?? brasilToday();
  // 00:00 BR = 03:00 UTC do mesmo dia
  return new Date(dateStr + "T03:00:00.000Z");
}

// Fim do dia BR (exclusive: 24h depois do start)
export function brasilEndOfDay(yyyyMmDd?: string): Date {
  const start = brasilStartOfDay(yyyyMmDd);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

// Hora atual no fuso BR (0-23). Usado por notifications-engine pra
// avaliar janelas (11h-12h, 16h-17h, etc).
export function brasilHour(): number {
  return brasilNow().getUTCHours();
}

// Dia da semana BR (0=domingo .. 6=sabado)
export function brasilDayOfWeek(): number {
  return brasilNow().getUTCDay();
}

// Soma N dias a uma data YYYY-MM-DD (BR)
export function brasilAddDays(yyyyMmDd: string, days: number): string {
  const d = brasilStartOfDay(yyyyMmDd);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

// Diferenca em dias entre duas datas (todayBR - otherDate)
export function brasilDaysSince(other: Date | string): number {
  const otherStart = typeof other === "string"
    ? brasilStartOfDay(other)
    : brasilStartOfDay(brasilNow().toISOString().split("T")[0]); // sanitize
  const todayStart = brasilStartOfDay();
  const diffMs = todayStart.getTime() - (typeof other === "string" ? otherStart.getTime() : (other instanceof Date ? other.getTime() : 0));
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}
