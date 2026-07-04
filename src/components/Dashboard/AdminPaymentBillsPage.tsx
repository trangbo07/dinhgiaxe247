'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { BUSINESS_PLAN_INFO, type PlanCode } from '@/lib/payment-bills'

type AdminBill = {
  id: string
  user_id: string
  userEmail: string | null
  plan_code: PlanCode
  amount: number
  transfer_content: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  imageUrl: string | null
}

const STATUS_LABEL: Record<AdminBill['status'], { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
}

export default function AdminPaymentBillsPage() {
  const [items, setItems] = useState<AdminBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    try {
      const res = await fetch(`/api/admin/payment-bills?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payment-bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Duyệt thất bại')
      toast.success('Đã duyệt bill và kích hoạt gói cho khách')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    const note = window.prompt('Lý do từ chối (tùy chọn):') ?? ''
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payment-bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Từ chối thất bại')
      toast.success('Đã từ chối bill')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-midnight_text">Bill chuyển khoản</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Duyệt bill chuyển khoản để kích hoạt gói Doanh nghiệp cho khách.</p>
        </div>
        <button type="button" onClick={load} disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((v) => (
          <button key={v} type="button" onClick={() => setFilterStatus(v)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold sm:px-4 ${filterStatus === v ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            {v === 'all' ? 'Tất cả' : STATUS_LABEL[v].label}
          </button>
        ))}
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
          Không có bill nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((bill) => (
            <div key={bill.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {bill.imageUrl ? (
                <a href={bill.imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bill.imageUrl} alt="Bill" className="h-48 w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-400">
                  <Icon icon="tabler:photo-off" className="text-3xl" />
                </div>
              )}
              <div className="space-y-1.5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-midnight_text">{bill.userEmail ?? bill.user_id}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_LABEL[bill.status].color}`}>
                    {STATUS_LABEL[bill.status].label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {BUSINESS_PLAN_INFO[bill.plan_code].label} · {bill.amount.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-slate-500">Nội dung CK: <span className="font-semibold text-slate-700">{bill.transfer_content}</span></p>
                <p className="text-[10px] text-slate-400">{new Date(bill.created_at).toLocaleString('vi-VN')}</p>
                {bill.admin_note && (
                  <p className="text-xs text-red-500">Ghi chú: {bill.admin_note}</p>
                )}

                {bill.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={processingId === bill.id}
                      onClick={() => handleApprove(bill.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">
                      <Icon icon="tabler:check" /> Duyệt
                    </button>
                    <button
                      type="button"
                      disabled={processingId === bill.id}
                      onClick={() => handleReject(bill.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50">
                      <Icon icon="tabler:x" /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
