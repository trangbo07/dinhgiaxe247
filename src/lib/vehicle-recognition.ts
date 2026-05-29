export type VehicleMatchOption = {
  brand: string
  model: string
  generation?: string
  version?: string
  year_range: string
  body_type?: string
  color?: string
  confidence?: number
}

export type VehicleDetectResponse =
  | {
      success: true
      mode: 'single_result'
      confidence: number
      vehicle: VehicleMatchOption & {
        generation?: string
        body_type?: string
      }
      analysis?: {
        detected_features?: string[]
        market_region?: string
      }
    }
  | {
      success: true
      mode: 'multiple_options'
      confidence: number
      possible_matches: VehicleMatchOption[]
      reason?: string[]
    }
  | {
      success: false
      mode: 'undetected'
      message: string
      reasons?: string[]
    }

export function normalizeName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** "2014-2019", "2021–2022", "2021" → sorted years (newest first). */
export function parseYearRange(yearRange: string): number[] {
  const s = String(yearRange ?? '').trim()
  if (!s) return []

  const range = s.match(/(\d{4})\s*[-–—]\s*(\d{4})/)
  if (range) {
    const a = parseInt(range[1], 10)
    const b = parseInt(range[2], 10)
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const years: number[] = []
    for (let y = lo; y <= hi; y++) years.push(y)
    return years.sort((x, y) => y - x)
  }

  const single = s.match(/\b(19|20)\d{2}\b/)
  if (single) return [parseInt(single[0], 10)]
  return []
}

const COLOR_MAP: Record<string, string> = {
  white: 'Trắng',
  black: 'Đen',
  silver: 'Bạc',
  grey: 'Xám',
  gray: 'Xám',
  red: 'Đỏ',
  blue: 'Xanh dương',
  green: 'Xanh lá',
  brown: 'Nâu',
  orange: 'Cam',
  yellow: 'Vàng',
  purple: 'Tím',
  beige: 'Be',
  gold: 'Vàng',
}

export function mapColorToCatalog(aiColor: string, catalogColors: string[]): string | null {
  if (!aiColor) return null
  const n = normalizeName(aiColor)
  for (const c of catalogColors) {
    if (normalizeName(c) === n) return c
  }
  for (const [en, vi] of Object.entries(COLOR_MAP)) {
    if (n.includes(en) && catalogColors.includes(vi)) return vi
  }
  if (catalogColors.length) return catalogColors[0]
  return aiColor
}

export function extractJsonFromModelText(text: string): unknown {
  const trimmed = text.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fence ? fence[1].trim() : trimmed
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object in response')
  return JSON.parse(raw.slice(start, end + 1))
}

export function parseVehicleDetectPayload(raw: unknown): VehicleDetectResponse {
  const o = raw as Record<string, unknown>
  if (o.success === false) {
    return {
      success: false,
      mode: 'undetected',
      message: String(o.message ?? 'Unable to confidently identify vehicle'),
      reasons: Array.isArray(o.reasons) ? o.reasons.map(String) : undefined,
    }
  }

  if (o.mode === 'multiple_options' && Array.isArray(o.possible_matches)) {
    return {
      success: true,
      mode: 'multiple_options',
      confidence: Number(o.confidence) || 0,
      possible_matches: o.possible_matches.map((m: Record<string, unknown>) => ({
        brand: String(m.brand ?? ''),
        model: String(m.model ?? ''),
        generation: m.generation ? String(m.generation) : undefined,
        version: m.version ? String(m.version) : undefined,
        year_range: String(m.year_range ?? ''),
        body_type: m.body_type ? String(m.body_type) : undefined,
        color: m.color ? String(m.color) : undefined,
        confidence: m.confidence != null ? Number(m.confidence) : undefined,
      })),
      reason: Array.isArray(o.reason) ? o.reason.map(String) : undefined,
    }
  }

  const vehicle = o.vehicle as Record<string, unknown> | undefined
  if (vehicle) {
    return {
      success: true,
      mode: 'single_result',
      confidence: Number(o.confidence) || 0,
      vehicle: {
        brand: String(vehicle.brand ?? ''),
        model: String(vehicle.model ?? ''),
        generation: vehicle.generation ? String(vehicle.generation) : undefined,
        version: vehicle.version ? String(vehicle.version) : undefined,
        year_range: String(vehicle.year_range ?? ''),
        body_type: vehicle.body_type ? String(vehicle.body_type) : undefined,
        color: vehicle.color ? String(vehicle.color) : undefined,
      },
      analysis: o.analysis as VehicleDetectResponse extends { mode: 'single_result' }
        ? { detected_features?: string[]; market_region?: string }
        : never,
    }
  }

  throw new Error('Invalid vehicle detection JSON shape')
}
