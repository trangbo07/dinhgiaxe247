'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { plansData } from '@/types/plans'
import PlansSkeleton from '@/components/Skeleton/Plans'
import { useWallet } from '@/app/Providers'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import WorldCupSectionDecor, { WorldCupSectionLabel } from '@/components/WorldCupSectionDecor'
import { formatValuationQuota } from '@/lib/plan-limits'

const Pricing = () => {
  const [plans, setPlans] = useState<plansData[]>([])
  const [loading, setLoading] = useState(true)
  const { isPro, remainingFreeValuations, maxValuationsPerMonth } = useWallet()
  const { data: session } = useSession()
  const router = useRouter()

  const openSignIn = () => {
    if (typeof window !== 'undefined' && typeof (window as { openSignInModal?: () => void }).openSignInModal === 'function') {
      (window as { openSignInModal?: () => void }).openSignInModal?.()
    }
  }

  const handleBuy = () => {
    if (!session) {
      toast.error('Vui lòng đăng nhập để mua gói!')
      openSignIn()
      return
    }
    if (isPro) {
      toast.success('Bạn đã sở hữu gói Doanh nghiệp rồi!')
      return
    }
    router.push('/dashboard/plans')
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
          <h2 className="mt-2 text-4xl font-black text-midnight_text sm:text-5xl">Gói Doanh Nghiệp</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            4 lượt định giá miễn phí mỗi tháng — nâng cấp gói Doanh nghiệp để dùng không giới hạn. Minh bạch, không phí ẩn.
          </p>
          {session && !isPro && (
            <p className="mt-3 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              {formatValuationQuota(remainingFreeValuations, maxValuationsPerMonth)}
            </p>
          )}
        </div>

        <div
          className='mt-16 grid gap-8 px-4 max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <PlansSkeleton key={i} />)
            : plans.map((item, index) => {
                const isPremium = item.heading === 'Gói Năm'
                const isPopular = index === 1

                return (
                  <div
                    className={`relative group transition-all duration-300 w-full ${
                      isPremium || isPopular ? 'md:scale-105 lg:scale-105' : ''
                    }`}
                    key={index}
                  >
                    <div
                      className={`relative h-full overflow-hidden rounded-3xl transition-all duration-300 ${
                        isPremium || isPopular ? 'bg-gradient-to-br from-slate-50 to-white border-2 border-transparent shadow-2xl' : 'bg-white shadow-xl hover:shadow-2xl'
                      }`}
                    >
                      {(isPremium || isPopular) && (
                        <div className={`absolute top-0 left-0 right-0 py-3 px-4 text-center font-bold text-white text-sm tracking-wide ${
                          isPremium ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg'
                          : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-lg'
                        }`}>
                          {isPremium ? 'GIÁ TRỊ CAO NHẤT' : 'PHỔ BIẾN NHẤT'}
                        </div>
                      )}
                      <div className='absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full blur-3xl opacity-50'></div>
                      <div
                        className={`relative p-8 pt-10 ${isPremium || isPopular ? 'pt-16' : ''}`}
                      >
                        <h3 className='font-bold text-midnight_text mb-2 group-hover:text-primary transition-colors text-2xl'>
                          {item.heading}
                        </h3>
                        <div className='h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full w-12 mb-6'></div>
                        <div className='mb-8'>
                          <div className='flex items-baseline gap-2'>
                            <span className='font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent text-5xl'>
                              {item.price.monthly.toLocaleString('vi-VN')}
                            </span>
                            <span className='font-semibold text-gray-600 text-2xl'>đ</span>
                          </div>
                          <p className='text-gray-500 text-sm mt-2 font-medium'>
                            {item.heading === 'Gói Tháng' ? 'Mỗi tháng'
                              : item.heading === 'Gói Quý' ? 'Mỗi quý'
                              : item.heading === 'Gói Năm' ? 'Mỗi năm'
                              : ''}
                          </p>
                        </div>
                        <button
                          onClick={handleBuy}
                          disabled={isPro}
                          className={`w-full rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 py-4 px-6 text-lg mb-8 ${
                            'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-500 hover:to-yellow-700'
                          } disabled:opacity-60 disabled:scale-100 disabled:cursor-default`}
                        >
                          {isPro
                            ? (<><Icon icon='tabler:check' className='text-xl' /> Đã kích hoạt</>)
                            : item.button}
                        </button>
                        <div className='space-y-4'>
                          <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Tính năng bao gồm:</p>
                          {item.option.map((feature, idx) => (
                            <div key={idx} className='flex items-start gap-3'>
                              <div className='flex-shrink-0 mt-1'>
                                <Icon
                                  icon='tabler:check-circle-filled'
                                  className='text-lg text-blue-500'
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
    </section>
  )
}

export default Pricing
