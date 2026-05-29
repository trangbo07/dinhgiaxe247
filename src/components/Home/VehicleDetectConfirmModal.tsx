'use client'

import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
  parseYearRange,
  type VehicleDetectResponse,
  type VehicleMatchOption,
} from '@/lib/vehicle-recognition'

type Props = {
  open: boolean
  detection: VehicleDetectResponse | null
  onClose: () => void
  onConfirm: (payload: {
    brand: string
    model: string
    year: number
    version?: string
    color?: string
    generation?: string
    body_type?: string
    mileage?: number
    aiConfidence: number
  }) => void | Promise<void>
  confirmLoading?: boolean
}

function getInitialMatch(detection: VehicleDetectResponse): VehicleMatchOption | null {
  if (!detection.success) return null
  if (detection.mode === 'single_result') {
    return {
      brand: detection.vehicle.brand,
      model: detection.vehicle.model,
      generation: detection.vehicle.generation,
      version: detection.vehicle.version,
      year_range: detection.vehicle.year_range,
      body_type: detection.vehicle.body_type,
      color: detection.vehicle.color,
      confidence: detection.confidence,
    }
  }
  return detection.possible_matches[0] ?? null
}

export default function VehicleDetectConfirmModal({
  open,
  detection,
  onClose,
  onConfirm,
  confirmLoading = false,
}: Props) {
  const [matchIndex, setMatchIndex] = useState(0)
  const [selectedYear, setSelectedYear] = useState('')
  const [mileageInput, setMileageInput] = useState('')

  const matches = useMemo(() => {
    if (!detection?.success) return []
    if (detection.mode === 'multiple_options') return detection.possible_matches
    if (detection.mode === 'single_result') {
      return [
        {
          brand: detection.vehicle.brand,
          model: detection.vehicle.model,
          generation: detection.vehicle.generation,
          version: detection.vehicle.version,
          year_range: detection.vehicle.year_range,
          body_type: detection.vehicle.body_type,
          color: detection.vehicle.color,
          confidence: detection.confidence,
        },
      ]
    }
    return []
  }, [detection])

  const activeMatch = matches[matchIndex] ?? null
  const yearOptions = useMemo(
    () => (activeMatch ? parseYearRange(activeMatch.year_range) : []),
    [activeMatch]
  )

  useEffect(() => {
    if (!open || !detection?.success) return
    setMatchIndex(0)
    setMileageInput('')
    const m = getInitialMatch(detection)
    const years = m ? parseYearRange(m.year_range) : []
    setSelectedYear(years[0] != null ? String(years[0]) : '')
  }, [open, detection])

  useEffect(() => {
    if (!activeMatch) return
    const years = parseYearRange(activeMatch.year_range)
    if (!years.length) {
      setSelectedYear('')
      return
    }
    if (!years.includes(Number(selectedYear))) {
      setSelectedYear(String(years[0]))
    }
  }, [activeMatch, matchIndex, selectedYear])

  if (!open || !detection) return null

  if (!detection.success) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-midnight_text">Không nhận diện được xe</h2>
          <p className="mt-2 text-sm text-slate-600">{detection.message}</p>
          {detection.reasons?.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-500">
              {detection.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-700">
            Đóng
          </button>
        </div>
      </div>
    )
  }

  const aiConfidence =
    detection.mode === 'single_result'
      ? detection.confidence
      : activeMatch?.confidence ?? detection.confidence

  const reasons =
    detection.mode === 'multiple_options' ? detection.reason : undefined

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-midnight_text">Xác nhận thông tin xe</h2>
              <p className="mt-1 text-xs text-slate-500">
                AI độ tin cậy {aiConfidence}% — chọn năm rồi định giá ngay (không cần điền form).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Đóng">
              <Icon icon="tabler:x" className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {detection.mode === 'multiple_options' && matches.length > 1 && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-midnight_text">
                Chọn xe khớp nhất
              </label>
              <select
                value={matchIndex}
                onChange={(e) => setMatchIndex(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                {matches.map((m, i) => (
                  <option key={i} value={i}>
                    {m.brand} {m.model}
                    {m.version ? ` · ${m.version}` : ''} ({m.confidence ?? '?'}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeMatch && (
            <div className="rounded-xl bg-blue-50/80 p-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>
                  <span className="text-slate-500">Hãng:</span>{' '}
                  <strong>{activeMatch.brand}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Dòng:</span>{' '}
                  <strong>{activeMatch.model}</strong>
                </p>
                {activeMatch.generation && (
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Thế hệ:</span>{' '}
                    <strong>{activeMatch.generation}</strong>
                  </p>
                )}
                {activeMatch.version && (
                  <p>
                    <span className="text-slate-500">Phiên bản:</span>{' '}
                    <strong>{activeMatch.version}</strong>
                  </p>
                )}
                {activeMatch.body_type && (
                  <p>
                    <span className="text-slate-500">Kiểu dáng:</span>{' '}
                    <strong>{activeMatch.body_type}</strong>
                  </p>
                )}
                {activeMatch.color && (
                  <p>
                    <span className="text-slate-500">Màu (AI):</span>{' '}
                    <strong>{activeMatch.color}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-midnight_text">
              Năm sản xuất <span className="text-red-500">*</span>
            </label>
            {yearOptions.length > 0 ? (
              <select
                required
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="">— Chọn năm —</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                    {activeMatch?.year_range.includes(String(y)) ? '' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="Nhập năm"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            )}
            {activeMatch?.year_range && (
              <p className="mt-1 text-xs text-slate-500">
                AI gợi ý khoảng năm: <strong>{activeMatch.year_range}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-midnight_text">
              Số km đã đi <span className="font-normal text-slate-400">(tùy chọn)</span>
            </label>
            <input
              type="number"
              min={0}
              value={mileageInput}
              onChange={(e) => setMileageInput(e.target.value)}
              placeholder="VD: 65000 — bỏ trống nếu chưa biết"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {reasons?.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <p className="font-semibold">Lưu ý từ AI:</p>
              <ul className="mt-1 list-disc pl-4">
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {detection.mode === 'single_result' && detection.analysis?.detected_features?.length ? (
            <p className="text-xs text-slate-500">
              Đặc điểm: {detection.analysis.detected_features.join(', ')}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={confirmLoading}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            Chụp lại ảnh
          </button>
          <button
            type="button"
            disabled={!activeMatch || !selectedYear || confirmLoading}
            onClick={() => {
              if (!activeMatch || !selectedYear || confirmLoading) return
              const km = parseInt(mileageInput.replace(/\D/g, ''), 10)
              void onConfirm({
                brand: activeMatch.brand,
                model: activeMatch.model,
                year: parseInt(selectedYear, 10),
                version: activeMatch.version,
                color: activeMatch.color,
                generation: activeMatch.generation,
                body_type: activeMatch.body_type,
                mileage: Number.isFinite(km) ? km : 0,
                aiConfidence,
              })
            }}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50">
            {confirmLoading ? 'Đang định giá...' : 'Định giá ngay'}
          </button>
        </div>
      </div>
    </div>
  )
}
