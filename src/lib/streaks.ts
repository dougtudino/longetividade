import { prisma } from "./prisma";

/**
 * Count consecutive days with at least 1 checkin (from today backwards)
 */
export async function getStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (checkins.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Build a Set of date strings for O(1) lookup
  const dateSet = new Set<string>();
  for (const c of checkins) {
    const d = new Date(c.date);
    d.setUTCHours(0, 0, 0, 0);
    dateSet.add(d.toISOString().split("T")[0]);
  }

  // Walk backwards from today
  const cursor = new Date(today);
  // Allow starting from today or yesterday (if user hasn't checked in today yet)
  const todayStr = cursor.toISOString().split("T")[0];
  if (!dateSet.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (dateSet.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Count consecutive days with ALL 10 habits checked
 */
export async function getHabitStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true, habits: true },
  });

  if (checkins.length === 0) return 0;

  // Build map of date -> allHabitsDone
  const perfectDays = new Set<string>();
  for (const c of checkins) {
    const habits = c.habits as Record<string, boolean> | null;
    if (habits) {
      const values = Object.values(habits);
      if (values.length >= 10 && values.every(Boolean)) {
        const d = new Date(c.date);
        d.setUTCHours(0, 0, 0, 0);
        perfectDays.add(d.toISOString().split("T")[0]);
      }
    }
  }

  if (perfectDays.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  const todayStr = cursor.toISOString().split("T")[0];
  if (!perfectDays.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (perfectDays.has(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the longest streak ever for a user
 */
export async function getLongestStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  });

  if (checkins.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < checkins.length; i++) {
    const prev = new Date(checkins[i - 1].date);
    const curr = new Date(checkins[i].date);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diffDays > 1) {
      current = 1;
    }
    // diffDays === 0 means same day, skip
  }

  return longest;
}
