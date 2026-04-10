import bcrypt from "bcryptjs";

export {
  signAdminToken,
  verifyAdminToken,
  ADMIN_TOKEN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
} from "./admin-token";
export type { AdminTokenPayload } from "./admin-token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
