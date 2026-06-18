'use client'
import { SetStateAction, useEffect, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { plansData } from '@/types/plans'
import PlansSkeleton from '@/components/Skeleton/Plans'
import { useWallet } from '@/app/Providers'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import WorldCupSectionDecor, { WorldCupSectionLabel } from '@/components/WorldCupSectionDecor'
import { PERSONAL_PLAN, formatValuationQuota } from '@/lib/plan-limits'

const Pricing = () => {
  const [plans, setPlans] = useState<plansData[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingPlan, setBuyingPlan] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const {
    isPro,
    isUltra,
    accountType,
    buyPro,
    remainingFreeValuations,
    maxValuationsPerMonth,
    syncFreeUsageForUser,
  } = useWallet()
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<'personal' | 'business'>('personal')

  useEffect(() => {
    const email = session?.user?.email ?? null
    const type = session?.user?.accountType ?? null
    syncFreeUsageForUser(email, type)
  }, [session, syncFreeUsageForUser])

  const openSignUp = () => {
    if (typeof window !== 'undefined' && typeof (window as { openSignUpModal?: () => void }).openSignUpModal === 'function') {
      (window as { openSignUpModal?: () => void }).openSignUpModal?.()
    }
  }

  const openSignIn = () => {
    if (typeof window !== 'undefined' && typeof (window as { openSignInModal?: () => void }).openSignInModal === 'function') {
      (window as { openSignInModal?: () => void }).openSignInModal?.()
    }
  }

  const handleBuy = (planName: string, planPrice: number, isUltraTrial?: boolean) => {
    if (isUltraTrial) {
      if (!session) {
        toast.error('Vui lòng đăng nhập để dùng thử!')
        openSignIn()
        return
      }
      if (isUltra) {
        toast('Bạn đang sử dụng Ultra Trial rồi!', { icon: '✅' })
        return
      }
      router.push('/dashboard/plans')
      return
    }

    if (selectedCategory === 'personal') {
      if (session?.user?.accountType === 'personal') {
        toast(`Bạn đang dùng ${PERSONAL_PLAN.name}.`, { icon: '✅' })
        return
      }
      if (session && session.user?.accountType === 'business') {
        toast.error('Tài khoản doanh nghiệp không dùng gói cá nhân. Chuyển sang tab Doanh nghiệp hoặc đăng ký email cá nhân mới.')
        return
      }
      toast('Đăng ký tài khoản cá nhân miễn phí để bắt đầu!', { icon: '👤' })
      openSignUp()
      return
    }

    if (!session) {
      toast.error('Vui lòng đăng nhập để mua gói!')
      openSignIn()
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
  const isPersonalUser = accountType === 'personal' || session?.user?.accountType === 'personal'

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden bg-header py-20 lg:py-28">
      <WorldCupSectionDecor variant="pricing" led />
      <Image src='/images/pricing/upperline.png' alt='upperline-image' width={280} height={219} className='absolute top-[160px] left-[90px] z-[1] hidden sm:block opacity-5' />
      <Image src='/images/pricing/lowerline.png' alt='lowerline-image' width={180} height={100} className='absolute bottom-[0px] right-[90px] z-[1] opacity-5' />
      <div className='container relative z-10 px-4'>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            <WorldCupSectionLabel index={3}>Bảng giá</WorldCupSectionLabel>
          </span>
          <h2 className="mt-2 text-4xl font-black text-midnight_text sm:text-5xl">Gói phù hợp từng đối tượng</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Một gói cá nhân miễn phí — doanh nghiệp mở dashboard đầy đủ. Minh bạch, không phí ẩn.
          </p>
          {selectedCategory === 'personal' && session && isPersonalUser && (
            <p className="mt-3 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              {formatValuationQuota(remainingFreeValuations, maxValuationsPerMonth)}
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
            ? Array.from({ length: selectedCategory === 'personal' ? 1 : 3 }).map((_, i) => <PlansSkeleton key={i} />)
            : filteredPlans.map((item, index) => {
                const isBusiness = selectedCategory === 'business'
                const isUltraTrialPlan = !!item.isUltraTrial
                const isPersonalPlan = !isBusiness && item.heading === PERSONAL_PLAN.name
                const isPopular = isUltraTrialPlan || (isBusiness && index === 1)
                const isPremium = isBusiness && item.heading === 'Gói Năm'
                const personalActive = isPersonalPlan && isPersonalUser

                return (
                  <div
                    className={`relative group transition-all duration-300 w-full ${
                      isSinglePlan ? 'max-w-md' : ''
                    } ${isPremium || isPopular || isPersonalPlan ? 'md:scale-105 lg:scale-105' : ''}`}
                    key={index}
                  >
                    <div
                      className={`relative h-full overflow-hidden transition-all duration-300 ${
                        isSinglePlan ? 'rounded-2xl' : 'rounded-3xl'
                      } ${isPremium || isPopular || isPersonalPlan ? 'bg-gradient-to-br from-slate-50 to-white border-2 border-transparent shadow-2xl' : 'bg-white shadow-xl hover:shadow-2xl'}`}
                    >
                      {(isPremium || isPopular || isPersonalPlan) && (
                        <div className={`absolute top-0 left-0 right-0 py-3 px-4 text-center font-bold text-white text-sm tracking-wide ${
                          isUltraTrialPlan ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 shadow-lg'
                          : isPremium ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg'
                          : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-lg'
                        }`}>
                          {isUltraTrialPlan ? 'MIỄN PHÍ 1 THÁNG' : isPremium ? 'GIÁ TRỊ CAO NHẤT' : 'DÀNH CHO CÁ NHÂN'}
                        </div>
                      )}
                      <div className='absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-3xl opacity-50'></div>
                      <div
                        className={`relative ${isSinglePlan ? 'p-6 pt-7' : 'p-8 pt-10'} ${isPremium || isPopular || isPersonalPlan ? 'pt-16' : ''}`}
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
                            {isUltraTrialPlan ? 'Trải nghiệm đầy đủ 30 ngày'
                              : item.heading === 'Gói Tháng' ? 'Mỗi tháng'
                              : item.heading === 'Gói Quý' ? 'Mỗi quý'
                              : item.heading === 'Gói Năm' ? 'Mỗi năm'
                              : item.price.monthly === 0 ? 'Miễn phí khi đăng ký'
                              : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleBuy(item.heading, item.price.monthly, item.isUltraTrial)}
                          disabled={
                            buyingPlan === item.heading
                            || personalActive
                            || (isBusiness && isPro && !isUltraTrialPlan)
                          }
                          className={`w-full rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 ${
                            isSinglePlan ? 'py-3 px-5 text-base mb-6' : 'py-4 px-6 text-lg mb-8'
                          } ${
                            isUltraTrialPlan
                              ? isUltra
                                ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg cursor-default'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-2xl hover:scale-105'
                              : isBusiness
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-500 hover:to-yellow-700'
                              : isPersonalPlan
                              ? personalActive
                                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg cursor-default'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-2xl hover:scale-105'
                              : 'bg-white border-2 border-gray-200 text-gray-400'
                          } disabled:opacity-60 disabled:scale-100 disabled:cursor-default`}
                        >
                          {buyingPlan === item.heading
                            ? (<><Icon icon='tabler:loader' className='animate-spin text-xl' /> Đang xử lý...</>)
                            : isUltraTrialPlan && isUltra
                            ? (<><Icon icon='tabler:check' className='text-xl' /> Đang dùng Ultra</>)
                            : isBusiness && isPro && !isUltraTrialPlan
                            ? (<><Icon icon='tabler:check' className='text-xl' /> Đã kích hoạt</>)
                            : personalActive
                            ? (<><Icon icon='tabler:check' className='text-xl' /> Đang dùng</>)
                            : item.button}
                        </button>
                        <div className={isSinglePlan ? 'space-y-3' : 'space-y-4'}>
                          <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Tính năng bao gồm:</p>
                          {item.option.map((feature, idx) => (
                            <div key={idx} className='flex items-start gap-3'>
                              <div className='flex-shrink-0 mt-1'>
                                <Icon
                                  icon='tabler:check-circle-filled'
                                  className={`${isSinglePlan ? 'text-base' : 'text-lg'} text-blue-500`}
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
                Bạn đã kích hoạt thành công gói{' '}
                <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500'>
                  Doanh Nghiệp
                </span>{' '}của ValuCar.
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
