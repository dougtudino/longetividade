import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export async function getAppUser(req: NextRequest) {
  const email = req.cookies.get("app_email")?.value;
  if (!email) return null;

  const user = await prisma.appUser.findUnique({ where: { email } });
  return user;
}
