import React from 'react'
import Hero from '@/components/Home/Hero'
import People from '@/components/Home/People'
import Features from '@/components/Home/Features'
import ValuationProcess from '@/components/Home/ValuationProcess'
import ValuationForm from '@/components/Home/ValuationForm'
import Business from '@/components/Home/Business'
import Payment from '@/components/Home/Payment'
import Pricing from '@/components/Home/Pricing'
import { Metadata } from 'next'
import ContactForm from '@/components/Contact/Form'
export const metadata: Metadata = {
  title: 'ValuCar - Định Giá Xe Ô Tô Thông Minh',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <ValuationForm />
      <Features />
      <ValuationProcess />
      <Pricing />
      <ContactForm />
      <People />
    </main>
  )
}
