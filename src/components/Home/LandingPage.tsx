'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Hero from '@/components/Home/Hero'
import GuestValuationForm from '@/components/Home/GuestValuationForm'
import LandingTrustBand from '@/components/Home/LandingTrustBand'
import People from '@/components/Home/People'
import Features from '@/components/Home/Features'
import ValuationProcess from '@/components/Home/ValuationProcess'
import Pricing from '@/components/Home/Pricing'
import LandingBusinessCta from '@/components/Home/LandingBusinessCta'
import ContactForm from '@/components/Contact/Form'
import { Icon } from '@iconify/react/dist/iconify.js'

export default function LandingPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const loginHint = searchParams.get('login') === '1'

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (loginHint && status === 'unauthenticated' && typeof window !== 'undefined') {
      const t = window.setTimeout(() => {
        if (typeof (window as Window & { openSignInModal?: () => void }).openSignInModal === 'function') {
          ;(window as Window & { openSignInModal?: () => void }).openSignInModal!()
        }
      }, 400)
      return () => window.clearTimeout(t)
    }
  }, [loginHint, status])

  if (status === 'authenticated') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
      </div>
    )
  }

  return (
    <main className="overflow-x-hidden">
      {loginHint && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 py-3 text-center text-sm font-medium text-amber-900">
          <Icon icon="tabler:info-circle" className="mr-1 inline text-lg align-[-4px]" />
          Đăng nhập doanh nghiệp để vào dashboard — lưu lịch sử & công cụ sales đầy đủ.
        </div>
      )}

      <Hero />

      <div className="relative bg-gradient-to-b from-slate-50/80 via-white to-white pb-4">
        <GuestValuationForm />
        <LandingTrustBand />
      </div>

      <ValuationProcess />
      <Features />

      <section className="bg-slate-50/50 py-4">
        <People />
      </section>

      <Pricing />
      <LandingBusinessCta />

      <section id="contact" className="scroll-mt-24">
        <ContactForm />
      </section>
    </main>
  )
}
