'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useEffect, useState } from 'react'
import { footerlLinksData } from '@/types/footerlinks'
import { socialLinksData } from '@/types/sociallinks'
import ContactChannels from '@/components/Contact/ContactChannels'

const Footer = () => {
  const [footerLinks, setFooterLinks] = useState<footerlLinksData[]>([])
  const [socialLinks, setSocialLinks] = useState<socialLinksData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setFooterLinks(data.FooterLinks)
        setSocialLinks(data.SocialLinks)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className='bg-midnight_text'>
      <div className='container p-4'>
        <div className='my-6 grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-y-8 gap-x-6'>
          <div className='sm:col-span-6 lg:col-span-3'>
            <div className='flex shrink-0 items-center border-right'>
              <Image
                src='/images/logo/logo_white.png'
                alt='logo'
                width={214}
                height={55}
              />
            </div>
            <ContactChannels variant="footer" title="Liên hệ" className="mt-6 lg:hidden" />
          </div>
          <div className='sm:col-span-6 lg:col-span-4 flex items-center'>
            <div className='flex gap-4'>
              {footerLinks.map((items, i) => (
                <div key={i}>
                  <Link
                    href={`${items.href}`}
                    className='text-lg font-normal text-white/60 flex items-center justify-center hover:text-white hover:underline'>
                    {items.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className='hidden lg:col-span-3 lg:block'>
            <ContactChannels variant="footer" title="Liên hệ" />
          </div>
          <div className='sm:col-span-6 lg:col-span-2'>
            <div className='flex gap-4 lg:justify-end'>
              {socialLinks.map((items, i) => (
                <Link
                  href={items.link.startsWith('http') ? items.link : `https://${items.link}`}
                  key={i}
                  target="_blank"
                  rel="noopener noreferrer">
                  <div className='bg-white/20 h-12 w-12 shadow-xl text-base rounded-full flex items-center justify-center text-white hover:text-black hover:bg-white'>
                    <Icon icon={items.imgSrc} className='text-2xl' />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className='pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-t-white/30'>
          <h4 className='text-lg text-center md:text-start font-normal text-white/60'>
            @2025. Tất cả quyền được bảo lưu bởi{' '}
            <Link
              href='https://getnextjstemplates.com/'
              className='hover:text-white'>
              ValuCar - Định Giá Xe Ô Tô Thông Minh
            </Link>
          </h4>
          <div className='flex gap-5  justify-center items-center md:justify-start'>
            <h4 className='text-lg font-normal text-white/60 hover:text-white'>
              <Link href='/chinh-sach-bao-mat'>
                Chính sách Bảo mật
              </Link>
            </h4>
            <div className='h-5 bg-white opacity-60 w-0.5'></div>
            <h4 className='text-lg font-normal text-white/60 hover:text-white'>
              <Link href='/dieu-khoan-dieu-kien'>
                Điều khoản và Điều kiện
              </Link>
            </h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
