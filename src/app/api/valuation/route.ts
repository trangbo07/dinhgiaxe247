import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { getClientIp } from '@/lib/client-ip'
import { rateLimitAuthValuation, rateLimitGuestValuation } from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/api-rate-limit-response'
import { runValuation } from '@/lib/valuation-engine'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    const ip = getClientIp(request)

    if (session?.user?.id) {
      const lim = rateLimitAuthValuation(session.user.id)
      if (!lim.allowed) return rateLimitResponse(lim)
    } else {
      const lim = rateLimitGuestValuation(ip)
      if (!lim.allowed) return rateLimitResponse(lim)
    }

    const body = await request.json()
    const { brand, model, year, version, color, mileage, intent } = body
    const result = await runValuation({
      brand: String(brand ?? ''),
      model: String(model ?? ''),
      year: Number(year),
      version: version ? String(version) : undefined,
      color: String(color ?? ''),
      mileage: Number(mileage),
      intent,
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('valuation api error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
