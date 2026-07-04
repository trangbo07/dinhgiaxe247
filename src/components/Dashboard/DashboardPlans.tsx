'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { useWallet } from '@/app/Providers'
import { formatValuationQuota } from '@/lib/plan-limits'
import {
  BANK_INFO,
  BUSINESS_PLAN_INFO,
  PLAN_CODES,
  generateTransferContent,
  type PlanCode,
} from '@/lib/payment-bills'

type Bill = {
  id: string
  plan_code: PlanCode
  amount: number
  transfer_content: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  imageUrl: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_LABEL: Record<Bill['status'], { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-50' },
  approved: { label: 'Đã duyệt', color: 'text-green-700 bg-green-50' },
  rejected: { label: 'Từ chối', color: 'text-red-700 bg-red-50' },
}

export default function DashboardPlans() {
  const { data: session } = useSession()
  const {
    isPro,
    planCode,
    planExpiresAt,
    remainingFreeValuations,
    maxValuationsPerMonth,
    planName,
    refreshPlanState,
  } = useWallet()

  const [selectedPlan, setSelectedPlan] = useState<PlanCode>('monthly')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [bills, setBills] = useState<Bill[]>([])
  const [billsLoading, setBillsLoading] = useState(true)

  const userId = session?.user?.id ?? ''
  const transferContent = userId ? generateTransferContent(userId, selectedPlan) : ''
  const selectedPlanInfo = BUSINESS_PLAN_INFO[selectedPlan]

  const loadBills = async () => {
    setBillsLoading(true)
    try {
      const res = await fetch('/api/payments/bills')
      if (res.ok) {
        const data = await res.json()
        setBills(data.bills ?? [])
      }
    } catch {
      // im lặng — danh sách bill chỉ mang tính hiển thị
    } finally {
      setBillsLoading(false)
    }
  }

  useEffect(() => {
    loadBills()
  }, [])

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptFile) {
      toast.error('Vui lòng chọn ảnh bill chuyển khoản')
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('planCode', selectedPlan)
      form.append('amount', String(selectedPlanInfo.price))
      form.append('receipt', receiptFile)

      const res = await fetch('/api/payments/bills', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không gửi được bill')

      toast.success('Đã gửi bill, chờ admin duyệt')
      setReceiptFile(null)
      loadBills()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được bill')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Gói hiện tại</p>
          <button
            type="button"
            onClick={() => { refreshPlanState(); loadBills(); }}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Icon icon="tabler:refresh" /> Làm mới
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-1.5 text-sm font-black ${isPro ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
            {planName}
          </span>
          {isPro && planCode && (
            <span className="text-xs text-slate-500">
              {BUSINESS_PLAN_INFO[planCode].label}
              {planExpiresAt && <> · Hết hạn: <span className="font-bold text-slate-700">{formatDate(planExpiresAt)}</span></>}
            </span>
          )}
        </div>

        {!isPro && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <Icon icon="tabler:info-circle" className="shrink-0 text-slate-400" />
            <p className="text-sm text-slate-500">
              {formatValuationQuota(remainingFreeValuations, maxValuationsPerMonth)} · Mua gói Doanh nghiệp để dùng không giới hạn.
            </p>
          </div>
        )}
      </div>

      {/* Chọn gói */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-base font-black text-midnight_text">Chọn gói muốn mua</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLAN_CODES.map((code) => {
            const info = BUSINESS_PLAN_INFO[code]
            const active = selectedPlan === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedPlan(code)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  active ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <p className="text-sm font-bold text-midnight_text">{info.label}</p>
                <p className="mt-1 text-lg font-black text-primary">{info.price.toLocaleString('vi-VN')}đ</p>
                <p className="text-xs text-slate-400">{info.durationDays} ngày</p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Tính năng của {selectedPlanInfo.label}
          </p>
          <ul className="space-y-1.5">
            {selectedPlanInfo.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Icon icon="tabler:check" className="mt-0.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* QR + upload bill */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon icon="tabler:qrcode" className="text-xl text-primary" />
            </div>
            <div>
              <p className="text-base font-black text-midnight_text">Chuyển khoản & gửi bill</p>
              <p className="text-xs text-slate-500">Quét QR, chuyển khoản đúng nội dung, rồi upload ảnh bill để admin duyệt</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center p-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <Image
              src={BANK_INFO.qrImage}
              alt="Mã QR thanh toán"
              width={320}
              height={420}
              className="h-auto w-full max-w-[300px] rounded-xl"
            />
          </div>

          <div className="mt-5 w-full max-w-sm space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngân hàng</span>
              <span className="font-bold text-slate-700">{BANK_INFO.bankName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chủ tài khoản</span>
              <span className="font-bold text-slate-700">{BANK_INFO.accountHolder}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tài khoản</span>
              <span className="font-bold text-slate-700">{BANK_INFO.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tiền</span>
              <span className="font-bold text-slate-700">{selectedPlanInfo.price.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nội dung CK</span>
              <span className="font-bold text-primary">{transferContent}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitBill} className="mt-5 w-full max-w-sm space-y-3">
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-4 text-center hover:border-primary">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              />
              <Icon icon="tabler:upload" className="mx-auto mb-1 text-2xl text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">
                {receiptFile ? receiptFile.name : 'Chọn ảnh bill chuyển khoản'}
              </span>
            </label>
            <button
              type="submit"
              disabled={uploading || !receiptFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50">
              {uploading ? (<><Icon icon="tabler:loader" className="animate-spin" /> Đang gửi...</>) : 'Gửi'}
            </button>
          </form>
        </div>
      </div>

      {/* Lịch sử bill */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-base font-black text-midnight_text">Lịch sử chuyển khoản</p>
        {billsLoading ? (
          <p className="text-sm text-slate-400">Đang tải...</p>
        ) : bills.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có bill nào.</p>
        ) : (
          <ul className="space-y-3">
            {bills.map((bill) => (
              <li key={bill.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                {bill.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bill.imageUrl} alt="Bill" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-700">
                    {BUSINESS_PLAN_INFO[bill.plan_code].label} · {bill.amount.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(bill.created_at)}</p>
                  {bill.status === 'rejected' && bill.admin_note && (
                    <p className="mt-1 text-xs text-red-500">Lý do: {bill.admin_note}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_LABEL[bill.status].color}`}>
                  {STATUS_LABEL[bill.status].label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
