'use client'

import { useEffect, useState } from 'react'
import UsedCarChecklist from '@/components/Home/UsedCarChecklist'

const STORAGE_KEY = 'valucar_last_guest_valuation'

export type StoredGuestValuation = {
  priceLow: number | null
  priceHigh: number | null
  brand: string
  model: string
  at: number
}

export function saveGuestValuationToStorage(data: Omit<StoredGuestValuation, 'at'>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, at: Date.now() })
    )
    window.dispatchEvent(new Event('valucar-guest-valuation'))
  } catch {}
}

export function readGuestValuationFromStorage(): StoredGuestValuation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredGuestValuation
  } catch {
    return null
  }
}

/** Checklist độc lập — đọc giá từ lần định giá khách gần nhất */
export default function GuestChecklistSection() {
  const [prices, setPrices] = useState<{ low: number | null; high: number | null }>({
    low: null,
    high: null,
  })

  useEffect(() => {
    const stored = readGuestValuationFromStorage()
    if (stored) {
      setPrices({ low: stored.priceLow, high: stored.priceHigh })
    }
    const refresh = () => {
      const s = readGuestValuationFromStorage()
      if (s) setPrices({ low: s.priceLow, high: s.priceHigh })
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('valucar-guest-valuation', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('valucar-guest-valuation', refresh)
    }
  }, [])

  return (
    <UsedCarChecklist basePriceLow={prices.low} basePriceHigh={prices.high} />
  )
}
