import { NextResponse } from 'next/server'

import { headerItem } from '@/types/menu'
import { featureData } from '@/types/featuredata'
import { socialLinksData } from '@/types/sociallinks'
import { plansData } from '@/types/plans'
import { footerlLinksData } from '@/types/footerlinks'

const HeaderData: headerItem[] = [
  { label: 'Định giá', href: '/#valuation' },
  { label: 'So sánh xe', href: '/compare' },
  { label: 'Checklist', href: '/checklist' },
  { label: 'Quy trình', href: '/#how-it-works' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Bảng giá', href: '/#pricing' },
  { label: 'Liên hệ', href: '/#contact' },
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
    heading: 'Gói Cá Nhân',
    price: {
      monthly: 0,
      yearly: 0,
    },
    subscriber: 0,
    button: 'Đăng ký miễn phí',
    option: [
      '10 lượt định giá / tháng',
      '10 lượt hỏi đáp AI mỗi lần định giá',
      'Checklist mua xe ',
      'Báo cáo định giá xe ',
      'Lịch sử định giá xe',
      'Định giá bằng hình ảnh AI',
      'So sánh 2 dòng xe',
      'Dịch vụ chăm sóc khách hàng 24/7',
    ],
    category: ['personal'],
    imgSrc: '/images/pricing/starone.svg',
  },
  {
    heading: 'Gói Tháng',
    price: {
      monthly: 129000,
      yearly: 129000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Quý',
    price: {
      monthly: 350000,
      yearly: 350000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Năm',
    price: {
      monthly: 1499000,
      yearly: 1499000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Ultra 1 Tháng',
    price: {
      monthly: 0,
      yearly: 0,
    },
    subscriber: 0,
    button: 'Dùng thử miễn phí',
    isUltraTrial: true,
    option: [
      'Đầy đủ tính năng Doanh nghiệp trong 1 tháng',
      'Không giới hạn lượt định giá',
      'Không giới hạn hỏi đáp AI',
      'Quản lý khách từ website (leads)',
      'Báo cáo định giá chuyên sâu',
      'Không cần thẻ ngân hàng',
    ],
    category: ['business'],
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
    link: 'https://www.facebook.com/profile.php?id=61590451947338',
    width: 10,
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
