import { NextResponse } from 'next/server'

import { headerItem } from '@/app/types/menu'
import { featureData } from '@/app/types/featuredata'
import { socialLinksData } from '@/app/types/sociallinks'
import { plansData } from '@/app/types/plans'
import { footerlLinksData } from '@/app/types/footerlinks'

const HeaderData: headerItem[] = [
  { label: 'Sản Phẩm', href: '/#product' },
  { label: 'Giá', href: '/#pricing' },
  { label: 'Tính Năng', href: '/#features ' },
  { label: 'Liên Hệ', href: '/#contact ' },
  { label: 'Tài Liệu', href: '/documentation' },
]

const FeatureData: featureData[] = [
  {
    imgSrc: '/images/features/time.svg',
    heading: 'Định Giá Xe Nhanh Chóng',
    paragraph:
      'Đánh giá giá trị xe của bạn ngay lập tức. Nhận thông tin chính xác về giá trị thị trường. Luôn nắm bắt giá trị xe một cách dễ dàng.',
  },
  {
    imgSrc: '/images/features/signal.svg',
    heading: 'So Sánh Thị Trường',
    paragraph:
      'Xem giá xe theo khu vực và loại. Phân tích xu hướng thị trường. Đưa ra quyết định mua bán thông minh với thông tin rõ ràng.',
  },
  {
    imgSrc: '/images/features/dollar.svg',
    heading: 'Quản Lý Danh Mục Xe',
    paragraph:
      'Liên kết tất cả xe của bạn. Theo dõi giá trị và hoạt động. Quản lý mọi thứ trong một bảng điều khiển.',
  },
]

const PlansData: plansData[] = [
  {
    heading: 'Cơ Bản',
    price: {
      monthly: 19,
      yearly: 190,
    },
    subscriber: 0.5,
    button: 'Mua Ngay',
    option: [
      'Định giá xe cơ bản',
      'Báo cáo PDF có thể tải xuống',
      'Giao dịch không giới hạn',
      'Email cho tất cả cập nhật',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/starone.svg',
  },
  {
    heading: 'Tiêu Chuẩn',
    price: {
      monthly: 29,
      yearly: 290,
    },
    subscriber: 0.5,
    button: 'Mua Ngay',
    option: [
      'Tất cả tính năng Cơ Bản',
      'Mẫu báo cáo tùy chỉnh',
      'Hỗ trợ tính toán thuế',
      'Nhắc nhở định giá tự động',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/startwo.svg',
  },
  {
    heading: 'Cao Cấp',
    price: {
      monthly: 59,
      yearly: 590,
    },
    subscriber: 0.5,
    button: 'Mua Ngay',
    option: [
      'Tất cả tính năng Tiêu Chuẩn',
      'Hỗ trợ đa tiền tệ',
      'Theo dõi thanh toán định giá',
      'Hỗ trợ khách hàng ưu tiên',
    ],
    category: ['monthly', 'yearly'],
    imgSrc: '/images/pricing/starthree.svg',
  },
]

const FooterLinks: footerlLinksData[] = [
  { label: 'Sản Phẩm', href: '/#product' },
  { label: 'Giá', href: '/#pricing' },
  { label: 'Tính Năng', href: '/#features ' },
  { label: 'Liên Hệ', href: '/#contact ' },
]

const SocialLinks: socialLinksData[] = [
  {
    imgSrc: 'fa-brands:facebook-f',
    link: 'www.facebook.com',
    width: 10,
  },
  {
    imgSrc: 'fa6-brands:instagram',
    link: 'www.instagram.com',
    width: 14,
  },
  {
    imgSrc: 'fa6-brands:twitter',
    link: 'www.twitter.com',
    width: 14,
  },
]

export const GET = () => {
  return NextResponse.json({
    HeaderData,
    FeatureData,
    PlansData,
    FooterLinks,
    SocialLinks,
  })
}
