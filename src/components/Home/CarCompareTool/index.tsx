'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import WorldCupSectionDecor from '@/components/WorldCupSectionDecor'
import type { CarCompareApiResponse, CarCompareReport, CompareAdvantage } from '@/lib/car-compare-types'
import {
  bumpGuestCompareUsage,
  getGuestCompareQuota,
  getOrCreateDeviceId,
  syncGuestCompareUsage,
} from '@/lib/device-id-client'
import {
  vehicleCatalog,
  getBrandName,
  getModelName,
  getModelsForBrand,
  getYearsForModel,
  getVersionsForYear,
  getColorsForVersion,
  type CarSelection,
} from '@/lib/car-catalog-helpers'

const inputClass =
  'w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'

function CarSelectorPanel({
  label,
  accent,
  sel,
  onChange,
}: {
  label: string
  accent: 'blue' | 'violet'
  sel: CarSelection
  onChange: (patch: Partial<CarSelection>) => void
}) {
  const models = sel.brandId ? getModelsForBrand(sel.brandId) : []
  const years = sel.brandId && sel.modelId ? getYearsForModel(sel.brandId, sel.modelId) : []
  const versions =
    sel.brandId && sel.modelId && sel.year
      ? getVersionsForYear(sel.brandId, sel.modelId, sel.year)
      : []
  const colors =
    sel.brandId && sel.modelId && sel.year && sel.version
      ? getColorsForVersion(sel.brandId, sel.modelId, sel.year, sel.version)
      : []

  const accentRing = accent === 'blue' ? 'ring-blue-200 border-blue-200' : 'ring-violet-200 border-violet-200'
  const accentBadge = accent === 'blue' ? 'bg-blue-600' : 'bg-violet-600'

  return (
    <div className={`rounded-2xl border-2 bg-white p-5 shadow-sm ring-4 ring-opacity-30 ${accentRing}`}>
      <div className="mb-4 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white ${accentBadge}`}>
          {label}
        </span>
        <p className="font-black text-midnight_text">Xe {label}</p>
      </div>
      <div className="space-y-3">
        <select
          value={sel.brandId}
          onChange={(e) =>
            onChange({
              brandId: e.target.value,
              modelId: '',
              year: '',
              version: '',
              color: '',
            })
          }
          className={inputClass}
        >
          <option value="">Hãng xe</option>
          {vehicleCatalog.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={sel.modelId}
          onChange={(e) => onChange({ modelId: e.target.value, year: '', version: '', color: '' })}
          disabled={!models.length}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">Dòng xe</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={sel.year}
            onChange={(e) => onChange({ year: e.target.value, version: '', color: '' })}
            disabled={!years.length}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">Năm</option>
            {years.map((y) => (
              <option key={y.year} value={String(y.year)}>
                {y.year}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Số km"
            value={sel.mileage}
            onChange={(e) => onChange({ mileage: e.target.value.replace(/\D/g, '') })}
            className={inputClass}
          />
        </div>
        <select
          value={sel.version}
          onChange={(e) => onChange({ version: e.target.value, color: '' })}
          disabled={!versions.length}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">Phiên bản</option>
          {versions.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
        <select
          value={sel.color}
          onChange={(e) => onChange({ color: e.target.value })}
          disabled={!colors.length}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">Màu</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function formatMillion(n: number | null) {
  if (n == null) return '—'
  return `${(n / 1e6).toFixed(0)} tr`
}

function advantageStyle(adv: CompareAdvantage, side: 'a' | 'b') {
  const win = (adv === 'A' && side === 'a') || (adv === 'B' && side === 'b')
  if (win) return side === 'a' ? 'bg-blue-50 text-blue-900 ring-2 ring-blue-200' : 'bg-violet-50 text-violet-900 ring-2 ring-violet-200'
  return 'bg-slate-50 text-slate-700'
}

function CompareReportView({
  report,
  labelA,
  labelB,
}: {
  report: CarCompareReport
  labelA: string
  labelB: string
}) {
  const pickColor =
    report.verdict.pick === 'A'
      ? 'from-blue-600 to-indigo-600'
      : report.verdict.pick === 'B'
        ? 'from-violet-600 to-purple-600'
        : 'from-amber-500 to-orange-500'

  return (
    <div className="space-y-6">
      {/* Kết luận */}
      <div className={`overflow-hidden rounded-2xl bg-gradient-to-r ${pickColor} p-6 text-white shadow-lg`}>
        <div className="flex items-start gap-3">
          <Icon icon="tabler:bulb-filled" className="mt-0.5 shrink-0 text-3xl text-amber-200" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Kết luận AI</p>
            <h3 className="mt-1 text-xl font-black sm:text-2xl">{report.verdict.headline}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{report.verdict.summary}</p>
            {report.verdict.priceGapLabel && (
              <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                {report.verdict.priceGapLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bảng so sánh chi tiết */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-slate-500">
          <span className="text-blue-700">Xe A — {labelA}</span>
          <span>Tiêu chí</span>
          <span className="text-violet-700">Xe B — {labelB}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {report.comparisonRows.map((row, idx) => (
            <div key={idx} className="px-3 py-4 sm:px-5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-start sm:gap-4">
                <div className={`rounded-xl px-3 py-2.5 text-center text-sm font-bold ${advantageStyle(row.advantage, 'a')}`}>
                  {row.valueA}
                  {row.advantage === 'A' && (
                    <Icon icon="tabler:crown" className="ml-1 inline text-amber-500" />
                  )}
                </div>
                <div className="text-center sm:min-w-[120px]">
                  <p className="text-sm font-black text-midnight_text">{row.criteria}</p>
                  <p className="mt-0.5 text-xs font-semibold text-primary">Δ {row.gap}</p>
                </div>
                <div className={`rounded-xl px-3 py-2.5 text-center text-sm font-bold ${advantageStyle(row.advantage, 'b')}`}>
                  {row.valueB}
                  {row.advantage === 'B' && (
                    <Icon icon="tabler:crown" className="ml-1 inline text-amber-500" />
                  )}
                </div>
              </div>
              <p className="mt-2 text-center text-xs leading-relaxed text-slate-500 sm:text-left">
                {row.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Phân tích chi tiết */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalysisCard
          title="Phân tích chênh lệch giá"
          icon="tabler:currency-dong"
          color="blue"
          text={report.priceAnalysis}
        />
        <AnalysisCard
          title="So sánh kỹ thuật & phiên bản"
          icon="tabler:engine"
          color="violet"
          text={report.technicalAnalysis}
        />
        <AnalysisCard
          title="Chi phí sở hữu ước tính"
          icon="tabler:receipt"
          color="slate"
          text={report.ownershipCost}
        />
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon icon="tabler:alert-triangle" className="text-xl text-amber-600" />
            <p className="font-black text-amber-900">Rủi ro cần kiểm tra</p>
          </div>
          <ul className="space-y-2">
            {report.risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-900/90">
                <Icon icon="tabler:point-filled" className="mt-1 shrink-0 text-amber-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Thương lượng */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <p className="mb-2 text-xs font-black uppercase text-blue-700">Thương lượng xe A</p>
          <p className="text-sm leading-relaxed text-slate-700">{report.negotiationA}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
          <p className="mb-2 text-xs font-black uppercase text-violet-700">Thương lượng xe B</p>
          <p className="text-sm leading-relaxed text-slate-700">{report.negotiationB}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <Icon icon="tabler:checklist" className="mx-auto text-2xl text-emerald-600" />
        <p className="mt-2 text-sm font-bold leading-relaxed text-emerald-900">{report.finalAdvice}</p>
      </div>
    </div>
  )
}

function AnalysisCard({
  title,
  icon,
  color,
  text,
}: {
  title: string
  icon: string
  color: 'blue' | 'violet' | 'slate'
  text: string
}) {
  const border =
    color === 'blue' ? 'border-blue-100' : color === 'violet' ? 'border-violet-100' : 'border-slate-200'
  const bg =
    color === 'blue' ? 'bg-blue-50/40' : color === 'violet' ? 'bg-violet-50/40' : 'bg-slate-50'
  const titleColor =
    color === 'blue' ? 'text-blue-700' : color === 'violet' ? 'text-violet-700' : 'text-slate-700'

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon icon={icon} className={`text-xl ${titleColor}`} />
        <p className={`font-black ${titleColor}`}>{title}</p>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{text}</p>
    </div>
  )
}

const emptySel = (): CarSelection => ({
  brandId: '',
  modelId: '',
  year: '',
  version: '',
  color: '',
  mileage: '',
})

function toPayload(sel: CarSelection, label: string) {
  return {
    brand: getBrandName(sel.brandId),
    model: getModelName(sel.brandId, sel.modelId),
    year: parseInt(sel.year, 10),
    version: sel.version,
    color: sel.color,
    mileage: parseInt(sel.mileage, 10) || 0,
    label,
  }
}

export default function CarCompareTool() {
  const [carA, setCarA] = useState<CarSelection>(emptySel())
  const [carB, setCarB] = useState<CarSelection>(emptySel())
  const [compareData, setCompareData] = useState<CarCompareApiResponse | null>(null)
  const [comparing, setComparing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [compareQuota, setCompareQuota] = useState(() => getGuestCompareQuota())

  useEffect(() => {
    setCompareQuota(getGuestCompareQuota())
  }, [])

  const validate = (sel: CarSelection) =>
    sel.brandId && sel.modelId && sel.year && sel.version && sel.color && sel.mileage

  const labelA = `${getBrandName(carA.brandId)} ${getModelName(carA.brandId, carA.modelId)}`
  const labelB = `${getBrandName(carB.brandId)} ${getModelName(carB.brandId, carB.modelId)}`

  const handleCompare = async () => {
    setFormError(null)
    let shownError = false

    if (!validate(carA) || !validate(carB)) {
      const msg = 'Vui lòng chọn đầy đủ thông tin cho cả hai xe'
      setFormError(msg)
      toast.error(msg)
      return
    }

    if (compareQuota.remaining <= 0) {
      const msg = `Bạn đã dùng hết ${compareQuota.max} lượt so sánh trên thiết bị này trong tháng.`
      setFormError(msg)
      toast.error(msg)
      return
    }

    setComparing(true)
    setCompareData(null)
    try {
      const res = await fetch('/api/valuation/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: getOrCreateDeviceId(),
          carA: toPayload(carA, labelA),
          carB: toPayload(carB, labelB),
          intent: 'mua',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.compareQuota) {
          setCompareQuota(data.compareQuota)
          syncGuestCompareUsage(data.compareQuota.used)
        }
        const msg = data.retryAfterSeconds
          ? `${data.error} (chờ ${data.retryAfterSeconds}s)`
          : data.error || 'Lỗi so sánh'
        setFormError(msg)
        shownError = true
        throw new Error(msg)
      }
      if (data.compareQuota) {
        setCompareQuota(data.compareQuota)
        syncGuestCompareUsage(data.compareQuota.used)
      } else {
        bumpGuestCompareUsage()
        setCompareQuota(getGuestCompareQuota())
      }
      setCompareData(data as CarCompareApiResponse)
      toast.success('Báo cáo so sánh chi tiết đã sẵn sàng!')
    } catch (e) {
      if (!shownError) {
        toast.error(e instanceof Error ? e.message : 'Không thể so sánh. Thử lại sau.')
      }
    } finally {
      setComparing(false)
    }
  }

  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <WorldCupSectionDecor variant="features" />
      <div className="container relative z-10 px-4">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-8 text-center text-white lg:px-10">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Icon icon="tabler:arrows-diff" />
              So sánh 2 dòng xe
            </span>
            <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">
              Xe A vs Xe B — báo cáo AI chi tiết
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
              Định giá cả hai xe và nhận bảng so sánh từng tiêu chí, chênh lệch giá, rủi ro & gợi ý thương lượng.
            </p>
            <p className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              <Icon icon="tabler:device-mobile" />
              Còn {compareQuota.remaining}/{compareQuota.max} lượt so sánh trên thiết bị này (tháng này)
            </p>
          </div>

          <div className="p-6 lg:p-10">
            {formError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {formError}
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <CarSelectorPanel
                label="A"
                accent="blue"
                sel={carA}
                onChange={(p) => setCarA((s) => ({ ...s, ...p }))}
              />
              <CarSelectorPanel
                label="B"
                accent="violet"
                sel={carB}
                onChange={(p) => setCarB((s) => ({ ...s, ...p }))}
              />
            </div>

            <button
              type="button"
              onClick={handleCompare}
              disabled={comparing || compareQuota.remaining <= 0}
              className="mx-auto mt-8 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-4 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-60 sm:text-base"
            >
              {comparing ? (
                <>
                  <Icon icon="tabler:loader" className="animate-spin text-xl" />
                  Đang định giá & phân tích AI…
                </>
              ) : (
                <>
                  <Icon icon="tabler:scale" className="text-xl" />
                  So sánh chi tiết
                </>
              )}
            </button>

            {compareData && (
              <div className="mt-10 animate-[fadeIn_0.4s_ease-out]">
                <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="rounded-2xl bg-blue-50 p-4 text-center">
                    <p className="text-xs font-bold text-blue-600">XE A</p>
                    <p className="mt-1 font-black text-midnight_text">{labelA}</p>
                    <p className="mt-1 text-sm font-bold text-blue-800">
                      {formatMillion(compareData.carA.priceLow)} – {formatMillion(compareData.carA.priceHigh)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {carA.year} · {carA.version} · {Number(carA.mileage).toLocaleString('vi-VN')} km
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-white shadow-lg">
                    VS
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-4 text-center">
                    <p className="text-xs font-bold text-violet-600">XE B</p>
                    <p className="mt-1 font-black text-midnight_text">{labelB}</p>
                    <p className="mt-1 text-sm font-bold text-violet-800">
                      {formatMillion(compareData.carB.priceLow)} – {formatMillion(compareData.carB.priceHigh)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {carB.year} · {carB.version} · {Number(carB.mileage).toLocaleString('vi-VN')} km
                    </p>
                  </div>
                </div>

                <CompareReportView
                  report={compareData.report}
                  labelA={labelA}
                  labelB={labelB}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
