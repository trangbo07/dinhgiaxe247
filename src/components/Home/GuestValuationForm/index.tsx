'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import data from '../../../../data.json'
import toast from 'react-hot-toast'

interface Brand { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; years: YearEntry[] }
interface YearEntry { year: number; versions: Version[] }
interface Version { name: string; colors: string[] }

const inputClass =
  'w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none'

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
    setBrands(data.brands)
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
    const phoneNorm = phone.trim().replace(/\s/g, '').replace(/^\+84/, '0')
    if (!/^0[0-9]{9,10}$/.test(phoneNorm)) {
      toast.error('Số điện thoại không hợp lệ (vd: 0901234567)')
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
        phone: phone.trim(),
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
                      placeholder="Số km đã đi"
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
                  <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-8">
                    <div className="text-center">
                      <Icon icon="tabler:loader" className="mx-auto text-5xl text-primary animate-spin" />
                      <p className="mt-4 font-semibold text-gray-600">Đang phân tích thị trường...</p>
                    </div>
                  </div>
                ) : price !== null || priceLow != null ? (
                  <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-8">
                  <div className="text-center w-full">
                    <p className="text-sm text-emerald-600 font-semibold mb-2">✓ Đã có kết quả — bấm xem chi tiết</p>
                    <p className="text-3xl font-black text-primary">
                      {priceLow != null && priceHigh != null
                        ? `${(priceLow / 1e6).toFixed(0)} – ${(priceHigh / 1e6).toFixed(0)} triệu`
                        : price != null
                          ? `${(price / 1e6).toFixed(0)} triệu`
                          : '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowResultModal(true)}
                      className="mt-4 text-primary font-bold underline">
                      Mở báo cáo đầy đủ
                    </button>
                  </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 p-8 text-center text-gray-400">
                    <Icon icon="tabler:car" className="mx-auto text-6xl text-gray-300" />
                    <p className="mt-4 font-medium">Điền form bên trái để nhận giá tham chiếu</p>
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="tabler:circle-check" className="text-4xl text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-midnight_text">Kết quả định giá</h3>
              <p className="text-sm text-slate-500 mt-2">
                {lastLead.fullName} · {intentLabel} · {lastLead.phone}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/20 mb-6">
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
