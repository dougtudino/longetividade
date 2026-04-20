import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// GET /api/admin/docs/blueprints/[file]?download=1
//
// Serve arquivos markdown de docs/blueprints/ pra UI do manual. Whitelist
// explicita pra evitar path traversal. Query param download=1 forca
// Content-Disposition: attachment (senao renderiza inline no browser).

const ALLOWED_FILES = new Set(["launch-template.md", "launch-001.md"]);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ file: string }> }
) {
  const { file } = await ctx.params;
  if (!ALLOWED_FILES.has(file)) {
    return NextResponse.json(
      { ok: false, error: "Arquivo nao permitido" },
      { status: 404 }
    );
  }

  const fullPath = path.join(process.cwd(), "docs", "blueprints", file);
  try {
    const content = await fs.readFile(fullPath, "utf8");
    const download = req.nextUrl.searchParams.get("download") === "1";
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        ...(download
          ? { "Content-Disposition": `attachment; filename="${file}"` }
          : {}),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Nao achei o arquivo: ${(e as Error).message}` },
      { status: 404 }
    );
  }
}
