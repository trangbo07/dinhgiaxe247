import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth-server'
import { rateLimitAuthVehicleDetect } from '@/lib/rate-limit'
import { rateLimitResponse } from '@/lib/api-rate-limit-response'
import { VEHICLE_RECOGNITION_SYSTEM_PROMPT } from '@/lib/vehicle-recognition-prompt'
import {
  extractJsonFromModelText,
  parseVehicleDetectPayload,
} from '@/lib/vehicle-recognition'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_VERSION =
  process.env.GEMINI_API_VERSION ||
  (GEMINI_MODEL.includes('preview') || GEMINI_MODEL.includes('3.1') ? 'v1beta' : 'v1')

const MAX_IMAGES = 6
const MAX_BYTES_PER_IMAGE = 5 * 1024 * 1024

async function fileToInlineData(file: File) {
  if (file.size > MAX_BYTES_PER_IMAGE) {
    throw new Error(`Ảnh ${file.name} vượt quá 5MB`)
  }
  const buf = Buffer.from(await file.arrayBuffer())
  const mime = file.type?.startsWith('image/') ? file.type : 'image/jpeg'
  return {
    inline_data: {
      mime_type: mime,
      data: buf.toString('base64'),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nhận diện xe bằng ảnh chỉ dành cho tài khoản đã đăng nhập.' },
        { status: 401 }
      )
    }

    const limited = rateLimitAuthVehicleDetect(session.user.id)
    if (!limited.allowed) return rateLimitResponse(limited)

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Thiếu GEMINI_API_KEY/GOOGLE_API_KEY.' },
        { status: 503 }
      )
    }

    const form = await request.formData()
    const files: File[] = []
    for (let i = 0; i < MAX_IMAGES; i++) {
      const f = form.get(`image_${i}`)
      if (f instanceof File && f.size > 0) files.push(f)
    }
    if (!files.length) {
      const bulk = form.getAll('images')
      for (const f of bulk) {
        if (f instanceof File && f.size > 0) files.push(f)
      }
    }

    if (files.length < 1) {
      return NextResponse.json({ error: 'Cần ít nhất 1 ảnh xe.' }, { status: 400 })
    }

    const imageParts = await Promise.all(files.map(fileToInlineData))
    const stepLabels = form.get('step_labels')
    const labelHint =
      typeof stepLabels === 'string'
        ? `\nThứ tự ảnh (theo workflow): ${stepLabels}`
        : ''

    const parts = [
      { text: VEHICLE_RECOGNITION_SYSTEM_PROMPT + labelHint },
      ...imageParts,
      {
        text: `Analyze the car image(s). One photo is enough if it shows the vehicle clearly. Return ONLY JSON per the format rules.`,
      },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const details = await response.text()
      console.error('vehicle-detect gemini error', response.status, details)
      return NextResponse.json(
        { error: 'AI nhận diện thất bại. Vui lòng thử lại.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) {
      return NextResponse.json({ error: 'AI không trả về kết quả.' }, { status: 502 })
    }

    const parsed = parseVehicleDetectPayload(extractJsonFromModelText(text))
    return NextResponse.json({ ...parsed, source: 'gemini' })
  } catch (err: unknown) {
    console.error('vehicle-detect error', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Lỗi nhận diện xe',
      },
      { status: 500 }
    )
  }
}
