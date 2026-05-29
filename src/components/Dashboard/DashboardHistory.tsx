'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'

type ValuationRow = {
  id: string
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

export default function DashboardHistory() {
  const [items, setItems] = useState<ValuationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch('/api/valuations')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Lỗi tải dữ liệu')
        setItems(d.items ?? [])
      })
      .catch((e) => {
        setError(e.message)
        setItems([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-midnight_text sm:text-2xl">Lịch sử định giá</h2>
          <p className="text-sm text-slate-500 mt-1">
            Lưu lại mọi lượt định giá của bạn trên website.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 sm:w-auto">
          <Icon icon="tabler:refresh" />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <p className="font-semibold">Chưa kết nối được Supabase</p>
          <p className="mt-1">{error}</p>
          <ol className="mt-3 text-xs list-decimal list-inside space-y-1">
            <li>
              Mở{' '}
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-semibold underline">
                Supabase → Settings → API
              </a>
              , copy <strong>service_role</strong> (secret)
            </li>
            <li>
              Dán vào <code className="bg-amber-100 px-1 rounded">.env</code>:{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY=eyJ...</code>
            </li>
            <li>Restart <code>npm run dev</code></li>
            <li>
              Chạy SQL{' '}
              <code className="bg-amber-100 px-1 rounded">supabase/migrations/001_valuations.sql</code>
            </li>
          </ol>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon icon="tabler:loader" className="text-4xl text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Icon icon="tabler:folder-open" className="text-5xl text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Chưa có bản ghi nào</p>
          <Link
            href="/dashboard/valuation"
            className="inline-block mt-4 text-primary font-bold hover:underline">
            Định giá xe đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((v) => (
            <article
              key={v.id}
              className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-midnight_text sm:text-lg">
                    {v.brand} {v.model}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {[v.year, v.version, v.color, v.mileage != null ? `${v.mileage.toLocaleString('vi-VN')} km` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(v.created_at).toLocaleString('vi-VN')}
                    {v.source ? ` · Nguồn: ${v.source}` : ''}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/5 p-3 sm:text-right">
                  <p className="text-lg font-black text-primary sm:text-xl">
                    {v.price != null ? `${v.price.toLocaleString('vi-VN')} đ` : '—'}
                  </p>
                  {v.price_low != null && v.price_high != null && (
                    <p className="text-sm text-slate-500">
                      {v.price_low.toLocaleString('vi-VN')} – {v.price_high.toLocaleString('vi-VN')} đ
                    </p>
                  )}
                </div>
              </div>
              {v.explanation && (
                <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3 border-t border-slate-50 pt-4">
                  {v.explanation}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
