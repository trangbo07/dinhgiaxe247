'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import data from '../../../../../data.json'
import { plansData } from '@/app/types/plans'

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
  const [showModal, setShowModal] = useState(false)
  const [explanation, setExplanation] = useState<string>('')
  const [valuationLoading, setValuationLoading] = useState(false)
  const [showPackages, setShowPackages] = useState(false)
  const [plans, setPlans] = useState<plansData[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'monthly' | 'yearly'>('yearly')

  useEffect(() => {
    // load brands
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
      setExplanation('')
    }
  }, [selectedYear, years])

  useEffect(() => {
    if (selectedVersion) {
      const ver = versions.find((v) => v.name === selectedVersion)
      setColors(ver ? ver.colors : [])
      setSelectedColor('')
      setPrice(null)
      setExplanation('')
    }
  }, [selectedVersion, versions])

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true)
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setPlans(data.PlansData)
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  const calcPrice = async () => {
    setValuationLoading(true)
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: selectedBrand,
          model: selectedModel,
          year: selectedYear,
          color: selectedColor,
          mileage,
        }),
      })
      const data = await res.json()
      if (data.price) {
        setPrice(data.price)
        setExplanation(data.explanation || '')
      }
    } catch (err) {
      console.error('valuation error', err)
    } finally {
      setValuationLoading(false)
    }
  }

  const handleCategoryChange = (category: 'monthly' | 'yearly') => {
    setSelectedCategory(category)
  }

  return (
    <section className='py-20 bg-white'>
      <div className='container'>
        <h2 className='text-3xl font-bold text-midnight_text mb-8 text-center'>
          Định Giá Xe
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className='w-full border rounded-lg p-3'
            >
              <option value=''>Chọn hãng</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!models.length}
            >
              <option value=''>Chọn mẫu</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!years.length}
            >
              <option value=''>Chọn năm</option>
              {years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!versions.length}
            >
              <option value=''>Chọn phiên bản</option>
              {versions.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!colors.length}
            >
              <option value=''>Chọn màu</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type='number'
              placeholder='Quãng đường (km)'
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className='w-full border rounded-lg p-3'
            />
            <button
              className='bg-primary text-white px-6 py-3 rounded-full w-full mt-4'
              onClick={calcPrice}
              disabled={!selectedColor || !mileage}
            >
              Tính giá
            </button>
          </div>
          <div className='flex items-center justify-center'>
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
            ) : price !== null ? (
              <div className='text-center'>
                <p className='text-xl font-semibold text-gray-600 mb-2'>Giá Ước Tính:</p>
                <p className='text-5xl font-bold text-primary mb-1'>
                  {(price / 1000000).toFixed(0)} triệu
                </p>
                <p className='text-sm text-gray-500 mb-4'>
                  {price.toLocaleString('vi-VN')} đ
                </p>
                <button
                  className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition'
                  onClick={() => setShowModal(true)}
                >
                  Xem thông tin chi tiết
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal for packages */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl'>
            <div className='sticky top-0 bg-white border-b p-6 flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Thông Tin Định Giá Chi Tiết</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setShowPackages(false)
                }}
                className='text-gray-500 hover:text-gray-700 text-2xl'
              >
                ✕
              </button>
            </div>

            <div className='p-6'>
              {price && (
                <div className='mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary rounded-lg'>
                  <p className='text-gray-600 text-center mb-2'>Giá Định Giá</p>
                  <p className='text-4xl font-bold text-primary text-center'>
                    {(price / 1000000).toFixed(0)} triệu đ
                  </p>
                  <p className='text-sm text-gray-500 text-center mt-2'>
                    {price.toLocaleString('vi-VN')} VND
                  </p>
                </div>
              )}
              {explanation && (
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold text-primary mb-3'>Lý Do Định Giá</h3>
                  <div className='bg-blue-50 border-l-4 border-primary p-4 rounded text-gray-700 leading-relaxed mb-4'>
                    {explanation}
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
              alt='upperline-image'
              width={280}
              height={219}
              className='absolute top-[160px] left-[90px] hidden sm:block opacity-5'
            />
            <Image
              src='/images/pricing/lowerline.png'
              alt='lowerline-image'
              width={180}
              height={100}
              className='absolute bottom-[0px] right-[90px] opacity-5'
            />
            <div className='container px-4 py-12 border-t'>
              {showPackages && (
                <>
                  <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6'>
                    <p className='text-sm text-yellow-800'>
                      <span className='font-semibold'>💡 Gợi ý:</span> Để xem chi tiết đầy đủ và lịch sử định giá, vui lòng chọn một gói phù hợp bên dưới.
                    </p>
                  </div>

                  <h3 className='text-2xl font-bold text-center mb-4'>Các Gói Của Chúng Tôi</h3>
                  <p className='text-lg font-normal text-center text-black/60 pt-5 max-w-2xl mx-auto'>
                    Chọn gói phù hợp để đăng ký và tiếp tục xem thêm thông tin chi tiết.
                  </p>

              {/* Yearly/Monthly Toggle Buttons */}
              <div className='mt-6 relative'>
                <div className='flex justify-center'>
                  <div className='bg-deepSlate flex py-1 px-1 rounded-full'>
                    <button
                      className={`text-xl font-medium cursor-pointer ${
                        selectedCategory === 'yearly'
                          ? 'text-primary bg-white rounded-full py-2 px-4 sm:py-4 sm:px-16'
                          : 'text-white py-2 px-4 sm:py-4 sm:px-16'
                      }`}
                      onClick={() => handleCategoryChange('yearly')}>
                      Hàng Năm
                    </button>
                    <button
                      className={`text-xl font-medium cursor-pointer ${
                        selectedCategory === 'monthly'
                          ? 'text-primary bg-white rounded-full py-2 px-4 sm:py-4 sm:px-16'
                          : 'text-white py-2 px-4 sm:py-4 sm:px-16'
                      }`}
                      onClick={() => handleCategoryChange('monthly')}>
                      Hàng Tháng
                    </button>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-16 mx-5 gap-6'>
                {loadingPlans ? (
                  <p>Loading...</p>
                ) : (
                  plans
                    .filter((plan) => plan.category.includes(selectedCategory))
                    .map((plan, index) => (
                      <div
                        className='pt-10 pb-28 px-10 bg-white rounded-2xl shadow-lg relative hover:bg-primary group overflow-hidden'
                        key={index}>
                        <Image
                          src={plan.imgSrc}
                          alt='star-image'
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
                            : plan.price.yearly.toLocaleString('vi-VN')} đ
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

                        {/* Plan Features with icons */}
                        <div className='mt-6'>
                          {plan.option.map((feature, idx) => (
                            <div key={idx} className='flex gap-4 pt-4'>
                              <Icon
                                icon='tabler:circle-check-filled'
                                className='text-2xl text-emerald-400'
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
    </section>
  )
}

export default ValuationForm
