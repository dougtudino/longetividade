import { NextResponse } from "next/server";
import { getVipSlots } from "@/lib/vip-slots";

export async function GET() {
  const slots = await getVipSlots();
  return NextResponse.json(slots);
}
