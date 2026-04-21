// src/lib/r2.ts — Cloudflare R2 client (S3-compatible).
// Usado pra upload/delete de imagens da LP (assets + galeria).
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

function requireEnvs() {
  const missing = Object.entries({
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucket,
    R2_PUBLIC_URL: publicUrl,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`[r2] Missing envs: ${missing.join(", ")}`);
  }
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (client) return client;
  requireEnvs();
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
  return client;
}

export async function uploadToR2(params: {
  key: string; // ex: "lp-assets/hero-woman-1713681234.webp"
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<string> {
  requireEnvs();
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000, immutable",
    })
  );
  return `${publicUrl!.replace(/\/$/, "")}/${params.key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  requireEnvs();
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

// Dado uma URL pública do R2, extrai o key pra poder deletar.
// Retorna null se não for URL do nosso bucket.
export function keyFromPublicUrl(url: string): string | null {
  if (!publicUrl) return null;
  const prefix = publicUrl.replace(/\/$/, "") + "/";
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}
