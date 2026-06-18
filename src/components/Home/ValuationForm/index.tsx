'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { vehicleCatalog } from '@/lib/vehicle-catalog-data'
import { plansData } from '@/types/plans'
import { useWallet } from '@/app/Providers'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import ExpertChatWidget from '@/components/Support/ExpertChatWidget'
import VehicleDetectConfirmModal from '@/components/Home/VehicleDetectConfirmModal'
import type { VehicleDetectResponse } from '@/lib/vehicle-recognition'
import { mapColorToCatalog } from '@/lib/vehicle-recognition'
import {
  findBrand,
  findModel,
  findVersion,
} from '@/lib/vehicle-catalog-match'
import { PERSONAL_PLAN, formatValuationQuota } from '@/lib/plan-limits'

interface Brand { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; years: YearEntry[] }
interface YearEntry { year: number; versions: Version[] }
interface Version { name: string; colors: string[] }

type ValuationFormProps = {
  variant?: 'default' | 'dashboard'
  onValuationSaved?: () => void
}

const ValuationForm = ({ variant = 'default', onValuationSaved }: ValuationFormProps) => {
  const isDashboard = variant === 'dashboard'
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [years, setYears] = useState<YearEntry[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [colors, setColors] = useState<string[]>([])

  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [mileage, setMileage] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const [priceLow, setPriceLow] = useState<number | null>(null)
  const [priceHigh, setPriceHigh] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [explanation, setExplanation] = useState<string>('')
  const [valuationLoading, setValuationLoading] = useState(false)
  const [showPackages, setShowPackages] = useState(false)
  const [plans, setPlans] = useState<plansData[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'monthly' | 'yearly'>('yearly')
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showImageDetectConfirm, setShowImageDetectConfirm] = useState(false)
  const [aiDetection, setAiDetection] = useState<VehicleDetectResponse | null>(null)
  const [imageDetectLoading, setImageDetectLoading] = useState(false)
  const [skipCascadeReset, setSkipCascadeReset] = useState(false)
  const [showProRequiredModal, setShowProRequiredModal] = useState(false)
  const [proModalMessage, setProModalMessage] = useState('')

  const {
    isPro,
    accountType,
    planName,
    maxValuationsPerMonth,
    canUseValuation,
    consumeValuationUse,
    remainingFreeValuations,
    syncFreeUsageForUser,
  } = useWallet()
  const { data: session } = useSession()
  const [businessAccessForCurrentResult, setBusinessAccessForCurrentResult] = useState(false)
  const proValuation = useMemo(() => {
    const plain = explanation
      .replace(/\r/g, '\n')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' ')

    const reasons = plain
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4)

    const parsedMileage = Number((mileage || '').replace(/[^\d]/g, ''))
    const parsedYear = Number(selectedYear)
    const now = new Date().getFullYear()
    const age = Number.isFinite(parsedYear) && parsedYear > 0 ? Math.max(0, now - parsedYear) : null
    const kmRisk = Number.isFinite(parsedMileage) ? Math.min(100, Math.round((parsedMileage / 150000) * 100)) : 35
    const ageRisk = age == null ? 35 : Math.min(100, Math.round((age / 15) * 100))
    const riskScore = Math.round(kmRisk * 0.45 + ageRisk * 0.55)
    const confidenceScore = Math.max(55, 95 - Math.round(riskScore * 0.35))
    const liquidityScore = Math.max(40, 92 - Math.round((riskScore + kmRisk) * 0.3))

    const low = priceLow ?? (price != null ? Math.round(price * 0.95) : null)
    const high = priceHigh ?? (price != null ? Math.round(price * 1.05) : null)
    const center = price ?? (low != null && high != null ? Math.round((low + high) / 2) : null)
    const spread = low != null && high != null ? Math.max(0, high - low) : null

    const negotiateFast = center != null ? Math.max(0, Math.round(center * 0.97)) : null
    const negotiateTarget = center != null ? Math.max(0, Math.round(center * 0.99)) : null
    const negotiateHold = high != null ? high : center
    const negotiateAnchor = high != null ? Math.round(high * 1.015) : center

    const mileageBand =
      !Number.isFinite(parsedMileage) ? 'Chưa có dữ liệu' : parsedMileage < 40000 ? 'Thấp' : parsedMileage < 90000 ? 'Trung bình' : 'Cao'
    const ageBand = age == null ? 'Chưa xác định' : age <= 3 ? 'Xe còn mới' : age <= 7 ? 'Tầm trung' : 'Đời sâu'

    const premiumHighlights = [
      `Độ tin cậy dữ liệu: ${confidenceScore}/100`,
      `Thanh khoản thị trường: ${liquidityScore}/100`,
      `Nhóm quãng đường: ${mileageBand}`,
      `Độ tuổi xe: ${ageBand}`,
    ]

    const actionPlan = [
      'Dọn khoang máy, vệ sinh nội thất, chụp lại ảnh đủ sáng để tăng cảm nhận xe giữ gìn.',
      'Công khai lịch sử bảo dưỡng gần nhất và các hạng mục đã thay thế chính hãng.',
      'Đăng giá neo cao hơn 1-1.5% rồi chốt dần theo phản hồi thị trường 48h đầu.',
      'Ưu tiên khung giờ đăng tin 19:30-22:00 để tăng tỉ lệ inbox.',
    ]

    return {
      reasons,
      riskScore,
      confidenceScore,
      liquidityScore,
      low,
      high,
      center,
      spread,
      negotiateFast,
      negotiateTarget,
      negotiateHold,
      negotiateAnchor,
      premiumHighlights,
      actionPlan,
    }
  }, [explanation, mileage, selectedYear, price, priceLow, priceHigh])

  useEffect(() => {
    setBrands(vehicleCatalog.brands)
  }, [])

  useEffect(() => {
    const email = session?.user?.email ?? null
    const type = session?.user?.accountType ?? null
    syncFreeUsageForUser(email, type)
  }, [session, syncFreeUsageForUser])

  useEffect(() => {
    // Reset quyền “VIP Doanh nghiệp” theo kết quả định giá hiện tại.
    setBusinessAccessForCurrentResult(false)
  }, [selectedBrand, selectedModel, selectedYear, selectedVersion, selectedColor, mileage])

  useEffect(() => {
    if (skipCascadeReset || !selectedBrand) return
    const brand = brands.find((b) => b.id === selectedBrand)
    setModels(brand ? brand.models : [])
    setSelectedModel('')
    setYears([])
    setVersions([])
    setColors([])
    setSelectedYear('')
    setSelectedVersion('')
    setSelectedColor('')
    setPrice(null)
    setPriceLow(null)
    setPriceHigh(null)
    setExplanation('')
  }, [selectedBrand, brands, skipCascadeReset])

  useEffect(() => {
    if (skipCascadeReset || !selectedModel) return
    const model = models.find((m) => m.id === selectedModel)
    setYears(model ? model.years : [])
    setSelectedYear('')
    setVersions([])
    setColors([])
    setSelectedVersion('')
    setSelectedColor('')
    setPrice(null)
    setPriceLow(null)
    setPriceHigh(null)
    setExplanation('')
  }, [selectedModel, models, skipCascadeReset])

  useEffect(() => {
    if (skipCascadeReset || !selectedYear) return
    const yearEnt = years.find((y) => y.year.toString() === selectedYear)
    setVersions(yearEnt ? yearEnt.versions : [])
    setSelectedVersion('')
    setColors([])
    setSelectedColor('')
    setPrice(null)
    setPriceLow(null)
    setPriceHigh(null)
    setExplanation('')
  }, [selectedYear, years, skipCascadeReset])

  useEffect(() => {
    if (skipCascadeReset || !selectedVersion) return
    const ver = versions.find((v) => v.name === selectedVersion)
    setColors(ver ? ver.colors : [])
    setSelectedColor('')
    setPrice(null)
    setPriceLow(null)
    setPriceHigh(null)
    setExplanation('')
  }, [selectedVersion, versions, skipCascadeReset])

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true)
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const apiData = await res.json()
        setPlans(apiData.PlansData ?? [])
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  const getBrandName = () => brands.find((b) => b.id === selectedBrand)?.name ?? selectedBrand
  const getModelName = () => models.find((m) => m.id === selectedModel)?.name ?? selectedModel

  const runVehicleDetect = async () => {
    if (!imageFile) {
      toast.error('Vui lòng tải 1 ảnh xe (hoặc ảnh liên quan đến xe).')
      return
    }
    setImageDetectLoading(true)
    setShowImageModal(false)
    try {
      const form = new FormData()
      form.append('image_0', imageFile)
      form.append('step_labels', 'Ảnh xe / liên quan xe')
      const res = await fetch('/api/vehicle-detect', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Nhận diện xe thất bại')
        setShowImageModal(true)
        return
      }
      setAiDetection(data as VehicleDetectResponse)
      setShowImageDetectConfirm(true)
    } catch {
      toast.error('Không kết nối được AI nhận diện')
      setShowImageModal(true)
    } finally {
      setImageDetectLoading(false)
    }
  }

  type ValuationPayload = {
    brandName: string
    modelName: string
    year: number
    color: string
    mileage: number
    version?: string
    brandId?: string
    modelId?: string
  }

  const syncFormFromAi = (payload: ValuationPayload) => {
    if (!payload.brandId || !payload.modelId) return
    const brand = brands.find((b) => b.id === payload.brandId)
    const model = brand?.models.find((m) => m.id === payload.modelId)
    if (!brand || !model) return

    setSkipCascadeReset(true)
    setModels(brand.models)
    setSelectedBrand(brand.id)
    setSelectedModel(model.id)
    setYears(model.years)
    const yearEnt = model.years.find((y) => y.year === payload.year)
    if (yearEnt) {
      setVersions(yearEnt.versions)
      setSelectedYear(String(payload.year))
      const ver = findVersion(yearEnt.versions, payload.version)
      if (ver) {
        setSelectedVersion(ver.name)
        setColors(ver.colors)
        if (payload.color) setSelectedColor(payload.color)
      }
    }
    if (payload.mileage > 0) setMileage(String(payload.mileage))
    setTimeout(() => setSkipCascadeReset(false), 0)
  }

  const confirmAndValuateFromAi = async (payload: {
    brand: string
    model: string
    year: number
    version?: string
    color?: string
    mileage?: number
  }) => {
    const brand = findBrand(brands, payload.brand)
    const model = brand ? findModel(brand, payload.model) : null
    const brandName = brand?.name ?? payload.brand
    const modelName = model?.name ?? payload.model

    let color = payload.color?.trim() || ''
    if (brand && model) {
      const yearEnt = model.years.find((y) => y.year === payload.year)
      const ver = yearEnt ? findVersion(yearEnt.versions, payload.version) : null
      if (ver) {
        const mapped = mapColorToCatalog(payload.color ?? '', ver.colors)
        color = mapped || ver.colors[0] || color
      }
    }
    if (!color) color = 'Không rõ'

    const mileageNum = payload.mileage ?? 0
    const valuationPayload: ValuationPayload = {
      brandName,
      modelName,
      year: payload.year,
      color,
      mileage: mileageNum,
      version: payload.version,
      brandId: brand?.id,
      modelId: model?.id,
    }

    setShowImageDetectConfirm(false)
    syncFormFromAi(valuationPayload)
    const ok = await calcPrice(valuationPayload)
    if (!ok) {
      setShowImageDetectConfirm(true)
      return
    }
    toast.success('Định giá từ ảnh thành công')
    document
      .querySelector('[data-valuation-form-root]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const calcPrice = async (override?: ValuationPayload): Promise<boolean> => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng định giá.')
      if (!isDashboard && typeof window !== 'undefined' && typeof (window as { openSignInModal?: () => void }).openSignInModal === 'function') {
        ;(window as { openSignInModal?: () => void }).openSignInModal?.()
      }
      return false
    }

    if (!isDashboard) {
      const email = session.user?.email ?? undefined
      if (email) syncFreeUsageForUser(email, session.user?.accountType ?? null)

      const unlockedForThisRun = isPro || canUseValuation()
      if (!unlockedForThisRun) {
        const isPersonal = accountType === 'personal' || session.user?.accountType === 'personal'
        toast.error(
          isPersonal
            ? `Bạn đã dùng hết ${PERSONAL_PLAN.maxValuationsPerMonth} lượt định giá tháng này. Vui lòng chờ sang tháng mới hoặc nâng cấp gói Doanh nghiệp.`
            : 'Bạn đã dùng hết lượt dùng thử trong tháng. Vui lòng nâng cấp gói Doanh nghiệp tại mục Bảng giá.'
        )
        return false
      }
    }

    const unlockedForThisRun = isDashboard || isPro || canUseValuation()

    const brandName = override?.brandName ?? getBrandName()
    const modelName = override?.modelName ?? getModelName()
    const year = override?.year ?? parseInt(selectedYear, 10)
    const color = override?.color ?? selectedColor
    const mileageKm =
      override?.mileage ??
      (parseInt(String(mileage).replace(/\D/g, ''), 10) || 0)
    const version = override?.version ?? selectedVersion

    if (!override) {
      if (!selectedColor || !mileage) {
        toast.error('Vui lòng chọn màu và nhập số km.')
        return false
      }
    } else if (!brandName || !modelName || !year) {
      toast.error('Thiếu thông tin xe từ AI để định giá.')
      return false
    }

    setValuationLoading(true)
    try {
      if (!isDashboard && !isPro) {
        const email = session.user?.email ?? undefined
        consumeValuationUse(email ?? null)
      }
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandName,
          model: modelName,
          year,
          color,
          mileage: mileageKm,
        }),
      })
      const resData = await res.json()
      if (res.ok) {
        setPrice(resData.price ?? resData.priceSuggested ?? null)
        setPriceLow(resData.priceLow ?? null)
        setPriceHigh(resData.priceHigh ?? null)
        setExplanation(resData.explanation || '')
        setBusinessAccessForCurrentResult(isDashboard || unlockedForThisRun)

        if (isDashboard && session?.user?.id) {
          try {
            const saveRes = await fetch('/api/valuations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                brand: brandName,
                model: modelName,
                year: year || null,
                version: version || null,
                color: color || null,
                mileage: mileageKm,
                price: resData.price ?? null,
                priceLow: resData.priceLow ?? null,
                priceHigh: resData.priceHigh ?? null,
                explanation: resData.explanation || '',
                source: resData.source || null,
              }),
            })
            if (saveRes.ok) {
              toast.success('Đã lưu định giá vào lịch sử')
              onValuationSaved?.()
            } else {
              const err = await saveRes.json()
              toast.error(err.error || 'Không lưu được lịch sử (kiểm tra Supabase)')
            }
          } catch {
            toast.error('Không kết nối được server lưu lịch sử')
          }
        }
        return true
      }

      toast.error(resData.error || 'Không thể định giá. Vui lòng thử lại.')
    } catch (err) {
      console.error('valuation error', err)
      return false
    } finally {
      setValuationLoading(false)
    }

    return false
  }

  const handleViewDetails = () => {
    if (!session) {
      setProModalMessage('Vui lòng đăng nhập để xem báo cáo chi tiết định giá.')
      setShowProRequiredModal(true)
      return
    }

    if (!isDashboard && !businessAccessForCurrentResult) {
      setProModalMessage('Báo cáo chi tiết định giá là tính năng dành cho Doanh nghiệp (hoặc 3 lượt định giá free). Vui lòng nâng cấp để trải nghiệm.')
      setShowProRequiredModal(true)
      return
    }

    setShowModal(true)
  }

  const handleCategoryChange = (category: 'monthly' | 'yearly') => {
    setSelectedCategory(category)
  }

  const sectionClass = isDashboard
    ? 'relative'
    : 'relative z-10 -mt-16 lg:-mt-24 pb-20'

  return (
    <section
      id={isDashboard ? undefined : 'valuation'}
      data-valuation-form-root
      className={sectionClass}>
      <div className={isDashboard ? '' : 'container'}>
        <div className={`bg-white rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-sm ${
          isDashboard ? 'p-4 sm:p-6 lg:p-8' : 'p-6 sm:p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-blue-50/60'
        }`}>
          {/* subtle accent blob inside the card */}
          <div className='absolute -top-24 -right-24 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl' />
          {!isDashboard && (
            <h2 className='text-3xl md:text-4xl font-extrabold text-midnight_text mb-10 text-center relative z-10'>
              Định Giá <span className="text-primary">Xe Của Bạn</span>
            </h2>
          )}
          {isDashboard && (
            <div className='relative z-10 mb-4 flex flex-wrap gap-2 sm:mb-6'>
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200'>
                <Icon icon="tabler:infinity" /> Không giới hạn lượt
              </span>
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-200'>
                <Icon icon="tabler:cloud-check" /> Tự động lưu Supabase
              </span>
              <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200'>
                <Icon icon="tabler:message-chatbot" /> Chat AI unlimited
              </span>
            </div>
          )}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 relative z-10'>
            <div className='lg:col-span-7 space-y-5'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none'
                  >
                    <option value=''>Hãng xe</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-slate-100'
                    disabled={!models.length}
                  >
                    <option value=''>Dòng xe</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>

                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-slate-100'
                    disabled={!years.length}
                  >
                    <option value=''>Năm sản xuất</option>
                    {years.map((y) => (
                      <option key={y.year} value={y.year}>{y.year}</option>
                    ))}
                  </select>
                  <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>

                <div className="relative">
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-slate-100'
                    disabled={!versions.length}
                  >
                    <option value=''>Phiên bản</option>
                    {versions.map((v) => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                  <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>

                <div className="relative">
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-slate-100'
                    disabled={!colors.length}
                  >
                    <option value=''>Màu sắc</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Icon icon="tabler:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>

                <div className="relative">
                  <input
                    type='number'
                    placeholder='Số km đã đi'
                    min={0}
                    max={999999}
                    value={mileage}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '')
                      if (v === '' || Number(v) <= 999999) setMileage(v)
                    }}
                    className='w-full appearance-none bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-slate-900 font-medium transition-all outline-none'
                  />
                  <Icon icon="tabler:road" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 mt-8'>
                <button
                  className='bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 text-white px-8 py-4 rounded-xl font-bold flex-1 flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none'
                  onClick={() => {
                    void calcPrice()
                  }}
                  disabled={!selectedColor || !mileage || valuationLoading}
                >
                  <Icon icon="tabler:calculator" className="text-xl" />
                  Định Giá Ngay
                </button>
                <button
                  className='bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-xl font-bold flex-1 flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all'
                  onClick={() => {
                    if (!session) {
                      setProModalMessage(`Vui lòng đăng nhập để sử dụng định giá hình ảnh AI (${PERSONAL_PLAN.name}: dùng chung ${PERSONAL_PLAN.maxValuationsPerMonth} lượt định giá/tháng).`)
                      setShowProRequiredModal(true)
                      return
                    }

                    if (!isDashboard && !isPro && !canUseValuation()) {
                      setProModalMessage(
                        accountType === 'personal'
                          ? `Bạn đã dùng hết ${PERSONAL_PLAN.maxValuationsPerMonth} lượt định giá tháng này. Nâng cấp gói Doanh nghiệp để tiếp tục.`
                          : 'Bạn đã dùng hết lượt dùng thử. Vui lòng nâng cấp gói Doanh nghiệp để tiếp tục.'
                      )
                      setShowProRequiredModal(true)
                      return
                    }

                    setImageFile(null)
                    setShowImageModal(true)
                  }}
                >
                  <div className='absolute -top-3 -right-3'>
                    <span className='relative flex h-6 w-6'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-6 w-6 bg-yellow-500 text-white items-center justify-center text-xs font-bold leading-none'>
                        <Icon icon="tabler:crown" className="text-sm" />
                      </span>
                    </span>
                  </div>
                  <Icon icon="tabler:camera-bolt" className="text-xl text-yellow-500" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-700 font-extrabold">Định giá bằng hình ảnh</span>
                </button>
              </div>
              {!isDashboard && !isPro && (
                <p className={`text-sm rounded-lg px-4 py-2 mt-3 inline-block border ${
                  accountType === 'personal'
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {accountType === 'personal'
                    ? `${planName}: ${formatValuationQuota(remainingFreeValuations, maxValuationsPerMonth)}`
                    : `Dùng thử: còn ${remainingFreeValuations}/${maxValuationsPerMonth} lượt tháng này`}
                </p>
              )}
            </div>
            <div className='lg:col-span-5 min-h-[280px]'>
              {valuationLoading ? (
                /* ── LOADING ── */
                <div className='flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-slate-50 p-8'>
                  <div className='text-center'>
                    <div className='relative mx-auto mb-5 h-16 w-16'>
                      <div className='absolute inset-0 rounded-full border-4 border-primary/15' />
                      <div className='absolute inset-0 animate-spin rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent' />
                      <Icon icon='tabler:car' className='absolute inset-0 m-auto text-2xl text-primary/50' />
                    </div>
                    <p className='font-bold text-slate-700'>Đang phân tích thị trường…</p>
                    <p className='mt-1 text-xs text-slate-400'>AI đang tính toán khoảng giá tham chiếu</p>
                  </div>
                </div>

              ) : price !== null || priceLow !== null || priceHigh !== null ? (
                /* ── KẾT QUẢ ── */
                <div className='relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-blue-50 to-blue-100/50'>
                  {/* decorative blobs */}
                  <div className='pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl' />
                  <div className='pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-blue-300/20 blur-xl' />

                  <div className='relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
                    {/* badge */}
                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm'>
                      <Icon icon='tabler:sparkles' className='text-sm' />
                      Kết quả AI định giá
                    </span>

                    {/* price */}
                    {(() => {
                      const low = priceLow ?? (price != null ? price - Math.max(15_000_000, Math.round(price * 0.025)) : null)
                      const high = priceHigh ?? (price != null ? price + Math.max(15_000_000, Math.round(price * 0.025)) : null)
                      const showLow = low != null ? Math.max(0, low) : null
                      const showHigh = high ?? null
                      if (showLow != null && showHigh != null) {
                        return (
                          <div>
                            <p className='text-xs font-medium text-slate-500'>Khoảng giá tham chiếu</p>
                            <p className='mt-1 text-[2.4rem] font-black leading-none tracking-tight text-midnight_text sm:text-[2.7rem]'>
                              {(showLow / 1_000_000).toFixed(0)}–{(showHigh / 1_000_000).toFixed(0)}
                              <span className='ml-1 text-xl font-semibold text-slate-400'>triệu</span>
                            </p>
                            <p className='mt-1 text-[11px] text-slate-400'>
                              {showLow.toLocaleString('vi-VN')} – {showHigh.toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        )
                      }
                      const single = price ?? priceLow ?? priceHigh ?? 0
                      return (
                        <div>
                          <p className='text-xs font-medium text-slate-500'>Giá tham chiếu</p>
                          <p className='mt-1 text-[2.7rem] font-black leading-none tracking-tight text-midnight_text'>
                            {(single / 1_000_000).toFixed(0)}
                            <span className='ml-1 text-xl font-semibold text-slate-400'>triệu</span>
                          </p>
                          <p className='mt-1 text-[11px] text-slate-400'>{single.toLocaleString('vi-VN')} đ</p>
                        </div>
                      )
                    })()}

                    {/* range bar */}
                    <div className='w-40 overflow-hidden rounded-full bg-blue-100/80 h-1.5'>
                      <div className='h-full w-full rounded-full bg-gradient-to-r from-primary to-blue-400' />
                    </div>

                    {/* CTA */}
                    <button
                      type='button'
                      onClick={handleViewDetails}
                      className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:scale-[1.03]'
                    >
                      <Icon icon='tabler:file-analytics' className='text-base' />
                      Xem Báo Cáo Chi Tiết
                    </button>

                    {/* chat hint */}
                    <p className='max-w-[240px] text-[11px] leading-relaxed text-slate-400'>
                      Ngập nước, va quệt, sơn lại...? Bấm{' '}
                      <span className='font-semibold text-primary'>chat góc phải</span> để tư vấn nhanh.
                    </p>
                  </div>
                </div>

              ) : (
                /* ── PLACEHOLDER ── */
                <div className='flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center'>
                  <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm'>
                    <Icon icon='tabler:car-suv' className='text-3xl text-blue-300' />
                  </div>
                  <p className='font-semibold text-slate-500'>Kết quả hiển thị tại đây</p>
                  <p className='mt-1 text-xs text-slate-400'>Nhập thông tin xe rồi bấm định giá</p>
                  <div className='mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400'>
                    {['Chọn xe', 'Điền thông tin', 'Xem giá'].map((step, i) => (
                      <span key={step} className='flex items-center gap-2'>
                        {i > 0 && <span className='text-slate-300'>›</span>}
                        <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary'>
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

      {/* Modal for packages */}
      {showModal && (
        <div className='fixed inset-0 bg-opacity-70 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl'>
            <div className='sticky top-0 bg-white border-b p-6 flex justify-between items-center'>
              <h2 className='text-2xl font-bold text-midnight_text'>Thông Tin Định Giá Chi Tiết</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setShowPackages(false)
                }}
                className='text-gray-500 hover:text-gray-700 text-2xl'
                aria-label='Đóng'
              >
                ✕
              </button>
            </div>

            <div className='p-6'>
              {(priceLow != null && priceHigh != null) || price != null ? (
                <div className='mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100/60 border-2 border-primary rounded-lg'>
                  <p className='text-gray-600 text-center mb-2'>Giá thực tế (tham khảo)</p>
                  {priceLow != null && priceHigh != null ? (
                    <>
                      <p className='text-3xl sm:text-4xl font-bold text-primary text-center'>
                        {(priceLow / 1_000_000).toFixed(0)} tr – {(priceHigh / 1_000_000).toFixed(0)} tr
                      </p>
                      <p className='text-sm text-gray-500 text-center mt-2'>
                        {priceLow.toLocaleString('vi-VN')} đ – {priceHigh.toLocaleString('vi-VN')} đ
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='text-4xl font-bold text-primary text-center'>
                        {((price ?? 0) / 1_000_000).toFixed(0)} triệu đ
                      </p>
                      <p className='text-sm text-gray-500 text-center mt-2'>
                        {(price ?? 0).toLocaleString('vi-VN')} VND
                      </p>
                    </>
                  )}
                </div>
              ) : null}
              {explanation && (
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold text-primary mb-3'>Lý Do Định Giá</h3>
                  {businessAccessForCurrentResult ? (
                    <div className='rounded-2xl border border-purple-200 bg-gradient-to-br from-[#ffffff] via-[#f8f5ff] to-[#eef4ff] p-5 shadow-xl shadow-purple-100'>
                      <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                        <div>
                          <p className='text-xs uppercase tracking-wider text-purple-600 font-extrabold'>ValuCar Business Analysis</p>
                          <h4 className='text-xl font-extrabold text-slate-900'>Báo cáo định giá chuyên sâu</h4>
                        </div>
                        <div className='px-3 py-1.5 rounded-full bg-white border border-purple-200 text-sm font-bold text-purple-700'>
                          Điểm rủi ro: {proValuation.riskScore}/100
                        </div>
                      </div>

                      <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4'>
                        <div className='rounded-xl bg-white border border-slate-200 p-3'>
                          <p className='text-xs text-slate-500 mb-1'>Khung giá thông minh</p>
                          <p className='text-lg font-bold text-primary'>
                            {proValuation.low != null && proValuation.high != null
                              ? `${proValuation.low.toLocaleString('vi-VN')} đ - ${proValuation.high.toLocaleString('vi-VN')} đ`
                              : 'Đang cập nhật'}
                          </p>
                          <p className='text-xs text-slate-500 mt-1'>
                            Biên độ: {proValuation.spread != null ? `${proValuation.spread.toLocaleString('vi-VN')} đ` : 'N/A'}
                          </p>
                        </div>
                        <div className='rounded-xl bg-white border border-slate-200 p-3'>
                          <p className='text-xs text-slate-500 mb-1'>Chiến lược chốt giá</p>
                          <p className='text-sm text-slate-700'>Bán nhanh: <b>{proValuation.negotiateFast != null ? `${proValuation.negotiateFast.toLocaleString('vi-VN')} đ` : 'N/A'}</b></p>
                          <p className='text-sm text-slate-700'>Mục tiêu: <b>{proValuation.negotiateTarget != null ? `${proValuation.negotiateTarget.toLocaleString('vi-VN')} đ` : 'N/A'}</b></p>
                          <p className='text-sm text-slate-700'>Giữ giá: <b>{proValuation.negotiateHold != null ? `${proValuation.negotiateHold.toLocaleString('vi-VN')} đ` : 'N/A'}</b></p>
                        </div>
                        <div className='rounded-xl bg-white border border-slate-200 p-3'>
                          <p className='text-xs text-slate-500 mb-1'>Chỉ số thị trường</p>
                          <p className='text-sm text-slate-700'>Độ tin cậy: <b>{proValuation.confidenceScore}/100</b></p>
                          <p className='text-sm text-slate-700'>Thanh khoản: <b>{proValuation.liquidityScore}/100</b></p>
                          <p className='text-sm text-slate-700'>Giá neo đề xuất: <b>{proValuation.negotiateAnchor != null ? `${proValuation.negotiateAnchor.toLocaleString('vi-VN')} đ` : 'N/A'}</b></p>
                        </div>
                        <div className='rounded-xl bg-white border border-slate-200 p-3'>
                          <p className='text-xs text-slate-500 mb-1'>Snapshot xe của bạn</p>
                          <div className='space-y-1'>
                            {proValuation.premiumHighlights.map((line, idx) => (
                              <p key={idx} className='text-sm text-slate-700'>- {line}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='grid lg:grid-cols-5 gap-3'>
                        <div className='lg:col-span-3 rounded-xl bg-white border border-slate-200 p-4'>
                          <p className='text-sm font-bold text-slate-900 mb-2'>Lý do định giá chi tiết</p>
                          <ul className='space-y-2 text-sm text-slate-700'>
                            {(proValuation.reasons.length ? proValuation.reasons : [explanation]).map((line, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <Icon icon='tabler:sparkles' className='text-purple-500 mt-0.5 shrink-0' />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className='lg:col-span-2 rounded-xl bg-white border border-slate-200 p-4'>
                          <p className='text-sm font-bold text-slate-900 mb-2'>Checklist tăng giá bán (Doanh nghiệp)</p>
                          <ul className='space-y-2 text-sm text-slate-700'>
                            {proValuation.actionPlan.map((line, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <Icon icon='tabler:circle-check-filled' className='text-blue-500 mt-0.5 shrink-0' />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className='mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3'>
                        <p className='text-xs text-amber-700'>
                          <b>Lưu ý Doanh nghiệp:</b> Khung giá trên phản ánh dữ liệu hiện tại và hành vi thương lượng phổ biến. Giá chốt thực tế có thể dao động theo vùng, lịch sử bảo dưỡng và thời điểm bán.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='bg-blue-50 border-l-4 border-primary p-4 rounded-lg shadow-sm leading-relaxed whitespace-pre-line'>
                        <span className='block font-semibold text-primary mb-1'>Lý do định giá:</span>
                        <span className='text-gray-700'>{explanation}</span>
                      </div>
                      <button
                        onClick={() => setShowPackages(!showPackages)}
                        className='w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold'
                      >
                        {showPackages ? 'Ẩn thông tin chi tiết' : 'Mở khóa báo cáo Doanh nghiệp'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Image
              src='/images/pricing/upperline.png'
              alt=''
              width={280}
              height={219}
              className='absolute top-[160px] left-[90px] hidden sm:block opacity-5 pointer-events-none'
            />
            <Image
              src='/images/pricing/lowerline.png'
              alt=''
              width={180}
              height={100}
              className='absolute bottom-[0px] right-[90px] opacity-5 pointer-events-none'
            />
            <div className='container px-4 py-12 border-t'>
              {showPackages && (
                <>
                  <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6'>
                    <p className='text-sm text-yellow-800'>
                      <span className='font-semibold'>💡 Gợi ý:</span> Để xem chi tiết đầy đủ và lịch sử định giá, vui lòng chọn một gói phù hợp bên dưới.
                    </p>
                  </div>

                  <h3 className='text-2xl font-bold text-center text-midnight_text mb-4'>Các Gói Của Chúng Tôi</h3>
                  <p className='text-lg font-normal text-center text-black/60 pt-5 max-w-2xl mx-auto'>
                    Chọn gói phù hợp để đăng ký và tiếp tục xem thêm thông tin chi tiết.
                  </p>

                  <div className='mt-6 relative'>
                    <div className='flex justify-center'>
                      <div className='bg-deepSlate flex py-1 px-1 rounded-full'>
                        <button
                          className={`text-xl font-medium cursor-pointer ${selectedCategory === 'yearly'
                            ? 'text-primary bg-white rounded-full py-2 px-4 sm:py-4 sm:px-16'
                            : 'text-white py-2 px-4 sm:py-4 sm:px-16'
                            }`}
                          onClick={() => handleCategoryChange('yearly')}
                        >
                          Hàng Năm
                        </button>
                        <button
                          className={`text-xl font-medium cursor-pointer ${selectedCategory === 'monthly'
                            ? 'text-primary bg-white rounded-full py-2 px-4 sm:py-4 sm:px-16'
                            : 'text-white py-2 px-4 sm:py-4 sm:px-16'
                            }`}
                          onClick={() => handleCategoryChange('monthly')}
                        >
                          Hàng Tháng
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-16 mx-5 gap-6'>
                    {loadingPlans ? (
                      <p className='col-span-full text-center text-black/60'>Loading...</p>
                    ) : (
                      plans
                        .filter((plan) => plan.category.includes(selectedCategory))
                        .map((plan, index) => (
                          <div
                            className='pt-10 pb-28 px-10 bg-white rounded-2xl shadow-lg relative hover:bg-primary group overflow-hidden'
                            key={index}
                          >
                            <Image
                              src={plan.imgSrc}
                              alt=''
                              width={154}
                              height={154}
                              className='absolute bottom-[-4%] right-[-6%] opacity-10'
                            />
                            <h3 className='mb-8 text-midnight_text group-hover:text-white'>
                              {plan.heading}
                            </h3>
                            <button className='text-xl font-medium text-white w-full bg-primary hover:text-white group-hover:bg-deepSlate group-hover:border-deepSlate border-2 border-primary rounded-full py-4 px-12 mb-8 hover:cursor-pointer'>
                              {plan.button}
                            </button>
                            <p className='text-4xl sm:text-5xl font-semibold text-midnight_text mb-3 group-hover:text-white'>
                              {selectedCategory === 'monthly'
                                ? plan.price.monthly.toLocaleString('vi-VN')
                                : plan.price.yearly.toLocaleString('vi-VN')}{' '}
                              đ
                              <span className='text-lightgrey text-3xl sm:text-4xl'>
                                {selectedCategory === 'monthly' ? '/tháng' : '/năm'}
                              </span>
                            </p>
                            <p className='text-lg font-normal text-black group-hover:text-white'>
                              {plan.subscriber}
                              <span> Người dùng</span>
                            </p>
                            <p className='text-lg font-normal text-black/40 mb-6 group-hover:text-white'>
                              (mỗi người dùng mỗi tháng)
                            </p>
                            <div className='mt-6'>
                              {plan.option.map((feature, idx) => (
                                <div key={idx} className='flex gap-4 pt-4'>
                                  <Icon
                                    icon='tabler:circle-check-filled'
                                    className='text-2xl text-blue-400 shrink-0'
                                  />
                                  <p className='text-lg font-medium text-black/60 group-hover:text-white/60'>
                                    {feature}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal upload 1 ảnh xe */}
      {showImageModal && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative flex flex-col items-center border border-blue-100'>
            <button
              onClick={() => setShowImageModal(false)}
              className='absolute top-3 right-3 text-gray-400 hover:text-primary text-3xl z-10 transition-colors duration-150'
              aria-label='Đóng'
              style={{ lineHeight: '1' }}
            >×</button>
            <div className='w-full flex flex-col items-center pt-6 pb-2 px-6 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl'>
              <h2 className='text-2xl font-extrabold text-primary mb-1 tracking-wide text-center'>Nhận diện xe bằng ảnh</h2>
              <p className='text-gray-600 text-sm mt-1 mb-2 text-center'>
                Tải <strong>1 ảnh</strong> toàn xe, đuôi xe, góc chéo, nội thất hoặc biển số — AI sẽ gợi ý hãng, dòng, năm.
              </p>
            </div>
            <div className='flex flex-col items-center w-full px-6 py-4'>
              <div className='w-full flex justify-center mb-3'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : '/images/car/anh3.png'}
                  alt='Ảnh xe'
                  className='w-full max-w-xs h-48 object-contain rounded-xl border border-blue-100 shadow bg-gray-50'
                />
              </div>
              <input
                id='valuation-image-upload-input'
                type='file'
                accept='image/*'
                capture='environment'
                style={{ display: 'none' }}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <button
                className='bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 transition mb-2 w-full'
                onClick={() => document.getElementById('valuation-image-upload-input')?.click()}
                type='button'
              >
                Chọn ảnh xe
              </button>
              {imageFile && (
                <div className='text-green-600 text-sm mt-1 font-medium truncate max-w-full px-2'>
                  Đã chọn: {imageFile.name}
                </div>
              )}
              <button
                className='mt-5 w-full rounded-xl bg-primary px-6 py-3 text-base font-bold text-white shadow hover:opacity-90 transition disabled:opacity-50'
                onClick={() => void runVehicleDetect()}
                disabled={!imageFile || imageDetectLoading}
              >
                {imageDetectLoading ? 'Đang nhận diện...' : 'Nhận diện xe (AI)'}
              </button>
              <p className='mt-3 text-center text-xs text-gray-400'>
                AI nhận diện → chọn năm → định giá ngay, xem kết quả bên phải.
              </p>
            </div>
          </div>
        </div>
      )}
      <VehicleDetectConfirmModal
        open={showImageDetectConfirm}
        detection={aiDetection}
        onClose={() => {
          setShowImageDetectConfirm(false)
          setShowImageModal(true)
        }}
        onConfirm={confirmAndValuateFromAi}
        confirmLoading={valuationLoading}
      />

      {/* Modal loading AI nhận diện ảnh */}
      {imageDetectLoading && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-md w-full p-8 relative shadow-2xl flex flex-col items-center'>
            <h2 className='text-2xl font-bold text-primary mb-4 text-center'>Đang phân tích bằng AI...</h2>
            <div className='relative w-50 h-33 mb-4'>
              {imageFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt='Đang phân tích'
                  className='w-56 h-36 object-contain rounded border shadow bg-gray-100'
                />
              ) : (
                <div className='w-56 h-36 bg-gray-100 rounded border flex items-center justify-center text-gray-400'>No image</div>
              )}
              {/* Hiệu ứng scan */}
              <div className='absolute inset-0 pointer-events-none'>
                <div className='scan-bar' style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <div className='ai-scan-effect' style={{ position: 'absolute', left: 0, width: '100%', height: '8px', opacity: 0.45 }}></div>
                  </div>
                </div>
              </div>
              <style>{`
                @keyframes ai-scan {
                  0% { top: 0; }
                  100% { top: 90%; }
                }
                .ai-scan-effect {
                  background: linear-gradient(90deg, #60a5fa33 0%, #3b82f6cc 50%, #60a5fa33 100%);
                  box-shadow: 0 0 8px 2px #3b82f6aa;
                  border-radius: 4px;
                  position: absolute;
                  left: 0;
                  animation: ai-scan 1.2s linear infinite;
                }
              `}</style>
            </div>
            <div className='text-lg text-gray-700 font-semibold mb-2'>AI đang nhận diện hãng, dòng, năm xe...</div>
            <div className='text-base text-gray-500'>Phân tích 1 ảnh · không định giá ở bước này</div>
          </div>
        </div>
      )}

      {/* Business Required Modal */}
      {showProRequiredModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]'>
          <div className='bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl border border-yellow-100 flex flex-col items-center text-center mx-4 transform transition-all scale-100'>
            <button
              onClick={() => setShowProRequiredModal(false)}
              className='absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl transition-colors'
              aria-label='Đóng'
            >
              <Icon icon="tabler:x" />
            </button>

            <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-inner'>
              <Icon icon="tabler:crown" className="text-5xl text-yellow-500" />
            </div>

            <h3 className='text-3xl font-extrabold text-midnight_text mb-3'>
              Tính Năng <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600'>Doanh nghiệp</span>
            </h3>

            <p className='text-gray-600 text-lg mb-8 leading-relaxed px-4'>
              {proModalMessage}
            </p>

            <div className='flex flex-col w-full gap-3'>
              {!session ? (
                <>
                  <button
                    onClick={() => {
                      setShowProRequiredModal(false);
                      if (typeof window !== 'undefined' && typeof (window as { openSignInModal?: () => void }).openSignInModal === 'function') {
                        (window as { openSignInModal?: () => void }).openSignInModal?.();
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        toast('Vui lòng bấm Đăng Nhập ở góc trên màn hình.', { icon: 'ℹ️' });
                      }
                    }}
                    className='w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2'>
                    Đăng Nhập Để Tiếp Tục <Icon icon="tabler:login" className="text-xl" />
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowProRequiredModal(false);
                      if (typeof window !== 'undefined' && typeof (window as { openSignUpModal?: () => void }).openSignUpModal === 'function') {
                        (window as { openSignUpModal?: () => void }).openSignUpModal?.();
                      } else {
                        window.location.href = '/signup';
                      }
                    }}
                    className='w-full py-3 rounded-xl text-base font-semibold text-primary border-2 border-primary/30 hover:bg-primary/5 transition-all'>
                    Đăng ký tài khoản Doanh nghiệp
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowProRequiredModal(false);
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#pricing';
                    }
                  }}
                  className='w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2'>
                  Nâng Cấp Doanh nghiệp Ngay <Icon icon="tabler:arrow-right" className="text-xl" />
                </button>
              )}
              <button
                onClick={() => setShowProRequiredModal(false)}
                className='w-full py-3 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-colors'>
                Để Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expert chat widget (demo fix cứng) */}
      <ExpertChatWidget
        enabled={price !== null || priceLow !== null || priceHigh !== null}
        price={price}
        priceLow={priceLow}
        priceHigh={priceHigh}
        vehicle={{
          brand: getBrandName(),
          model: getModelName(),
          year: selectedYear,
          color: selectedColor,
          mileage,
          version: selectedVersion,
        }}
      />
    </section>
  )
}

export default ValuationForm
