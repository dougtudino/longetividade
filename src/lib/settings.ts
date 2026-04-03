import { prisma } from "./prisma";

const cache = new Map<string, { value: string; at: number }>();
const TTL = 60_000; // 1 minuto

export async function getSetting(key: string, fallback?: string): Promise<string> {
  // Cache em memoria
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) {
    return cached.value;
  }

  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (row) {
      cache.set(key, { value: row.value, at: Date.now() });
      return row.value;
    }
  } catch {
    // Tabela pode nao existir ainda
  }

  // Fallback para env var
  const envVal = process.env[key];
  if (envVal) return envVal;

  return fallback ?? "";
}
