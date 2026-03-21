'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import data from '../../../../data.json'
import { plansData } from '@/types/plans'
import { useWallet } from '@/app/Providers'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import ExpertChatWidget from '@/components/Support/ExpertChatWidget'

interface Brand { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; years: YearEntry[] }
interface YearEntry { year: number; versions: Version[] }
interface Version { name: string; colors: string[] }

const ValuationForm = () => {
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
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null, null])
  const [currentStep, setCurrentStep] = useState(0)
  const [showImageResult, setShowImageResult] = useState(false)
  const [showImageLoading, setShowImageLoading] = useState(false)
  const [showProRequiredModal, setShowProRequiredModal] = useState(false)
  const [proModalMessage, setProModalMessage] = useState('')

  const { isPro, deductBalance, balance } = useWallet()
  const { data: session } = useSession()
  const imageSteps = [
    {
      label: 'Ảnh 1: Đít xe',
      description: 'Chụp rõ phần đuôi xe để nhận diện hãng và dòng xe.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/650272415_122177232320669678_299455862335955083_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=e06c5d&_nc_eui2=AeEjXB0RbrnjEk6ZbTH7lVRLWKj2tosuo9JYqPa2iy6j0krSfALaVjtKAAXiqFvOBsO35NuCfZmdK2HoMyOaW40_&_nc_ohc=yeeqFbSBQlYQ7kNvwGFQk4S&_nc_oc=AdkMwA3oRhblsD8RyOUn5jZ9Vy_kFz_ZKYM3vHaEt2YHq8YJi24R8x5J1JyAjUNZxSw&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=PVOyDJbmBTDeLAI6PnBy0Q&_nc_ss=8&oh=00_Afwp8Q0rBOi_N3F3qOIT8OeaVYiwRQ5w_JQpfleTk6N90g&oe=69BC8681',
    },
    {
      label: 'Ảnh 2: Mặt trước vô lăng',
      description: 'Chụp màn hình đồng hồ công tơ mét để lấy số km đã đi.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/652687704_122177232332669678_8189232061790795806_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=e06c5d&_nc_ohc=YsgXZxd25KQQ7kNvwEsc-d6&_nc_oc=Adnxeem8qiMEgkFBxVzTwnC5csMlPb52Ll24YRxErvtoaT5ydMr77stJHfwhnYIZrLs&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=W6ri8bYXCaR4fwCQCASAjA&_nc_ss=8&oh=00_Afw8yTsW6ePw5dmOQFORRK4lY844mGqvVnMj3px5MVAjMw&oe=69BC8C46',
    },
    {
      label: 'Ảnh 3: Góc chéo trước xe',
      description: 'Chụp góc chéo phía trước để nhận diện tổng thể.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/651217708_122177232710669678_5329864960457114276_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=e06c5d&_nc_eui2=AeHD0YYuA8P6hmZAYBroLdyEIM39GDiVv5Ygzf0YOJW_lq_tw4ajz-PXYKLxaCoM34bfpwUXcbTQu0fQ11NT9acc&_nc_ohc=zuXRXznrGTQQ7kNvwHa3cKY&_nc_oc=AdkRTDDOFZ9xXON9HEVH6D0uJyYKII1V8ihUUxQJEGebFkdx79ZwQj5EBbCeL5OLUfY&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=nRdRCjV0t0stmxJ5fj-KXA&_nc_ss=8&oh=00_Afym7ndSj3p02uKQbNerrhZs9sg6-Fnx_44eW85aRIm-Sg&oe=69BC83F6',
    },
    {
      label: 'Ảnh 4: Góc chéo sau xe',
      description: 'Chụp góc chéo phía sau để nhận diện tổng thể.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/652514847_122177232362669678_4064734653303694103_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=e06c5d&_nc_ohc=8ENqPZriP5QQ7kNvwF3U4yK&_nc_oc=AdlrUbykGdwZ2WLq1QPbkvxOCchE_YLyqUx3b_hpvIno8y4ajmH8lS5L2xnSM2WNjMM&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=VN9b3AoGRFjhhiz3eCNuAA&_nc_ss=8&oh=00_Afx3MTFxeouCD1qozk4JsuYznif-S4FGeJJgjr97bzVJYg&oe=69BCAB63',
    },
    {
      label: 'Ảnh 5: Nội thất',
      description: 'Chụp nội thất xe, tập trung vào các chi tiết quan trọng.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/650754677_122177232716669678_3541051047642227354_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=e06c5d&_nc_ohc=y3j_Z7BnnKoQ7kNvwGaBOfP&_nc_oc=Adn_QGpUtYvYznME6dCm7lrElWQAOp2qOhIP-o3PyLx1tf9eLSvDGGaDrCXj5YRgxkE&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=DAbz3bpc35JfQKFXJVFsBA&_nc_ss=8&oh=00_Afyq5eYEqPLXf3TWaVZuI_IV2FFdGr2uYov5hY665daQ-g&oe=69BC89BD',
    },
    {
      label: 'Ảnh 6: Vết xước, hư hại',
      description: 'Chụp rõ các vết xước, móp, hư hại nếu có.',
      example: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/650727052_122177232728669678_4044222338380675829_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=e06c5d&_nc_ohc=aEqUmOT69woQ7kNvwHvLhTk&_nc_oc=AdlxAcWTIQEVJQ0FoDnfvidGOcYl9Vh8o47y3raNjP5iFh4z8uNuY5aBDazdzsrpkGc&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=MWgWvZEBeqtXJZc-VmrhNw&_nc_ss=8&oh=00_AfxajXoF2QwSBOwZSEuM2PrggT59ZklPqh63u0dlcIjTMQ&oe=69BCB806',
    },
  ]

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
      setPrice(null)
      setPriceLow(null)
      setPriceHigh(null)
      setExplanation('')
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
      setPrice(null)
      setPriceLow(null)
      setPriceHigh(null)
      setExplanation('')
    }
  }, [selectedModel, models])

  useEffect(() => {
    if (selectedYear) {
      const yearEnt = years.find((y) => y.year.toString() === selectedYear)
      setVersions(yearEnt ? yearEnt.versions : [])
      setSelectedVersion('')
      setColors([])
      setSelectedColor('')
      setPrice(null)
      setPriceLow(null)
      setPriceHigh(null)
      setExplanation('')
    }
  }, [selectedYear, years])

  useEffect(() => {
    if (selectedVersion) {
      const ver = versions.find((v) => v.name === selectedVersion)
      setColors(ver ? ver.colors : [])
      setSelectedColor('')
      setPrice(null)
      setPriceLow(null)
      setPriceHigh(null)
      setExplanation('')
    }
  }, [selectedVersion, versions])

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

  const calcPrice = async () => {
    setValuationLoading(true)
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
      if (res.ok) {
        setPrice(resData.price ?? resData.priceSuggested ?? null)
        setPriceLow(resData.priceLow ?? null)
        setPriceHigh(resData.priceHigh ?? null)
        setExplanation(resData.explanation || '')
      }
    } catch (err) {
      console.error('valuation error', err)
    } finally {
      setValuationLoading(false)
    }
  }

  const handleViewDetails = () => {
    if (!session) {
      setProModalMessage('Vui lòng đăng nhập và nâng cấp gói Pro để xem báo cáo chi tiết định giá.')
      setShowProRequiredModal(true)
      return;
    }
    if (!isPro) {
      setProModalMessage('Báo cáo chi tiết định giá là tính năng độc quyền cho thành viên Pro. Vui lòng nâng cấp gói để trải nghiệm.')
      setShowProRequiredModal(true)
      return;
    }
    if (balance < 50000) {
      toast.error('Số dư không đủ. Mỗi lần xem báo cáo chi tiết tốn 50.000 VNĐ.');
      return;
    }

    // Deduct money
    const success = deductBalance(50000);
    if (!success) {
      toast.error('Lỗi khi trừ tiền ví nội bộ.');
      return;
    }
    toast.success('Đã trừ 50.000 VNĐ phí xem báo cáo.');
    setShowModal(true)
  }

  const handleCategoryChange = (category: 'monthly' | 'yearly') => {
    setSelectedCategory(category)
  }

  return (
    <section id='valuation' className='relative z-10 -mt-16 lg:-mt-24 pb-20'>
      <div className='container'>
        <div className='bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-blue-50/60 p-8 lg:p-12 backdrop-blur-3xl overflow-hidden relative'>
          {/* subtle accent blob inside the card */}
          <div className='absolute -top-24 -right-24 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl' />
          <h2 className='text-3xl md:text-4xl font-extrabold text-midnight_text mb-10 text-center relative z-10'>
            Định Giá <span className="text-primary">Xe Của Bạn</span>
          </h2>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10'>
            <div className='lg:col-span-7 space-y-5'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none'
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
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-gray-100'
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
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-gray-100'
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
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-gray-100'
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
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none disabled:opacity-50 disabled:bg-gray-100'
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
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className='w-full appearance-none bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-5 py-3.5 text-gray-700 font-medium transition-all outline-none'
                  />
                  <Icon icon="tabler:road" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl" />
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 mt-8'>
                <button
                  className='bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 text-white px-8 py-4 rounded-xl font-bold flex-1 flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none'
                  onClick={calcPrice}
                  disabled={!selectedColor || !mileage || valuationLoading}
                >
                  <Icon icon="tabler:calculator" className="text-xl" />
                  Định Giá Ngay
                </button>
                <button
                  className='bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-xl font-bold flex-1 flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/40 transition-all'
                  onClick={() => {
                    if (!session) {
                      setProModalMessage('Vui lòng đăng nhập và nâng cấp gói Pro để sử dụng trợ lý định giá hình ảnh AI.')
                      setShowProRequiredModal(true)
                      return;
                    }
                    if (!isPro) {
                      setProModalMessage('Định giá qua ảnh là tính năng độc quyền cho thành viên Pro. Vui lòng nâng cấp gói để trải nghiệm.')
                      setShowProRequiredModal(true)
                      return;
                    }
                    if (balance < 50000) {
                      toast.error('Số dư không đủ. Mỗi lần định giá tốn 50.000 VNĐ.');
                      return;
                    }

                    // Deduct money
                    const success = deductBalance(50000);
                    if (!success) {
                      toast.error('Lỗi khi trừ tiền ví nội bộ.');
                      return;
                    }
                    toast.success('Đã trừ 50.000 VNĐ phí định giá bằng hình ảnh.');
                    setShowImageModal(true);
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
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-700 font-extrabold">Định Giá Qua Ảnh (PRO)</span>
                </button>
              </div>
            </div>
            <div className='lg:col-span-5 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 p-8'>
              {valuationLoading ? (
                <div className='text-center'>
                  <div className='mb-6 h-20 flex items-center justify-center overflow-hidden'>
                    <style>{`
                    @keyframes carMove {
                      0% { transform: translateX(-100px); opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { transform: translateX(500px); opacity: 0; }
                    }
                    .car-animation {
                      animation: carMove 3s infinite;
                    }
                  `}</style>
                    <div className='car-animation text-6xl'>🚗</div>
                  </div>
                  <p className='text-lg font-semibold text-gray-600'>
                    Đang định giá
                    <span className='inline-block w-6 text-left'>
                      <style>{`
                      @keyframes dots {
                        0%, 20% { content: '.'; }
                        40% { content: '..'; }
                        60%, 100% { content: '...'; }
                      }
                      .dots-animation::after {
                        content: '.';
                        animation: dots 1.5s infinite;
                      }
                    `}</style>
                      <span className='dots-animation'></span>
                    </span>
                  </p>
                </div>
              ) : price !== null || priceLow !== null || priceHigh !== null ? (
                <div className='text-center'>
                  <p className='text-xl font-semibold text-gray-600 mb-2'>Giá trong khoảng</p>
                  {(() => {
                    const low = priceLow ?? (price != null ? price - Math.max(15_000_000, Math.round(price * 0.025)) : null)
                    const high = priceHigh ?? (price != null ? price + Math.max(15_000_000, Math.round(price * 0.025)) : null)
                    const showLow = low != null ? Math.max(0, low) : null
                    const showHigh = high ?? null
                    if (showLow != null && showHigh != null) {
                      return (
                        <>
                          <p className='text-4xl sm:text-5xl font-bold text-primary mb-1'>
                            {(showLow / 1_000_000).toFixed(0)} – {(showHigh / 1_000_000).toFixed(0)} triệu
                          </p>
                          <p className='text-sm text-gray-500 mb-4'>
                            Khoảng giá tham khảo thị trường
                          </p>
                        </>
                      )
                    }
                    const single = price ?? priceLow ?? priceHigh ?? 0
                    return (
                      <>
                        <p className='text-5xl font-bold text-primary mb-1'>
                          {(single / 1_000_000).toFixed(0)} triệu
                        </p>
                        <p className='text-sm text-gray-500 mb-4'>
                          {single.toLocaleString('vi-VN')} đ
                        </p>
                      </>
                    )
                  })()}
                  <button
                    className='bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all'
                    onClick={handleViewDetails}
                  >
                    Xem Báo Cáo Chi Tiết
                  </button>
                  <p className='text-xs text-gray-500 mt-3'>
                    Cần hỏi tình huống đặc biệt (ngập nước, va quệt, sơn lại...)? Bấm nút chat góc phải để được tư vấn nhanh.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Icon icon="tabler:car-suv" className="text-6xl text-gray-300" />
                  </div>
                  <p className="text-center font-medium">Nhập thông tin xe của bạn<br />để nhận định giá tức thì</p>
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
                <div className='mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary rounded-lg'>
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
                  <div className='bg-blue-50 border-l-4 border-primary p-4 rounded-lg shadow-sm leading-relaxed whitespace-pre-line'>
                    <span className='block font-semibold text-primary mb-1'>Lý do định giá:</span>
                    <span className='text-gray-700'>
                      Xe <b>Toyota Vios 2019</b> màu <b>bạc</b>, số km đã đi <b>65,000 km</b>, có <b>1 vết xước nhỏ ở cản sau</b> nhưng nội thất còn mới, máy móc vận hành tốt.<br />
                      Giá tham khảo dựa trên các xe cùng đời, cùng tình trạng trên thị trường hiện tại.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPackages(!showPackages)}
                    className='w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold'
                  >
                    {showPackages ? 'Ẩn thông tin chi tiết' : 'Xem thông tin chi tiết định giá'}
                  </button>
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
                                    className='text-2xl text-emerald-400 shrink-0'
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
      {/* Modal upload ảnh định giá */}
      {showImageModal && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative flex flex-col items-center border border-blue-100'>
            <button
              onClick={() => setShowImageModal(false)}
              className='absolute top-3 right-3 text-gray-400 hover:text-primary text-3xl z-10 transition-colors duration-150'
              aria-label='Đóng'
              style={{ lineHeight: '1' }}
            >×</button>
            <div className='w-full flex flex-col items-center pt-6 pb-2 px-6 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl'>
              <h2 className='text-2xl font-extrabold text-primary mb-1 tracking-wide text-center drop-shadow'>Định giá bằng hình ảnh</h2>
              <span className='font-semibold text-base text-blue-900'>{imageSteps[currentStep].label}</span>
              <div className='text-gray-600 text-sm mt-1 mb-2 text-center'>{imageSteps[currentStep].description}</div>
            </div>
            <div className='flex flex-col items-center w-full px-6 py-4'>
              <div className='w-full flex justify-center mb-3'>
                <img
                  src={imageFiles[currentStep] ? URL.createObjectURL(imageFiles[currentStep] as File) : imageSteps[currentStep].example}
                  alt={imageSteps[currentStep].label}
                  className='w-full max-w-xs h-44 object-contain rounded-xl border border-blue-100 shadow bg-gray-50 transition-all duration-200'
                  style={{ background: '#f3f4f6' }}
                />
              </div>
              <input
                id='valuation-image-upload-input'
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={e => {
                  const files = [...imageFiles]
                  files[currentStep] = e.target.files?.[0] || null
                  setImageFiles(files)
                }}
              />
              <button
                className='bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 transition mb-2 w-full mt-2'
                onClick={() => document.getElementById('valuation-image-upload-input')?.click()}
                type='button'
              >
                Tải ảnh lên
              </button>
              {imageFiles[currentStep] && (
                <div className='text-green-600 text-sm mt-1 font-medium'>Đã chọn ảnh: {imageFiles[currentStep]?.name}</div>
              )}
              <div className='flex justify-between items-center w-full mt-5 gap-2'>
                <button
                  className='px-6 py-2 rounded-lg bg-gray-100 text-gray-700 text-base font-semibold border border-gray-200 hover:bg-gray-200 transition disabled:opacity-50'
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                >Trước</button>
                {currentStep < 5 ? (
                  <button
                    className='px-6 py-2 rounded-lg bg-primary text-white text-base font-semibold shadow hover:bg-primary/90 transition disabled:opacity-50'
                    onClick={() => setCurrentStep(s => Math.min(5, s + 1))}
                    disabled={!imageFiles[currentStep]}
                  >Tiếp</button>
                ) : (
                  <button
                    className='px-6 py-2 rounded-lg bg-blue-500 text-white text-base font-semibold shadow hover:bg-blue-600 transition disabled:opacity-50'
                    onClick={() => {
                      setShowImageModal(false)
                      setShowImageLoading(true)
                      setTimeout(() => {
                        setShowImageLoading(false)
                        setShowImageResult(true)
                      }, 7000)
                    }}
                    disabled={imageFiles.some(f => !f)}
                  >Định giá ngay</button>
                )}
              </div>
              <div className='mt-4 text-center text-base text-gray-400 w-full'>Bước {currentStep + 1}/6</div>
            </div>
          </div>
        </div>
      )}
      {/* Modal kết quả định giá bằng hình ảnh (demo) */}
      {showImageResult && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-xl w-full p-8 relative shadow-2xl'>
            <button
              onClick={() => setShowImageResult(false)}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl'
              aria-label='Đóng'
            >✕</button>
            <h2 className='text-2xl font-bold text-primary mb-4 text-center'>Kết quả định giá bằng hình ảnh</h2>
            <div className='mb-4 text-left text-gray-700'>
              <div className='mb-2 flex flex-wrap gap-4'>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Hãng xe: <b>Toyota</b></div>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Dòng xe: <b>Vios</b></div>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Năm sản xuất: <b>2019</b></div>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Màu xe: <b>Bạc</b></div>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Số km: <b>65,000 km</b></div>
                <div className='bg-blue-50 rounded-lg px-4 py-2'>Tình trạng: <b>Có 1 vết xước nhỏ ở cản sau, nội thất sạch sẽ</b></div>
              </div>
              <div className='text-lg font-semibold text-primary mt-4 mb-2'>Giá tham khảo: <span className='text-2xl font-bold'>380 – 400 triệu</span></div>
              <div className='text-base text-gray-600 mb-2'>
                <div className='bg-blue-50 border-l-4 border-primary p-4 rounded-lg shadow-sm leading-relaxed whitespace-pre-line'>
                  <span className='block font-semibold text-primary mb-1'>Lý do định giá:</span>
                  <span className='text-gray-700'>
                    Xe <b>Toyota Vios 2019</b> màu <b>bạc</b>, số km đã đi <b>65,000 km</b>, có <b>1 vết xước nhỏ ở cản sau</b> nhưng nội thất còn mới, máy móc vận hành tốt.<br />
                    Giá tham khảo dựa trên các xe cùng đời, cùng tình trạng trên thị trường hiện tại.
                  </span>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2 mb-2'>
              {imageFiles.map((file, idx) => (
                <div key={idx} className='flex flex-col items-center'>
                  <div className='text-xs text-gray-500 mb-1'>{imageSteps[idx].label}</div>
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Ảnh ${idx + 1}`}
                      className='w-20 h-12 object-cover rounded border shadow'
                    />
                  ) : (
                    <div className='w-20 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400'>No image</div>
                  )}
                </div>
              ))}
            </div>
            <div className='mt-4 text-center'>
              <button
                className='bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition'
                onClick={() => setShowImageResult(false)}
              >Đóng</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal loading AI scan ảnh */}
      {showImageLoading && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-md w-full p-8 relative shadow-2xl flex flex-col items-center'>
            <h2 className='text-2xl font-bold text-primary mb-4 text-center'>Đang phân tích bằng AI...</h2>
            <div className='relative w-50 h-33 mb-4'>
              {imageFiles[0] ? (
                <img
                  src={URL.createObjectURL(imageFiles[0] as File)}
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
            <div className='text-lg text-gray-700 font-semibold mb-2'>Hệ thống đang phân tích ảnh xe của bạn...</div>
            <div className='text-base text-gray-500'>Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      )}

      {/* PRO Required Modal */}
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
              Tính Năng <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600'>PRO</span>
            </h3>

            <p className='text-gray-600 text-lg mb-8 leading-relaxed px-4'>
              {proModalMessage}
            </p>

            <div className='flex flex-col w-full gap-3'>
              {!session ? (
                <button
                  onClick={() => {
                    setShowProRequiredModal(false);
                    if (typeof window !== 'undefined' && typeof (window as any).openSignInModal === 'function') {
                      (window as any).openSignInModal();
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      toast('Vui lòng bấm Đăng Nhập ở góc trên màn hình.', { icon: 'ℹ️' });
                    }
                  }}
                  className='w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-primary to-blue-600 shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2'>
                  Đăng Nhập Để Tiếp Tục <Icon icon="tabler:login" className="text-xl" />
                </button>
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
                  Nâng Cấp PRO Ngay <Icon icon="tabler:arrow-right" className="text-xl" />
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
      />
    </section>
  )
}

export default ValuationForm
