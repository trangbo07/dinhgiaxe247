'use client'

import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

const tips = [
  {
    title: 'Chụp ảnh trước khi định giá',
    body: 'Dùng workflow 6 ảnh trong mục Định giá — khách tin tưởng hơn khi thấy quy trình chuẩn.',
  },
  {
    title: 'Hỏi AI về tình trạng xe',
    body: 'Ngập nước, va quệt, sơn lại: chat sẽ ước lượng ảnh hưởng dựa trên giá vừa định.',
  },
  {
    title: 'Đăng tin 19:30–22:00',
    body: 'Khung giờ vàng giúp tăng inbox trên Chợ Tốt / Bonbanh (gợi ý trong báo cáo PRO).',
  },
  {
    title: 'Giá neo + giảm dần',
    body: 'Đăng cao hơn mục tiêu 1–1.5%, chỉnh theo phản hồi 48h đầu.',
  },
  {
    title: 'Minh bạch với khách',
    body: 'Show explanation + khoảng giá thị trường — tăng tỉ lệ chốt cọc.',
  },
]

const chatPrompts = [
  'Xe này ngập nước cấp độ ngập máy giảm giá khoảng bao nhiêu?',
  'Nên bán nhanh hay giữ giá với mức km hiện tại?',
  'So với tin Chợ Tốt gần đây, giá đang cao hay thấp?',
  'Checklist chuẩn bị xe trước khi chụp ảnh bán?',
]

export default function DashboardInsights() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-midnight_text">Tips & Chat AI</h2>
        <p className="text-sm text-slate-500 mt-1">
          Chat không giới hạn thời gian — mở widget sau mỗi lần định giá ở mục{' '}
          <Link href="/dashboard/valuation" className="text-primary font-semibold">
            Định giá xe
          </Link>
          .
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-midnight_text flex items-center gap-2">
            <Icon icon="tabler:bulb" className="text-amber-500 text-xl" />
            Tips định giá & bán xe
          </h3>
          <ul className="mt-4 space-y-4">
            {tips.map((t) => (
              <li key={t.title} className="border-l-4 border-primary/30 pl-4">
                <p className="font-semibold text-sm text-midnight_text">{t.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-6">
          <h3 className="font-bold text-midnight_text flex items-center gap-2">
            <Icon icon="tabler:message-chatbot" className="text-violet-600 text-xl" />
            Gợi ý câu hỏi cho Chat AI
          </h3>
          <ul className="mt-4 space-y-2">
            {chatPrompts.map((q) => (
              <li
                key={q}
                className="text-sm bg-white/80 rounded-xl px-4 py-3 text-slate-700 border border-white shadow-sm">
                “{q}”
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/valuation"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm">
            <Icon icon="tabler:arrow-right" />
            Đi tới định giá & chat
          </Link>
        </div>
      </div>
    </div>
  )
}
