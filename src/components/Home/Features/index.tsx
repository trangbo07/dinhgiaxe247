'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useEffect, useState } from 'react'
import { featureData } from '@/types/featuredata'
import FeatureSkeleton from '@/components/Skeleton/Features'
import WorldCupSectionDecor, { WorldCupSectionLabel, WorldCupIconAccent } from '@/components/WorldCupSectionDecor'

const Features = () => {
  const [features, setFeatures] = useState<featureData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setFeatures(data.FeatureData)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section id="features" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28">
      <WorldCupSectionDecor variant="features" />
      <div className="container relative z-10 px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            <WorldCupSectionLabel index={1}>Tính năng</WorldCupSectionLabel>
          </span>
          <h2 className="mt-2 text-3xl font-black text-midnight_text sm:text-4xl lg:text-5xl">
            Một nền tảng cho cả khách lẻ & showroom
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Từ định giá nhanh trên landing đến dashboard doanh nghiệp — ValuCar gom dữ liệu thị trường,
            AI và quản lý lead trên cùng hệ thống.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <FeatureSkeleton key={i} />)
            : features.map((item, i) => (
                <div
                  key={i}
                  className="wc-feature-card group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                  <WorldCupIconAccent index={i}>
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Image
                        src={item.imgSrc}
                        alt=""
                        width={40}
                        height={40}
                        className="opacity-90"
                      />
                    </div>
                  </WorldCupIconAccent>
                  <h3 className="relative mt-5 text-xl font-bold text-midnight_text">
                    {item.heading}
                  </h3>
                  <p className="relative my-2 text-base leading-relaxed text-slate-500">
                    {item.paragraph}
                  </p>
                  <Link
                    href="/#valuation"
                    className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-blue-700">
                    Thử định giá
                    <Icon
                      icon="tabler:arrow-right"
                      className="text-lg transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

export default Features
