import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Vagas VIP
  await prisma.appVipSlot.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", totalSlots: 100, usedSlots: 0 },
  });
  console.log("✅ AppVipSlot seeded (100 vagas)");

  // Settings Hotmart
  const settings = [
    { key: "HOTMART_WEBHOOK_SECRET", value: "hyOski1wNdfIth7m857yQ3pUwbjb5s1611387" },
    { key: "HOTMART_OFFER_VIP", value: "h84hak4e" },
    { key: "HOTMART_OFFER_COMPLETO", value: "uzvdkzkf" },
    { key: "HOTMART_OFFER_BASICO", value: "zxq5tgew" },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: {}, // nao sobrescreve se ja existir (usuario pode ter mudado pelo admin)
      create: { key: s.key, value: s.value },
    });
  }
  console.log("✅ AppSettings seeded (Hotmart config)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
