import React from 'react'
import Hero from '@/app/components/Home/Hero'
import People from '@/app/components/Home/People'
import Features from '@/app/components/Home/Features'
import ValuationProcess from '@/app/components/Home/ValuationProcess'
import ValuationForm from '@/app/components/Home/ValuationForm'
import Business from '@/app/components/Home/Business'
import Payment from '@/app/components/Home/Payment'
import Pricing from '@/app/components/Home/Pricing'
import { Metadata } from 'next'
import ContactForm from './components/Contact/Form'
export const metadata: Metadata = {
  title: 'ValuCar - Định Giá Xe Ô Tô Thông Minh',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <People />
      <Features />
      <ValuationProcess />
      <ValuationForm />
      <Business />
      <Payment />
      <Pricing />
      <ContactForm />
    </main>
  )
}
