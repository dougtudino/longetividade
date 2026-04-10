import * as bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = [
    {
      email: "dougtudino@gmail.com",
      name: "Douglas",
      password: "Z12a45q78()",
      role: "owner",
    },
    {
      email: "babitudino@gmail.com",
      name: "Bárbara",
      password: "babi123",
      role: "manager",
    },
  ];

  for (const u of users) {
    const existing = await prisma.adminUser.findUnique({
      where: { email: u.email },
    });
    if (existing) {
      console.log(`Skipped: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.adminUser.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });
    console.log(`Created: ${u.email} (${u.role})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
