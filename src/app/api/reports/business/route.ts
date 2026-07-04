import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from '@/utils/supabase'
import { buildBusinessReport } from '@/lib/business-report-stats'
import { getActiveSubscription } from '@/lib/plan-quota'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configErr = getSupabaseAdminConfigError()
  if (configErr) {
    return NextResponse.json({ error: configErr }, { status: 503 })
  }

  const supabase = tryCreateSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })
  }

  if (session.user.role !== 'admin') {
    const activeSub = await getActiveSubscription(supabase, session.user.id)
    if (!activeSub) {
      return NextResponse.json(
        {
          error: 'Báo cáo tổng hợp là tính năng dành cho gói Doanh nghiệp. Vui lòng nâng cấp gói.',
          code: 'PLAN_REQUIRED',
        },
        { status: 403 }
      )
    }
  }

  try {
    const businessName =
      session.user.name?.trim() || session.user.email?.split('@')[0] || 'Doanh nghiệp'
    const report = await buildBusinessReport(supabase, session.user.id, businessName)
    return NextResponse.json(report)
  } catch (err) {
    console.error('business report error', err)
    return NextResponse.json({ error: 'Không tạo được báo cáo' }, { status: 500 })
  }
}
