import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== (process.env.ADMIN_SEED_KEY ?? 'LONGETIVIDADE2026')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const output = execSync('npx prisma db push --accept-data-loss --skip-generate', {
      env: { ...process.env },
      encoding: 'utf8',
    })
    return NextResponse.json({ ok: true, output })
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}
