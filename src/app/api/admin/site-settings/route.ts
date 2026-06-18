import { NextResponse } from 'next/server'
import { tryCreateSupabaseServerClient } from '@/utils/supabase'
import { requireAdmin } from '@/lib/require-admin'

// Chạy SQL này trong Supabase console lần đầu:
// CREATE TABLE IF NOT EXISTS site_settings (
//   key TEXT PRIMARY KEY,
//   value TEXT NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

export async function GET() {
  const sb = tryCreateSupabaseServerClient()
  // Trả 503 khi chưa cấu hình → client giữ nguyên localStorage, không bị ghi đè
  if (!sb) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const { data, error } = await sb.from('site_settings').select('key, value')
  // Bảng chưa tạo hoặc lỗi DB → trả 503, client giữ localStorage
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 })
  }

  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value

  return NextResponse.json({
    worldcup_theme: map['worldcup_theme'] === 'true',
  })
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const sb = tryCreateSupabaseServerClient()
  if (!sb) {
    return NextResponse.json({ error: 'Supabase chưa được cấu hình' }, { status: 503 })
  }

  const body = await req.json()
  const key = String(body.key ?? '').trim()
  const value = String(body.value ?? '').trim()

  if (!key) {
    return NextResponse.json({ error: 'Thiếu key' }, { status: 400 })
  }

  const { error: dbError } = await sb
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
