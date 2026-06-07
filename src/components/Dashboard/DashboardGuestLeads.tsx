'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'

export type GuestLead = {
  id: string
  full_name: string
  phone: string
  intent: 'mua' | 'ban'
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
  status: 'moi' | 'da_lien_he' | 'dong'
  created_at: string
}

export const statusLabels: Record<string, { label: string; className: string }> = {
  moi: { label: 'Mới', className: 'bg-blue-100 text-blue-800' },
  da_lien_he: { label: 'Đã liên hệ', className: 'bg-blue-100 text-blue-800' },
  dong: { label: 'Đóng', className: 'bg-slate-100 text-slate-600' },
}

export default function DashboardGuestLeads() {
  const [items, setItems] = useState<GuestLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterIntent, setFilterIntent] = useState<'all' | 'mua' | 'ban'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'moi' | 'da_lien_he' | 'dong'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (filterIntent !== 'all') params.set('intent', filterIntent)
    if (filterStatus !== 'all') params.set('status', filterStatus)

    try {
      const res = await fetch(`/api/guest-leads?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filterIntent, filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/guest-leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại')
      toast.success('Đã cập nhật trạng thái')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    }
  }

  const formatPrice = (low: number | null, high: number | null, price: number | null) => {
    if (low != null && high != null) {
      return `${low.toLocaleString('vi-VN')} – ${high.toLocaleString('vi-VN')} đ`
    }
    if (price != null) return `${price.toLocaleString('vi-VN')} đ`
    return '—'
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      {/* Mobile: tiêu đề đã có trên header shell — chỉ mô tả ngắn + nút icon */}
      <div className="flex items-center gap-2 lg:hidden">
        <p className="min-w-0 flex-1 text-xs leading-snug text-slate-500">
          Lead khách định giá trên trang chủ · SĐT, xe, giá.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Làm mới danh sách"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon
            icon={loading ? 'tabler:loader' : 'tabler:refresh'}
            className={`text-xl ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Desktop: tiêu đề + mô tả đầy đủ */}
      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-midnight_text">Khách từ website</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Khách chưa đăng nhập đã định giá trên trang chủ — đầy đủ họ tên, SĐT, mua/bán, thông tin
            xe và kết quả giá. Dùng để sales liên hệ và chốt deal.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon
            icon={loading ? 'tabler:loader' : 'tabler:refresh'}
            className={loading ? 'animate-spin' : ''}
          />
          Làm mới
        </button>
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', 'mua', 'ban'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterIntent(v)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 ${
                filterIntent === v ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-sm'
              }`}>
              {v === 'all' ? 'Tất cả' : v === 'mua' ? 'Mua' : 'Bán'}
            </button>
          ))}
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', 'moi', 'da_lien_he', 'dong'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterStatus(v)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 ${
                filterStatus === v ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-sm'
              }`}>
              {v === 'all' ? 'Tất cả' : statusLabels[v]?.label ?? v}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-xs">
            Chạy <code className="bg-blue-100 px-1 rounded">002_guest_leads.sql</code> và cấu hình{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="text-4xl text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed p-12 text-center text-slate-500">
          Chưa có lead khách. Lead sẽ xuất hiện khi khách định giá trên trang chủ.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((lead) => (
            <article
              key={lead.id}
              className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="max-w-full truncate text-base font-bold text-midnight_text sm:text-lg">
                      {lead.full_name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        lead.intent === 'mua' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                      {lead.intent === 'mua' ? 'Muốn mua' : 'Muốn bán'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        statusLabels[lead.status]?.className ?? 'bg-slate-100'
                      }`}>
                      {statusLabels[lead.status]?.label ?? lead.status}
                    </span>
                  </div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="mt-2 flex min-h-[44px] max-w-full items-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-primary active:bg-primary/20 sm:px-4">
                    <Icon icon="tabler:phone" className="shrink-0 text-xl" />
                    <span className="min-w-0 truncate text-sm font-bold sm:text-base">
                      {lead.phone}
                    </span>
                  </a>
                  <p className="mt-1.5 truncate text-xs text-slate-400">
                    {new Date(lead.created_at).toLocaleString('vi-VN')}
                    {lead.source ? ` · ${lead.source}` : ''}
                  </p>
                </div>
                <div className="min-w-0 shrink-0 rounded-xl bg-slate-50 p-3 sm:max-w-[50%] sm:text-right">
                  <p className="text-xs text-slate-500">Giá tham chiếu</p>
                  <p className="break-words text-sm font-black leading-tight text-primary sm:text-base">
                    {formatPrice(lead.price_low, lead.price_high, lead.price)}
                  </p>
                </div>
              </div>

              <div className="mb-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2 sm:gap-3 sm:p-4">
                <p className="min-w-0 break-words">
                  <span className="text-slate-500">Xe:</span>{' '}
                  <strong>
                    {lead.brand} {lead.model}
                  </strong>
                </p>
                <p className="min-w-0 break-words">
                  <span className="text-slate-500">Chi tiết:</span>{' '}
                  {[lead.year, lead.version, lead.color, lead.mileage != null ? `${lead.mileage.toLocaleString('vi-VN')} km` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {lead.explanation && (
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 border-l-4 border-primary/30 pl-3">
                  {lead.explanation}
                </p>
              )}

              <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain border-t border-slate-100 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(['moi', 'da_lien_he', 'dong'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={lead.status === s}
                    onClick={() => updateStatus(lead.id, s)}
                    className="shrink-0 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold active:bg-slate-100 disabled:cursor-default disabled:opacity-40 sm:min-h-[40px] sm:px-4">
                    {statusLabels[s].label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
