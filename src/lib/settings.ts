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

export function clearSettingsCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Helper para vars que mudaram de nome — le da chave canonica primeiro,
// fallback para a chave antiga. Usado por META_ACCESS_TOKEN (canonico)
// que tem fallback META_ADS_ACCESS_TOKEN (legado, ja salvo em prod).
export async function getSettingWithFallback(
  canonicalKey: string,
  fallbackKey: string
): Promise<string> {
  const canonical = await getSetting(canonicalKey);
  if (canonical) return canonical;
  return getSetting(fallbackKey);
}
