'use client'
import { SetStateAction, useEffect, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { plansData } from '@/types/plans'
import PlansSkeleton from '@/components/Skeleton/Plans'
import { useWallet } from '@/app/Providers'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

const Pricing = () => {
  const [plans, setPlans] = useState<plansData[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { isPro, buyPro, remainingFreeValuations, syncFreeUsageForUser } = useWallet()
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState<'personal' | 'business'>('personal')

  useEffect(() => {
    const email = (session?.user as any)?.email as string | undefined
    syncFreeUsageForUser(email ?? null)
  }, [session, syncFreeUsageForUser])

  const handleBuy = (planName: string, planPrice: number) => {
    if (selectedCategory === 'personal') {
      toast('Gói Cá nhân miễn phí: 3 lượt định giá/tháng.', { icon: 'ℹ️' })
      return
    }
    if (!session) {
      toast.error('Vui lòng đăng nhập để mua gói!')
      if (typeof window !== 'undefined' && typeof (window as any).openSignInModal === 'function') {
        (window as any).openSignInModal()
      }
      return
    }
    if (isPro) {
      toast.error('Bạn đã sở hữu gói Doanh nghiệp rồi!')
      return
    }

    setBuyingPlan(planName)
    setTimeout(() => {
      const isBought = buyPro(planPrice)
      setBuyingPlan(null)
      if (isBought) setShowSuccessModal(true)
    }, 2500)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setPlans(data.PlansData)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCategoryChange = (category: SetStateAction<'personal' | 'business'>) => {
    setSelectedCategory(category)
  }

  const filteredPlans = plans.filter((item) => item.category.includes(selectedCategory))
  const isSinglePlan = !loading && filteredPlans.length === 1

  return (
    <section id='pricing' className='bg-header relative py-20'>
      <Image src='/images/pricing/upperline.png' alt='upperline-image' width={280} height={219} className='absolute top-[160px] left-[90px] hidden sm:block opacity-5' />
      <Image src='/images/pricing/lowerline.png' alt='lowerline-image' width={180} height={100} className='absolute bottom-[0px] right-[90px] opacity-5' />
      <div className='container px-4'>
        <div className='max-w-3xl mx-auto text-center mb-16'>
          <h2 className='text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-midnight_text to-midnight_text bg-clip-text'>Gói Giá Của Chúng Tôi</h2>
          <p className='text-lg text-gray-600 leading-relaxed'>Chọn gói phù hợp với nhu cầu của bạn. Minh bạch, không có phí ẩn, và có thể nâng cấp bất kỳ lúc nào.</p>
          {selectedCategory === 'personal' && (
            <p className='mt-3 inline-block rounded-full bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-800'>
              Lượt miễn phí còn lại tháng này: {remainingFreeValuations}/3
            </p>
          )}
        </div>

        <div className='flex justify-center mb-12'>
          <div className='inline-flex gap-1 p-1 bg-gray-100 rounded-full shadow-md border border-gray-200/50'>
            <button className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${selectedCategory === 'personal' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => handleCategoryChange('personal')}>Cá Nhân</button>
            <button className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${selectedCategory === 'business' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => handleCategoryChange('business')}>Doanh Nghiệp</button>
          </div>
        </div>

        <div
          className={`mt-16 grid gap-8 px-4 max-w-7xl mx-auto ${
            isSinglePlan ? 'grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <PlansSkeleton key={i} />)
            : filteredPlans.map((item, index) => {
                const isBusiness = selectedCategory === 'business'
                const isPopular = isBusiness && index === 1
                const isPremium = isBusiness && item.heading === 'Gói Năm'

                return (
                  <div
                    className={`relative group transition-all duration-300 w-full ${
                      isSinglePlan ? 'max-w-md' : ''
                    } ${isPremium || isPopular ? 'md:scale-105 lg:scale-105' : ''}`}
                    key={index}
                  >
                    <div
                      className={`relative h-full overflow-hidden transition-all duration-300 ${
                        isSinglePlan ? 'rounded-2xl' : 'rounded-3xl'
                      } ${isPremium || isPopular ? 'bg-gradient-to-br from-slate-50 to-white border-2 border-transparent shadow-2xl' : 'bg-white shadow-xl hover:shadow-2xl'}`}
                    >
                      {(isPremium || isPopular) && (
                        <div className={`absolute top-0 left-0 right-0 py-3 px-4 text-center font-bold text-white text-sm tracking-wide ${isPremium ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 shadow-lg'}`}>
                          {isPremium ? 'GIÁ TRỊ CAO NHẤT' : 'PHỔ BIẾN NHẤT'}
                        </div>
                      )}
                      <div className='absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-3xl opacity-50'></div>
                      <div
                        className={`relative ${isSinglePlan ? 'p-6 pt-7' : 'p-8 pt-10'} ${isPremium || isPopular ? 'pt-16' : ''}`}
                      >
                        <h3
                          className={`font-bold text-midnight_text mb-2 group-hover:text-primary transition-colors ${
                            isSinglePlan ? 'text-xl' : 'text-2xl'
                          }`}
                        >
                          {item.heading}
                        </h3>
                        <div className={`h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full ${isSinglePlan ? 'w-10 mb-4' : 'w-12 mb-6'}`}></div>
                        <div className={isSinglePlan ? 'mb-6' : 'mb-8'}>
                          <div className='flex items-baseline gap-2'>
                            <span
                              className={`font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent ${
                                isSinglePlan ? 'text-4xl' : 'text-5xl'
                              }`}
                            >
                              {item.price.monthly.toLocaleString('vi-VN')}
                            </span>
                            <span className={`font-semibold text-gray-600 ${isSinglePlan ? 'text-lg' : 'text-2xl'}`}>đ</span>
                          </div>
                          <p className='text-gray-500 text-sm mt-2 font-medium'>
                            {item.heading === 'Gối Tháng' ? 'Mỗi tháng' : item.heading === 'Gói Quý' ? 'Mỗi quý' : item.heading === 'Gói Năm' ? 'Mỗi năm' : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBuy(item.heading, item.price.monthly)}
                          disabled={buyingPlan === item.heading}
                          className={`w-full rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 ${
                            isSinglePlan ? 'py-3 px-5 text-base mb-6' : 'py-4 px-6 text-lg mb-8'
                          } ${isBusiness ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-500 hover:to-yellow-700' : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105'}`}
                        >
                          {buyingPlan === item.heading ? (<><Icon icon='tabler:loader' className='animate-spin text-xl' /> Đang xử lý...</>) : isBusiness && isPro ? (<><Icon icon='tabler:check' className='text-xl' /> Đã kích hoạt</>) : item.button}
                        </button>
                        <div className={isSinglePlan ? 'space-y-3' : 'space-y-4'}>
                          <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Tính năng bao gồm:</p>
                          {item.option.map((feature, idx) => (
                            <div key={idx} className='flex items-start gap-3'>
                              <div className='flex-shrink-0 mt-1'>
                                <Icon
                                  icon='tabler:check-circle-filled'
                                  className={`${isSinglePlan ? 'text-base' : 'text-lg'} ${isBusiness ? 'text-blue-500' : 'text-emerald-500'}`}
                                />
                              </div>
                              <p className='text-gray-700 font-medium text-sm leading-relaxed'>{feature}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
        </div>
      </div>

      {showSuccessModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4'>
          <div className='bg-white rounded-3xl max-w-md w-full p-10 relative shadow-2xl flex flex-col items-center text-center transform transition-all animate-slide-up border border-yellow-100'>
            <div className='absolute -top-16 z-10'>
              <div className='w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50 border-4 border-white animate-bounce-soft'>
                <Icon icon='tabler:check' className='text-6xl text-white font-bold' />
              </div>
            </div>
            <div className='pt-20'>
              <h3 className='text-3xl font-black text-midnight_text mb-4'>🎉 Chúc Mừng!</h3>
              <p className='text-gray-600 text-base mb-8 leading-relaxed'>
                Bạn đã kích hoạt thành công gói <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 font-bold'>Doanh Nghiệp</span> của ValuCar.
              </p>
              <button onClick={() => { setShowSuccessModal(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className='w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex justify-center items-center gap-2'>
                Bắt Đầu Ngay
                <Icon icon='tabler:arrow-right' className='text-xl' />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Pricing
