'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { BANK_INFO, BUSINESS_PLAN_INFO, type PlanCode } from '@/lib/payment-bills'

type Invoice = {
  id: string
  user_id: string
  userEmail: string | null
  plan_code: PlanCode
  amount: number
  transfer_content: string
  reviewed_at: string | null
  created_at: string
}

function invoiceNumber(id: string, reviewedAt: string | null) {
  const d = reviewedAt ? new Date(reviewedAt) : new Date()
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
  return `HD-${ym}-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export default function AdminInvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/payment-bills?status=approved')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách hoá đơn')
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

  const totalRevenue = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-midnight_text">Hoá đơn</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách hoá đơn đã thanh toán (bill chuyển khoản đã được duyệt).
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
          Chưa có hoá đơn nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{items.length} hoá đơn</span>
            <span className="text-primary">Tổng: {totalRevenue.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-midnight_text">
                    {invoiceNumber(inv.id, inv.reviewed_at)}
                  </p>
                  <p className="truncate text-xs text-slate-500">{inv.userEmail ?? inv.user_id}</p>
                </div>
                <div className="shrink-0 text-xs text-slate-500">
                  {BUSINESS_PLAN_INFO[inv.plan_code].label}
                </div>
                <div className="shrink-0 text-xs text-slate-400">
                  {inv.reviewed_at ? new Date(inv.reviewed_at).toLocaleDateString('vi-VN') : '—'}
                </div>
                <div className="shrink-0 text-sm font-black text-primary">
                  {inv.amount.toLocaleString('vi-VN')}đ
                </div>
                <button
                  type="button"
                  onClick={() => setActiveInvoice(inv)}
                  className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">
                  Xem hoá đơn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-transparent print:p-0">
          <div className="invoice-print-area relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl print:max-h-none print:overflow-visible print:rounded-none print:shadow-none">
            <button
              type="button"
              onClick={() => setActiveInvoice(null)}
              className="absolute right-4 top-4 text-2xl text-slate-400 hover:text-slate-700 print:hidden"
              aria-label="Đóng">
              ×
            </button>

            <div className="mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hoá đơn</p>
              <h3 className="mt-1 text-2xl font-black text-midnight_text">
                {invoiceNumber(activeInvoice.id, activeInvoice.reviewed_at)}
              </h3>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Khách hàng</span><span className="font-bold text-slate-700">{activeInvoice.userEmail ?? activeInvoice.user_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gói dịch vụ</span><span className="font-bold text-slate-700">{BUSINESS_PLAN_INFO[activeInvoice.plan_code].label}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thời hạn</span><span className="font-bold text-slate-700">{BUSINESS_PLAN_INFO[activeInvoice.plan_code].durationDays} ngày</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Nội dung CK</span><span className="font-bold text-slate-700">{activeInvoice.transfer_content}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Ngày thanh toán</span><span className="font-bold text-slate-700">{activeInvoice.reviewed_at ? new Date(activeInvoice.reviewed_at).toLocaleString('vi-VN') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Người nhận</span><span className="font-bold text-slate-700">{BANK_INFO.accountHolder} · {BANK_INFO.bankName}</span></div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3">
              <span className="font-bold text-slate-700">Tổng thanh toán</span>
              <span className="text-xl font-black text-primary">{activeInvoice.amount.toLocaleString('vi-VN')}đ</span>
            </div>

            <p className="mt-4 text-center text-xs font-bold text-emerald-600">✓ Đã thanh toán</p>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:opacity-90 print:hidden">
              <Icon icon="tabler:printer" /> In hoá đơn
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-area, .invoice-print-area * { visibility: visible; }
          .invoice-print-area { position: fixed; inset: 0; margin: auto; }
        }
      `}</style>
    </div>
  )
}
