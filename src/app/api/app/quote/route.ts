import { NextResponse } from "next/server";
import { QUOTES } from "@/data/quotes";

export async function GET() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % QUOTES.length;
  return NextResponse.json({ quote: QUOTES[index] });
}
