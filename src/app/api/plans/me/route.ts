import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { tryCreateSupabaseServerClient } from '@/utils/supabase'
import { getPlanState } from '@/lib/plan-quota'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = tryCreateSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })
  }

  const state = await getPlanState(supabase, session.user.id)
  return NextResponse.json(state)
}
