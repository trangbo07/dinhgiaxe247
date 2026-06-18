'use client'

import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useWallet } from '@/app/Providers'
import { PERSONAL_PLAN, formatValuationQuota } from '@/lib/plan-limits'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DashboardPlans() {
  const { data: session } = useSession()
  const {
    isPro, isUltra, ultraUntil,
    activateUltraTrial,
    remainingFreeValuations,
    maxValuationsPerMonth,
    planName,
  } = useWallet()

  const accountType = session?.user?.accountType ?? 'business'
  const isPersonal = accountType === 'personal'

  let planColor = 'text-slate-600'
  let planBg = 'bg-slate-100'
  if (isUltra) { planColor = 'text-purple-700'; planBg = 'bg-purple-50' }
  else if (isPro) { planColor = 'text-yellow-700'; planBg = 'bg-yellow-50' }
  else if (isPersonal) { planColor = 'text-blue-700'; planBg = 'bg-blue-50' }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Gói hiện tại</p>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-1.5 text-sm font-black ${planBg} ${planColor}`}>
            {planName}
          </span>
          {isUltra && ultraUntil && (
            <span className="text-xs text-slate-500">
              Hết hạn: <span className="font-bold text-slate-700">{formatDate(ultraUntil)}</span>
            </span>
          )}
        </div>

        {!isUltra && !isPro && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <Icon icon="tabler:info-circle" className="shrink-0 text-slate-400" />
            <p className="text-sm text-slate-500">
              {isPersonal
                ? `${formatValuationQuota(remainingFreeValuations, maxValuationsPerMonth)} · ${PERSONAL_PLAN.maxChatPerValuation} lượt chat AI mỗi lần định giá.`
                : `Còn ${remainingFreeValuations} lượt dùng thử tháng này. Nâng cấp gói doanh nghiệp để không giới hạn.`}
            </p>
          </div>
        )}

        {isPersonal && !isUltra && !isPro && (
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {PERSONAL_PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Icon icon="tabler:check" className="mt-0.5 shrink-0 text-blue-500" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isPersonal ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <Icon icon="tabler:building-store" className="mx-auto mb-2 text-2xl text-slate-400" />
          <p className="text-sm font-medium text-slate-500">
            Cần quản lý lead khách & định giá không giới hạn?{' '}
            <a href="/#pricing" className="font-bold text-primary hover:underline">
              Xem gói Doanh nghiệp
            </a>
          </p>
        </div>
      ) : !isUltra ? (
        <div className="overflow-hidden rounded-2xl border-2 border-purple-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Icon icon="tabler:crown" className="text-xl text-white" />
              </div>
              <div>
                <p className="text-base font-black text-white">Dùng thử Ultra — Miễn phí 1 tháng</p>
                <p className="text-xs text-purple-200">Không cần thẻ ngân hàng · Hủy bất cứ lúc nào</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <ul className="mb-6 space-y-2.5">
              {[
                'Không giới hạn lượt định giá trong 30 ngày',
                'Chat AI không giới hạn mỗi lần định giá',
                'Báo cáo định giá chuyên sâu',
                'Phân tích xu hướng giá thị trường',
                'Quản lý khách từ website (leads)',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Icon icon="tabler:check-circle-filled" className="mt-0.5 shrink-0 text-lg text-purple-500" />
                  <span className="text-sm font-medium text-slate-700">{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={activateUltraTrial}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-4 text-base font-black text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-95 active:scale-95">
              <Icon icon="tabler:rocket" className="text-xl" />
              Kích hoạt Ultra miễn phí ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-2 border-purple-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Icon icon="tabler:crown" className="text-xl text-white" />
              </div>
              <div>
                <p className="text-base font-black text-white">Bạn đang dùng Ultra Trial</p>
                <p className="text-xs text-purple-200">
                  {ultraUntil ? `Hết hạn ngày ${formatDate(ultraUntil)}` : 'Đang hoạt động'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 text-center">
            <Icon icon="tabler:check-circle-filled" className="mx-auto mb-2 text-4xl text-purple-500" />
            <p className="font-bold text-midnight_text">Đang tận hưởng đầy đủ tính năng Ultra!</p>
            <p className="mt-1 text-sm text-slate-500">Mọi tính năng đều được mở khóa trong thời gian dùng thử.</p>
          </div>
        </div>
      )}

      {!isPersonal && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <Icon icon="tabler:credit-card" className="mx-auto mb-2 text-2xl text-slate-400" />
          <p className="text-sm font-medium text-slate-500">
            Muốn tiếp tục sau khi hết dùng thử?{' '}
            <a href="/#pricing" className="font-bold text-primary hover:underline">
              Xem các gói trả phí
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
