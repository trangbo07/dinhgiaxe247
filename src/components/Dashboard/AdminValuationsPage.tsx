'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

type Valuation = {
  id: string
  user_id: string
  brand: string
  model: string
  year: number | null
  version: string | null
  color: string | null
  mileage: number | null
  price: number | null
  price_low: number | null
  price_high: number | null
  explanation: string | null
  source: string | null
  created_at: string
}

export default function AdminValuationsPage() {
  const [items, setItems] = useState<Valuation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/valuations')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const formatPrice = (low: number | null, high: number | null, price: number | null) => {
    if (low != null && high != null) return `${low.toLocaleString('vi-VN')} – ${high.toLocaleString('vi-VN')} đ`
    if (price != null) return `${price.toLocaleString('vi-VN')} đ`
    return '—'
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex items-center gap-2 lg:hidden">
        <p className="min-w-0 flex-1 text-xs leading-snug text-slate-500">
          Tất cả lịch sử định giá từ toàn hệ thống.
        </p>
        <button type="button" onClick={load} disabled={loading} aria-label="Làm mới"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-midnight_text">Tất cả Định giá</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Toàn bộ lịch sử định giá của tất cả doanh nghiệp (tối đa 1000 bản ghi mới nhất).
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
          Chưa có dữ liệu định giá.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            {items.length} định giá
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((v) => (
              <div key={v.id} className="flex min-w-0 items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-midnight_text">
                    {v.brand} {v.model} {v.year ?? ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[v.version, v.color, v.mileage != null ? `${v.mileage.toLocaleString('vi-VN')} km` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    User: {v.user_id.slice(0, 8)}… · {new Date(v.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-primary">
                    {formatPrice(v.price_low, v.price_high, v.price)}
                  </p>
                  {v.source && <p className="text-[10px] text-slate-400">{v.source}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
