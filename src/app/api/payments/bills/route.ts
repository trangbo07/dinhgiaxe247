import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { tryCreateSupabaseServerClient } from '@/utils/supabase'
import {
  BUSINESS_PLAN_INFO,
  PAYMENT_BILLS_BUCKET,
  generateTransferContent,
  isPlanCode,
} from '@/lib/payment-bills'

const SIGNED_URL_TTL_SECONDS = 60 * 10

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = tryCreateSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('payment_bills')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const bills = await Promise.all(
    (data ?? []).map(async (bill) => {
      const { data: signed } = await supabase.storage
        .from(PAYMENT_BILLS_BUCKET)
        .createSignedUrl(bill.image_path, SIGNED_URL_TTL_SECONDS)
      return { ...bill, imageUrl: signed?.signedUrl ?? null }
    })
  )

  return NextResponse.json({ bills })
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = tryCreateSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase chưa cấu hình' }, { status: 503 })
  }

  const form = await request.formData()
  const planCode = form.get('planCode')
  const amountRaw = form.get('amount')
  const receipt = form.get('receipt')

  if (!isPlanCode(planCode)) {
    return NextResponse.json({ error: 'Gói không hợp lệ' }, { status: 400 })
  }
  if (!(receipt instanceof File) || receipt.size === 0) {
    return NextResponse.json({ error: 'Vui lòng chọn ảnh bill chuyển khoản' }, { status: 400 })
  }
  if (receipt.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ảnh tối đa 8MB' }, { status: 400 })
  }

  const planInfo = BUSINESS_PLAN_INFO[planCode]
  const amount = Number(amountRaw) || planInfo.price

  const ext = (receipt.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const billId = crypto.randomUUID()
  const imagePath = `${session.user.id}/${billId}.${ext}`
  const buffer = Buffer.from(await receipt.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_BILLS_BUCKET)
    .upload(imagePath, buffer, {
      contentType: receipt.type || 'image/jpeg',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Không upload được ảnh: ${uploadError.message}` }, { status: 500 })
  }

  const transferContent = generateTransferContent(session.user.id, planCode)

  const { data, error } = await supabase
    .from('payment_bills')
    .insert({
      id: billId,
      user_id: session.user.id,
      plan_code: planCode,
      amount,
      transfer_content: transferContent,
      image_path: imagePath,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: signed } = await supabase.storage
    .from(PAYMENT_BILLS_BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS)

  return NextResponse.json({ bill: { ...data, imageUrl: signed?.signedUrl ?? null } })
}
