import { prisma } from "./prisma";

export async function getVipSlots() {
  const slot = await prisma.appVipSlot.findUnique({
    where: { id: "singleton" },
  });
  if (!slot) return { total: 100, used: 0, available: 100 };
  return {
    total: slot.totalSlots,
    used: slot.usedSlots,
    available: slot.totalSlots - slot.usedSlots,
  };
}

export async function claimVipSlot(orderId: string, email: string) {
  const slot = await prisma.appVipSlot.findUnique({
    where: { id: "singleton" },
  });
  if (!slot || slot.usedSlots >= slot.totalSlots) {
    return { claimed: false, remaining: 0 };
  }

  // Verificar se já foi reivindicado
  const existing = await prisma.appUser.findUnique({ where: { orderId } });
  if (existing) {
    return {
      claimed: true,
      remaining: slot.totalSlots - slot.usedSlots,
    };
  }

  // Transação: incrementa slot + cria AppUser
  await prisma.$transaction([
    prisma.appVipSlot.update({
      where: { id: "singleton" },
      data: { usedSlots: { increment: 1 } },
    }),
    prisma.appUser.create({
      data: {
        email,
        orderId,
        plan: "vip",
        accessType: "lifetime",
      },
    }),
  ]);

  return {
    claimed: true,
    remaining: slot.totalSlots - slot.usedSlots - 1,
  };
}
