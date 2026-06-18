import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { getClientIp } from '@/lib/client-ip'
import { normalizeDeviceId } from '@/lib/device-id'
import {
  getDeviceCompareQuota,
  rateLimitAuthCompare,
  rateLimitDeviceCompare,
  rateLimitGuestCompare,
} from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/api-rate-limit-response'
import { runValuation } from '@/lib/valuation-engine'
import { callGemini, isGeminiConfigured } from '@/lib/gemini-client'
import {
  buildCarComparePrompt,
  buildFallbackCompareReport,
  parseCarCompareReport,
} from '@/lib/car-compare-prompt'
import type {
  CarCompareApiResponse,
  CompareCarInput,
  CompareValuationSnapshot,
} from '@/lib/car-compare-types'

type CarPayload = {
  brand: string
  model: string
  year: number
  version?: string
  color: string
  mileage: number
  label?: string
}

function toCompareInput(car: CarPayload, fallbackLabel: string): CompareCarInput {
  return {
    label: car.label || fallbackLabel,
    brand: car.brand,
    model: car.model,
    year: Number(car.year),
    version: car.version || '—',
    color: car.color,
    mileage: Number(car.mileage) || 0,
  }
}

function toSnapshot(v: Awaited<ReturnType<typeof runValuation>>): CompareValuationSnapshot {
  return {
    price: v.price,
    priceLow: v.priceLow,
    priceHigh: v.priceHigh,
    explanation: v.explanation,
    source: v.source,
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    const ip = getClientIp(request)
    const body = await request.json()
    const deviceId = normalizeDeviceId(body.deviceId)

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Thiếu mã thiết bị. Vui lòng tải lại trang và thử lại.' },
        { status: 400 }
      )
    }

    const deviceLim = rateLimitDeviceCompare(deviceId)
    if (!deviceLim.allowed) {
      const compareQuota = getDeviceCompareQuota(deviceId)
      return NextResponse.json(
        {
          error: deviceLim.reason,
          code: 'COMPARE_DEVICE_LIMIT',
          compareQuota,
        },
        { status: 429 }
      )
    }

    if (session?.user?.id) {
      const lim = rateLimitAuthCompare(session.user.id)
      if (!lim.allowed) return rateLimitResponse(lim)
    } else {
      const lim = rateLimitGuestCompare(ip)
      if (!lim.allowed) return rateLimitResponse(lim)
    }
    const carA = body.carA as CarPayload
    const carB = body.carB as CarPayload
    const intent = body.intent ?? 'mua'

    if (!carA?.brand || !carA?.model || !carB?.brand || !carB?.model) {
      return NextResponse.json({ error: 'Thiếu thông tin xe A hoặc xe B' }, { status: 400 })
    }

    const labelA = carA.label || `${carA.brand} ${carA.model}`
    const labelB = carB.label || `${carB.brand} ${carB.model}`

    const [valA, valB] = await Promise.all([
      runValuation({
        brand: carA.brand,
        model: carA.model,
        year: Number(carA.year),
        color: carA.color,
        mileage: Number(carA.mileage),
        intent,
      }),
      runValuation({
        brand: carB.brand,
        model: carB.model,
        year: Number(carB.year),
        color: carB.color,
        mileage: Number(carB.mileage),
        intent,
      }),
    ])

    const inputA = toCompareInput(carA, labelA)
    const inputB = toCompareInput(carB, labelB)
    const snapA = toSnapshot(valA)
    const snapB = toSnapshot(valB)

    let report = buildFallbackCompareReport(inputA, inputB, snapA, snapB)

    if (isGeminiConfigured()) {
      try {
        const prompt = buildCarComparePrompt(inputA, inputB, snapA, snapB)
        const raw = await callGemini(prompt)
        const parsed = parseCarCompareReport(raw)
        if (parsed) report = parsed
      } catch (err) {
        console.error('compare gemini error', err)
      }
    }

    const response: CarCompareApiResponse = {
      carA: snapA,
      carB: snapB,
      report,
      compareQuota: getDeviceCompareQuota(deviceId),
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    console.error('compare api error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Không thể so sánh xe' },
      { status: 500 }
    )
  }
}
