import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenValid } from "@/lib/download";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/link-expirado", request.url)
      );
    }

    const order = await prisma.order.findUnique({
      where: { downloadToken: token },
    });

    if (!order) {
      return NextResponse.redirect(
        new URL("/link-expirado", request.url)
      );
    }

    if (!isTokenValid(order.tokenExpiresAt, order.downloadCount)) {
      return NextResponse.redirect(
        new URL("/link-expirado", request.url)
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { downloadCount: order.downloadCount + 1 },
    });

    const ebookPath = path.join(
      process.cwd(),
      "storage",
      "ebooks",
      "ebook.pdf"
    );

    try {
      const fileBuffer = await readFile(ebookPath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="emagreca-sem-dieta.pdf"',
          "Cache-Control": "no-store",
        },
      });
    } catch {
      console.error("PDF file not found at:", ebookPath);
      return NextResponse.json(
        { error: "Arquivo nao encontrado. Entre em contato com o suporte." },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error("Download error:", error);
    return NextResponse.redirect(
      new URL("/link-expirado", request.url)
    );
  }
}
