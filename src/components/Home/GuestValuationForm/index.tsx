'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { vehicleCatalog } from '@/lib/vehicle-catalog-data'
import toast from 'react-hot-toast'
import { isValidVNPhone, normalizeVNPhone } from '@/utils/validatePhone'

interface Brand { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; years: YearEntry[] }
interface YearEntry { year: number; versions: Version[] }
interface Version { name: string; colors: string[] }

const inputClass =
  'w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none placeholder:text-slate-400'

export default function GuestValuationForm() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [years, setYears] = useState<YearEntry[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [colors, setColors] = useState<string[]>([])

  const [fullName, setFullName] = useState('')
  const [intent, setIntent] = useState<'mua' | 'ban' | ''>('')
  const [phone, setPhone] = useState('')

  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [mileage, setMileage] = useState('')

  const [price, setPrice] = useState<number | null>(null)
  const [priceLow, setPriceLow] = useState<number | null>(null)
  const [priceHigh, setPriceHigh] = useState<number | null>(null)
  const [explanation, setExplanation] = useState('')
  const [valuationLoading, setValuationLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [lastLead, setLastLead] = useState({ fullName: '', intent: '', phone: '' })

  useEffect(() => {
    setBrands(vehicleCatalog.brands)
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find((b) => b.id === selectedBrand)
      setModels(brand ? brand.models : [])
      setSelectedModel('')
      setYears([])
      setVersions([])
      setColors([])
      setSelectedYear('')
      setSelectedVersion('')
      setSelectedColor('')
      resetPrice()
    }
  }, [selectedBrand, brands])

  useEffect(() => {
    if (selectedModel) {
      const model = models.find((m) => m.id === selectedModel)
      setYears(model ? model.years : [])
      setSelectedYear('')
      setVersions([])
      setColors([])
      setSelectedVersion('')
      setSelectedColor('')
      resetPrice()
    }
  }, [selectedModel, models])

  useEffect(() => {
    if (selectedYear) {
      const yearEnt = years.find((y) => y.year.toString() === selectedYear)
      setVersions(yearEnt ? yearEnt.versions : [])
      setSelectedVersion('')
      setColors([])
      setSelectedColor('')
      resetPrice()
    }
  }, [selectedYear, years])

  useEffect(() => {
    if (selectedVersion) {
      const ver = versions.find((v) => v.name === selectedVersion)
      setColors(ver ? ver.colors : [])
      setSelectedColor('')
      resetPrice()
    }
  }, [selectedVersion, versions])

  const resetPrice = () => {
    setPrice(null)
    setPriceLow(null)
    setPriceHigh(null)
    setExplanation('')
  }

  const getBrandName = () => brands.find((b) => b.id === selectedBrand)?.name ?? selectedBrand
  const getModelName = () => models.find((m) => m.id === selectedModel)?.name ?? selectedModel

  const validateCar = () => {
    if (!selectedBrand || !selectedModel || !selectedYear || !selectedVersion || !selectedColor || !mileage) {
      toast.error('Vui lòng chọn đầy đủ thông tin xe và số km')
      return false
    }
    return true
  }

  const validateGuest = () => {
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return false
    }
    if (!intent) {
      toast.error('Vui lòng chọn bạn muốn mua hay bán xe')
      return false
    }
    if (!isValidVNPhone(phone)) {
      toast.error('Số điện thoại không hợp lệ (vd: 0901234567 — 10 số)')
      return false
    }
    return true
  }

  const handleValuateClick = () => {
    if (!validateCar()) return
    setShowContactModal(true)
  }

  const handleContactConfirm = () => {
    if (!validateGuest()) return
    setShowContactModal(false)
    void calcPrice()
  }

  const calcPrice = async () => {

    setValuationLoading(true)
    resetPrice()

    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: getBrandName(),
          model: getModelName(),
          year: parseInt(selectedYear, 10),
          color: selectedColor,
          mileage: parseInt(String(mileage).replace(/\D/g, ''), 10) || 0,
          intent,
        }),
      })
      const resData = await res.json()

      if (!res.ok) {
        toast.error(resData.error || 'Không thể định giá. Vui lòng thử lại.')
        return
      }

      setPrice(resData.price ?? null)
      setPriceLow(resData.priceLow ?? null)
      setPriceHigh(resData.priceHigh ?? null)
      setExplanation(resData.explanation || '')

      const leadPayload = {
        fullName: fullName.trim(),
        phone: normalizeVNPhone(phone),
        intent,
        brand: getBrandName(),
        model: getModelName(),
        year: parseInt(selectedYear, 10),
        version: selectedVersion,
        color: selectedColor,
        mileage: parseInt(String(mileage).replace(/\D/g, ''), 10) || 0,
        price: resData.price,
        priceLow: resData.priceLow,
        priceHigh: resData.priceHigh,
        explanation: resData.explanation,
        source: resData.source,
      }

      setLastLead({
        fullName: leadPayload.fullName,
        intent: leadPayload.intent,
        phone: leadPayload.phone,
      })

      const leadRes = await fetch('/api/guest-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      })
      const leadData = await leadRes.json().catch(() => ({}))

      setShowResultModal(true)

      if (leadRes.ok && leadData.saved) {
        toast.success('Định giá thành công — đã lưu hồ sơ cho doanh nghiệp')
      } else {
        toast.success('Định giá thành công')
        toast.error(
          leadData.error ||
            'Chưa lưu được hồ sơ lên database. Kiểm tra SUPABASE_SERVICE_ROLE_KEY và bảng guest_leads.'
        )
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setValuationLoading(false)
    }
  }

  const intentLabel = intent === 'mua' ? 'Mua xe' : intent === 'ban' ? 'Bán xe' : ''

  return (
    <>
      <section id="valuation" className="relative z-10 -mt-6 scroll-mt-28 pb-16 lg:-mt-8 lg:pb-20">
        <div className="container px-4">
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] lg:p-10">
            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />

            <div className="relative z-10 mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <Icon icon="tabler:sparkles" className="text-sm" />
                Bắt đầu ngay
              </span>
              <h2 className="text-3xl font-black text-midnight_text md:text-4xl">
                Định giá <span className="text-primary">miễn phí</span>
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                Chọn xe → bấm xem kết quả → điền liên hệ ngắn để nhận báo cáo giá.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
              <div className="lg:col-span-7 space-y-5">
                <p className="text-sm font-bold text-slate-600">Thông tin xe cần định giá</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Hãng xe', value: selectedBrand, onChange: setSelectedBrand, options: brands.map((b) => ({ v: b.id, l: b.name })), disabled: false },
                    { label: 'Dòng xe', value: selectedModel, onChange: setSelectedModel, options: models.map((m) => ({ v: m.id, l: m.name })), disabled: !models.length },
                    { label: 'Năm SX', value: selectedYear, onChange: setSelectedYear, options: years.map((y) => ({ v: String(y.year), l: String(y.year) })), disabled: !years.length },
                    { label: 'Phiên bản', value: selectedVersion, onChange: setSelectedVersion, options: versions.map((v) => ({ v: v.name, l: v.name })), disabled: !versions.length },
                    { label: 'Màu', value: selectedColor, onChange: setSelectedColor, options: colors.map((c) => ({ v: c, l: c })), disabled: !colors.length },
                  ].map((field) => (
                    <div key={field.label} className="relative">
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={field.disabled}
                        style={{ colorScheme: 'light' }}
                        className={`${inputClass} disabled:opacity-50`}>
                        <option value="">{field.label}</option>
                        {field.options.map((o) => (
                          <option key={o.v} value={o.v}>
                            {o.l}
                          </option>
                        ))}
                      </select>
                      <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                    </div>
                  ))}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Số km đã đi (vd: 50000)"
                      min="0"
                      max="999999"
                      inputMode="numeric"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className={inputClass}
                    />
                    <Icon icon="tabler:road" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleValuateClick}
                  disabled={valuationLoading}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-60">
                  {valuationLoading ? (
                    <>
                      <Icon icon="tabler:loader" className="animate-spin text-xl" />
                      Đang định giá...
                    </>
                  ) : (
                    <>
                      <Icon icon="tabler:calculator" className="text-xl" />
                      Xem kết quả định giá
                    </>
                  )}
                </button>
              </div>

              <div className="min-h-[280px] lg:col-span-5">
                {valuationLoading ? (
                  /* ── LOADING ── */
                  <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-slate-50 p-8">
                    <div className="text-center">
                      <div className="relative mx-auto mb-5 h-16 w-16">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
                        <Icon icon="tabler:car" className="absolute inset-0 m-auto text-2xl text-primary/50" />
                      </div>
                      <p className="font-bold text-slate-700">Đang phân tích thị trường…</p>
                      <p className="mt-1 text-xs text-slate-400">AI đang tính toán khoảng giá tham chiếu</p>
                    </div>
                  </div>

                ) : price !== null || priceLow != null ? (
                  /* ── KẾT QUẢ ── */
                  <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-blue-50 to-blue-100/50">
                    {/* decorative blobs */}
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-blue-300/20 blur-xl" />

                    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                      {/* badge */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                        <Icon icon="tabler:sparkles" className="text-sm" />
                        Kết quả AI định giá
                      </span>

                      {/* price */}
                      <div>
                        <p className="text-xs font-medium text-slate-500">Khoảng giá tham chiếu</p>
                        <p className="mt-1 text-[2.6rem] font-black leading-none tracking-tight text-midnight_text">
                          {priceLow != null && priceHigh != null
                            ? `${(priceLow / 1e6).toFixed(0)}–${(priceHigh / 1e6).toFixed(0)}`
                            : price != null
                              ? (price / 1e6).toFixed(0)
                              : '—'}
                          <span className="ml-1 text-xl font-semibold text-slate-400">triệu</span>
                        </p>
                        {priceLow != null && priceHigh != null && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {priceLow.toLocaleString('vi-VN')} – {priceHigh.toLocaleString('vi-VN')} đ
                          </p>
                        )}
                      </div>

                      {/* range bar */}
                      {priceLow != null && priceHigh != null && (
                        <div className="w-40 overflow-hidden rounded-full bg-blue-100/80 h-1.5">
                          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-blue-400" />
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => setShowResultModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:scale-[1.03]">
                        <Icon icon="tabler:file-analytics" className="text-base" />
                        Xem báo cáo đầy đủ
                      </button>
                    </div>
                  </div>

                ) : (
                  /* ── PLACEHOLDER ── */
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                      <Icon icon="tabler:car" className="text-3xl text-blue-300" />
                    </div>
                    <p className="font-semibold text-slate-500">Kết quả hiển thị tại đây</p>
                    <p className="mt-1 text-xs text-slate-400">Chọn đủ thông tin xe rồi bấm định giá</p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400">
                      {['Chọn xe', 'Điền liên hệ', 'Xem giá'].map((step, i) => (
                        <span key={step} className="flex items-center gap-2">
                          {i > 0 && <span className="text-slate-300">›</span>}
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                          </span>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Đóng">
              ✕
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Icon icon="tabler:user-check" className="text-2xl text-primary" />
              </div>
              <h3 className="text-xl font-black text-midnight_text">Thông tin của bạn</h3>
              <p className="text-sm text-slate-500 mt-1">
                Cần để xem kết quả định giá và đối tác có thể liên hệ tư vấn.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                  Bạn muốn <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={intent}
                    onChange={(e) => setIntent(e.target.value as 'mua' | 'ban' | '')}
                    className={inputClass}>
                    <option value="">Chọn mua hoặc bán</option>
                    <option value="mua">Mua xe</option>
                    <option value="ban">Bán xe</option>
                  </select>
                  <Icon
                    icon="tabler:chevron-down"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  maxLength={11}
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 mt-1">10 số — bắt đầu 03x / 07x / 08x / 09x</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                Hủy
              </button>
              <button
                type="button"
                onClick={handleContactConfirm}
                disabled={valuationLoading}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-primary hover:opacity-90 disabled:opacity-60">
                Xem kết quả
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Đóng">
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="tabler:circle-check" className="text-4xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-midnight_text">Kết quả định giá</h3>
              <p className="text-sm text-slate-500 mt-2">
                {lastLead.fullName} · {intentLabel} · {lastLead.phone}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/60 border border-primary/20 mb-6">
              <p className="text-sm text-gray-600 text-center mb-1">Khoảng giá tham chiếu</p>
              {priceLow != null && priceHigh != null ? (
                <>
                  <p className="text-3xl font-black text-primary text-center">
                    {(priceLow / 1e6).toFixed(0)} – {(priceHigh / 1e6).toFixed(0)} triệu VNĐ
                  </p>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    {priceLow.toLocaleString('vi-VN')} – {priceHigh.toLocaleString('vi-VN')} đ
                  </p>
                </>
              ) : price != null ? (
                <p className="text-3xl font-black text-primary text-center">
                  {price.toLocaleString('vi-VN')} đ
                </p>
              ) : null}
            </div>

            <div className="mb-4 text-sm">
              <p className="font-bold text-midnight_text mb-2">Xe:</p>
              <p className="text-slate-600">
                {getBrandName()} {getModelName()} · {selectedYear} · {selectedVersion} · {selectedColor} ·{' '}
                {Number(mileage).toLocaleString('vi-VN')} km
              </p>
            </div>

            {explanation && (
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-primary text-sm mb-2">Lý do định giá</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{explanation}</p>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mb-4">
              Thông tin của bạn đã được gửi tới hệ thống. Đối tác showroom có thể liên hệ qua số điện thoại đã để lại.
            </p>

            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-primary hover:opacity-90">
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  )
}
