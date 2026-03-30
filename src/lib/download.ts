import { v4 as uuidv4 } from "uuid";

export function generateDownloadToken(): string {
  return uuidv4();
}

export function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 72);
  return expiration;
}

export function isTokenValid(
  tokenExpiresAt: Date | null,
  downloadCount: number,
  maxDownloads: number = 3
): boolean {
  if (!tokenExpiresAt) return false;
  if (new Date() > tokenExpiresAt) return false;
  if (downloadCount >= maxDownloads) return false;
  return true;
}
