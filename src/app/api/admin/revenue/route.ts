import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from '@/utils/supabase'
import { buildRevenueReport } from '@/lib/revenue-report-stats'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const configErr = getSupabaseAdminConfigError()
  if (configErr) return NextResponse.json({ error: configErr }, { status: 503 })

  const supabase = tryCreateSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })

  try {
    const report = await buildRevenueReport(supabase)
    return NextResponse.json(report)
  } catch (err) {
    console.error('revenue report error', err)
    return NextResponse.json({ error: 'Không tạo được báo cáo doanh thu' }, { status: 500 })
  }
}
