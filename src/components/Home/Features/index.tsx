'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useEffect, useState } from 'react'
import { featureData } from '@/types/featuredata'
import FeatureSkeleton from '@/components/Skeleton/Features'

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
    <section id='features'>
      <div className='container'>
        <h2 className='text-midnight_text text-center mb-5 max-w-xl mx-auto sm:leading-16'>
          Mọi Thứ Bạn Cần. Được Tích Hợp Sẵn.
        </h2>
        <p className='text-black/60 text-lg text-center md:max-w-[60%] mx-auto'>
          Luôn cập nhật giá trị xe, hóa đơn, và danh mục — tất cả từ một nơi.
          Hệ thống định giá xe giúp bạn quản lý tài sản xe với sự rõ ràng, kiểm soát, và không rắc rối.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10'>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <FeatureSkeleton key={i} />
              ))
            : features.map((item, i) => (
                <div key={i} className='bg-white rounded-2xl p-5 shadow-lg'>
                  <Image
                    src={item.imgSrc}
                    alt={item.imgSrc}
                    width={55}
                    height={55}
                    className='mb-2'
                  />
                  <h3 className='text-2xl font-semibold text-black mt-5'>
                    {item.heading}
                  </h3>
                  <p className='text-lg text-black/50 my-2 leading-6'>
                    {item.paragraph}
                  </p>
                  <Link
                    href={'/'}
                    className='text-primary hover:text-blue-700 text-xl font-medium flex items-center gap-2 mt-6 pb-2'>
                    Tìm hiểu thêm
                    <Icon icon='tabler:arrow-right' className='text-2xl' />
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

export default Features
