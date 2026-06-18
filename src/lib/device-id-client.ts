'use client'

import {
  currentUsageMonthKey,
  DEVICE_ID_STORAGE_KEY,
  GUEST_COMPARE_LIMIT,
  GUEST_COMPARE_USAGE_KEY,
  normalizeDeviceId,
} from '@/lib/device-id'

type UsageRecord = { month: string; used: number }

function readUsage(): UsageRecord {
  const month = currentUsageMonthKey()
  try {
    const raw = localStorage.getItem(GUEST_COMPARE_USAGE_KEY)
    if (!raw) return { month, used: 0 }
    const parsed = JSON.parse(raw) as UsageRecord
    if (parsed.month !== month) return { month, used: 0 }
    return { month, used: Math.max(0, Number(parsed.used) || 0) }
  } catch {
    return { month, used: 0 }
  }
}

function writeUsage(used: number) {
  try {
    localStorage.setItem(
      GUEST_COMPARE_USAGE_KEY,
      JSON.stringify({ month: currentUsageMonthKey(), used })
    )
  } catch {}
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (existing) {
      const normalized = normalizeDeviceId(existing)
      if (normalized) return normalized
    }
    const id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function getGuestCompareQuota() {
  const max = GUEST_COMPARE_LIMIT
  const { used } = readUsage()
  return {
    used,
    max,
    remaining: Math.max(0, max - used),
  }
}

export function bumpGuestCompareUsage() {
  const { used } = readUsage()
  writeUsage(used + 1)
}

export function syncGuestCompareUsage(used: number) {
  writeUsage(Math.max(0, used))
}
