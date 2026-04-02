import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.appVipSlot.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", totalSlots: 100, usedSlots: 0 },
  });
  console.log("✅ AppVipSlot seeded (100 vagas)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
