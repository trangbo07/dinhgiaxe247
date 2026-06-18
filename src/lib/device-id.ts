/** Giới hạn so sánh xe miễn phí trên mỗi thiết bị (theo tháng). */
export const GUEST_COMPARE_LIMIT = 5

export const DEVICE_ID_STORAGE_KEY = 'valucar_device_id_v1'
export const GUEST_COMPARE_USAGE_KEY = 'valucar_guest_compare_usage_v1'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function currentUsageMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

export function normalizeDeviceId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const id = raw.trim().slice(0, 64)
  if (!UUID_RE.test(id)) return null
  return id.toLowerCase()
}
