'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import WorldCupSectionDecor from '@/components/WorldCupSectionDecor'
import {
  USED_CAR_CHECKLIST,
  type CheckStatus,
  computeChecklistDiscount,
  applyDiscountToPrice,
} from '@/lib/used-car-checklist'

const STATUS_OPTIONS: { value: CheckStatus; label: string; color: string }[] = [
  { value: 'ok', label: 'Tốt / Zin', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { value: 'minor', label: 'Vấn đề nhẹ', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { value: 'major', label: 'Vấn đề nặng', color: 'border-red-200 bg-red-50 text-red-800' },
  { value: 'unknown', label: 'Chưa kiểm', color: 'border-slate-200 bg-slate-50 text-slate-600' },
]

type Props = {
  /** Giá tham chiếu từ định giá (triệu VND hoặc VND) — nếu có sẽ tính giá sau khấu trừ */
  basePriceLow?: number | null
  basePriceHigh?: number | null
  embedded?: boolean
}

export default function UsedCarChecklist({ basePriceLow, basePriceHigh, embedded }: Props) {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({})

  const { totalPct, items: issueItems } = useMemo(
    () => computeChecklistDiscount(statuses),
    [statuses]
  )

  const midBase = useMemo(() => {
    if (basePriceLow != null && basePriceHigh != null) {
      return Math.round((basePriceLow + basePriceHigh) / 2)
    }
    return basePriceLow ?? basePriceHigh ?? null
  }, [basePriceLow, basePriceHigh])

  const adjustedLow =
    basePriceLow != null ? applyDiscountToPrice(basePriceLow, totalPct) : null
  const adjustedHigh =
    basePriceHigh != null ? applyDiscountToPrice(basePriceHigh, totalPct) : null
  const adjustedMid = midBase != null ? applyDiscountToPrice(midBase, totalPct) : null

  const checkedCount = Object.values(statuses).filter((s) => s !== 'unknown').length
  const okCount = Object.values(statuses).filter((s) => s === 'ok').length

  const setStatus = (id: string, status: CheckStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  const content = (
    <div className={embedded ? '' : 'relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:p-10'}>
      {!embedded && <WorldCupSectionDecor variant="trust" strip={false} />}

      <div className={embedded ? '' : 'relative z-10'}>
        {!embedded && (
          <div className="mb-8 text-center">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Icon icon="tabler:clipboard-check" />
              Miễn phí · Không cần đăng nhập
            </span>
            <h2 className="text-2xl font-black text-midnight_text sm:text-3xl">
              Checklist kiểm tra xe cũ
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
              Đánh dấu từng hạng mục khi xem xe — hệ thống gợi ý mức giảm giá thương lượng hợp lý.
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-midnight_text">
              Đã kiểm: {checkedCount}/{USED_CAR_CHECKLIST.length}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-medium">{okCount} mục tốt</span>
          </div>
          <div className="h-2 flex-1 min-w-[120px] max-w-xs overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${(checkedCount / USED_CAR_CHECKLIST.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USED_CAR_CHECKLIST.map((item) => {
            const status = statuses[item.id] ?? 'unknown'
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon icon={item.icon} className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {item.category}
                    </p>
                    <p className="font-bold text-midnight_text">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{item.hint}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(item.id, opt.value)}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                        status === opt.value
                          ? opt.color + ' ring-2 ring-primary/20'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                      {opt.value === 'minor' && ` −${item.minorPct}%`}
                      {opt.value === 'major' && ` −${item.majorPct}%`}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
            <div className="flex items-center gap-2 text-amber-800">
              <Icon icon="tabler:discount-2" className="text-xl" />
              <p className="font-black">Tổng khấu trừ gợi ý</p>
            </div>
            <p className="mt-2 text-4xl font-black text-amber-900">{totalPct}%</p>
            <p className="mt-1 text-xs text-amber-700/80">
              Tối đa 45% — cộng dồn từ các hạng mục có vấn đề
            </p>
            {issueItems.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-xs text-amber-900/90">
                {issueItems.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span>{i.title}</span>
                    <span className="font-bold shrink-0">−{i.pct}%</span>
                  </li>
                ))}
              </ul>
            )}
            {issueItems.length === 0 && (
              <p className="mt-3 text-sm text-amber-800/70">
                Chọn trạng thái từng mục để xem gợi ý giảm giá.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-5">
            <div className="flex items-center gap-2 text-primary">
              <Icon icon="tabler:calculator" className="text-xl" />
              <p className="font-black">Giá sau thương lượng</p>
            </div>
            {midBase != null && adjustedMid != null ? (
              <>
                <p className="mt-2 text-sm text-slate-500">Tham chiếu ban đầu</p>
                <p className="text-lg font-bold text-slate-600 line-through decoration-slate-400">
                  {basePriceLow != null && basePriceHigh != null
                    ? `${(basePriceLow / 1e6).toFixed(0)}–${(basePriceHigh / 1e6).toFixed(0)} triệu`
                    : `${(midBase / 1e6).toFixed(0)} triệu`}
                </p>
                <p className="mt-3 text-sm font-medium text-primary">Nên chốt khoảng</p>
                <p className="text-3xl font-black text-midnight_text">
                  {adjustedLow != null && adjustedHigh != null
                    ? `${(adjustedLow / 1e6).toFixed(0)}–${(adjustedHigh / 1e6).toFixed(0)}`
                    : (adjustedMid / 1e6).toFixed(0)}
                  <span className="ml-1 text-lg font-semibold text-slate-400">triệu</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Tiết kiệm ước tính{' '}
                  <b className="text-emerald-700">
                    {((midBase - adjustedMid) / 1e6).toFixed(0)} triệu
                  </b>{' '}
                  so với giá tham chiếu
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                <Icon icon="tabler:arrow-up" className="mr-1 inline text-primary" />
                <Link href="/#valuation" className="font-semibold text-primary hover:underline">
                  Định giá xe trước
                </Link>
                {' '}— checklist sẽ tự tính giá sau khi thương lượng (lưu từ lần định giá gần nhất).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) return content

  return (
    <section className="relative py-12 lg:py-16">
      <div className="container px-4">{content}</div>
    </section>
  )
}
