import { NextResponse } from "next/server";
import { getVipSlots } from "@/lib/vip-slots";

export async function GET() {
  try {
    const slots = await getVipSlots();
    return NextResponse.json(slots);
  } catch (error: unknown) {
    console.error("Slots error:", error);
    // Fallback se tabela nao existir ainda
    return NextResponse.json({ total: 100, used: 0, available: 100 });
  }
}
