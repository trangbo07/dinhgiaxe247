'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

type ChatRole = 'user' | 'assistant'
type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  createdAt: number
}

function formatVND(amount: number) {
  try {
    return amount.toLocaleString('vi-VN') + ' đ'
  } catch {
    return `${amount} đ`
  }
}

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

function computeBasePrice(price: number | null, priceLow: number | null, priceHigh: number | null) {
  if (price != null) return price
  if (priceLow != null && priceHigh != null) return Math.round((priceLow + priceHigh) / 2)
  return priceLow ?? priceHigh ?? null
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function ExpertChatWidget(props: {
  enabled: boolean
  price: number | null
  priceLow: number | null
  priceHigh: number | null
  vehicle?: {
    brand?: string
    model?: string
    year?: string | number
    color?: string
    mileage?: string | number
    version?: string
  }
}) {
  const { enabled, price, priceLow, priceHigh, vehicle } = props

  const basePrice = useMemo(() => computeBasePrice(price, priceLow, priceHigh), [price, priceLow, priceHigh])

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: id(),
      role: 'assistant',
      createdAt: Date.now(),
      text:
        'Xin chào! Mình là hỗ trợ chuyên sâu 24/7. Bạn cứ mô tả tình huống (ngập nước, va quệt, sơn lại...), mình sẽ ước tính ảnh hưởng lên giá sau khi định giá và gợi ý cách xử lý.',
    },
  ])

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [open, messages.length])

  const quickAsks = useMemo(
    () => [
      'Nếu bị ngập nước thì xe của tôi còn bao nhiều tiền?',
      'Bị va quệt nhẹ thì trừ khoảng bao nhiêu?',
      'Xe sơn lại 1-2 vị trí ảnh hưởng giá thế nào?',
      'Muốn bán nhanh thì nên chốt mức nào?',
    ],
    []
  )

  function pushAssistant(text: string) {
    setMessages((m) => [...m, { id: id(), role: 'assistant', createdAt: Date.now(), text }])
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: id(), role: 'user', createdAt: Date.now(), text }])
  }

  function replyFor(userText: string) {
    const t = normalize(userText)
    const bp = basePrice

    if (t.includes('ngập') || t.includes('lụt') || t.includes('nước')) {
      if (bp == null) {
        return 'Bạn hãy định giá xong trước (ra khoảng giá), rồi mình sẽ tính “giá còn lại sau ngập nước” theo mức khấu trừ tham khảo.'
      }
      const scenario = t.includes('ngập máy') || t.includes('vào máy') ? 'ngập máy' : t.includes('ngập sàn') ? 'ngập sàn' : 'ngập nước'
      const ratio = scenario === 'ngập máy' ? 0.5 : scenario === 'ngập sàn' ? 0.25 : 0.35
      const remain = clampNonNegative(Math.round(bp * (1 - ratio)))
      const reason =
        scenario === 'ngập máy'
          ? 'ngập máy (rủi ro đại tu + độ tin cậy về sau)'
          : scenario === 'ngập sàn'
            ? 'ngập sàn (dễ ảnh hưởng sàn, ghế, mùi ẩm)'
            : 'ngập nước (thường ảnh hưởng điện/giắc/ECU)'

      const low = priceLow ?? (bp - Math.max(15_000_000, Math.round(bp * 0.025)))
      const high = priceHigh ?? (bp + Math.max(15_000_000, Math.round(bp * 0.025)))
      const afterLow = clampNonNegative(Math.round(low * (1 - ratio)))
      const afterHigh = clampNonNegative(Math.round(high * (1 - ratio)))

      return [
        `Nếu xe bị **${reason}**, mình tạm khấu trừ khoảng **${Math.round(ratio * 100)}%** sau định giá (mức tham khảo).`,
        `- Giá tham chiếu hiện tại: khoảng **${formatVND(low)} – ${formatVND(high)}**`,
        `- Sau ngập nước: còn khoảng **${formatVND(afterLow)} – ${formatVND(afterHigh)}** (ước tính)`,
        '',
        'Để sát hơn, bạn cho mình biết: “ngập sàn / ngập nửa xe / ngập máy” và đã xử lý gì (thay dầu, vệ sinh giắc, thay ECU/IC…).',
      ].join('\n')
    }

    if (t.includes('va') || t.includes('quẹt') || t.includes('móp') || t.includes('tai nạn')) {
      if (bp == null) return 'Bạn định giá xong giúp mình trước nhé, để mình ước tính mức trừ theo % trên giá đã định.'
      const ratio = 0.07
      const remain = clampNonNegative(Math.round(bp * (1 - ratio)))
      return `Va quẹt nhẹ (1–2 vị trí) thường bị ép giá, mình tạm trừ khoảng **7%**. Giá còn lại ước tính khoảng **${formatVND(remain)}** (tính trên giá giữa).`
    }

    if (t.includes('sơn') || t.includes('dặm') || t.includes('đồng sơn')) {
      if (bp == null) return 'Bạn định giá xong giúp mình trước nhé, để mình tính mức ảnh hưởng.'
      const ratio = 0.05
      const remain = clampNonNegative(Math.round(bp * (1 - ratio)))
      return `Sơn lại 1–2 chi tiết thường bị người mua ép giá, mình tạm trừ khoảng **5%**. Giá còn lại ước tính khoảng **${formatVND(remain)}**.`
    }

    if (t.includes('bán nhanh') || t.includes('chốt') || t.includes('ra đi')) {
      if (bp == null) return 'Bạn định giá xong giúp mình trước nhé, để mình gợi ý mức chốt.'
      const fastSell = clampNonNegative(Math.round(bp * 0.97))
      const superFast = clampNonNegative(Math.round(bp * 0.95))
      return [
        'Gợi ý chốt giá (tham khảo):',
        `- Muốn bán nhanh (1–2 tuần): chốt khoảng **${formatVND(fastSell)}**`,
        `- Muốn bán rất nhanh (1–3 ngày): chốt khoảng **${formatVND(superFast)}**`,
      ].join('\n')
    }

    return 'Bạn mô tả rõ tình huống hơn một chút (ví dụ: ngập mức nào / có ảnh hưởng điện không / đã sửa chữa gì), mình sẽ trả về mức “giá còn lại” ước tính.'
  }

  async function onSend(textRaw?: string) {
    const text = (textRaw ?? draft).trim()
    if (!text || sending) return
    pushUser(text)
    setDraft('')
    setSending(true)

    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, text: m.text }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, basePrice, priceLow, priceHigh, vehicle }),
      })
      const data = await res.json()

      if (!res.ok || !data?.reply) {
        const fallback = replyFor(text)
        pushAssistant(fallback)
      } else {
        pushAssistant(data.reply)
      }
    } catch {
      const fallback = replyFor(text)
      pushAssistant(fallback)
    } finally {
      setSending(false)
    }
  }

  if (!enabled) return null

  return (
    <div className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[120]'>
      {!open ? (
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='group flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-3 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] transition'
          aria-label='Mở hỗ trợ chuyên sâu'
        >
          <span className='relative flex h-3 w-3'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
          </span>
          <Icon icon='tabler:messages' className='text-xl' />
          <span className='font-bold'>Hỗ trợ chuyên sâu 24/7</span>
        </button>
      ) : (
        <div className='fixed bottom-4 left-4 right-4 sm:static sm:bottom-auto sm:left-auto sm:right-auto'>
          <div className='w-full sm:w-[420px] h-[72vh] sm:h-[70vh] max-h-[640px] rounded-2xl bg-white border border-blue-100 shadow-2xl overflow-hidden flex flex-col'>
            <div className='px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-full bg-white/15 flex items-center justify-center'>
                  <Icon icon='tabler:headset' className='text-xl' />
                </div>
                <div className='leading-tight'>
                  <div className='font-extrabold'>Hỗ trợ chuyên sâu</div>
                  <div className='text-xs text-white/80 flex items-center gap-2'>
                    <span className='inline-flex items-center gap-1'>
                      <span className='inline-block w-2 h-2 rounded-full bg-emerald-400' />
                      Online 24/7
                    </span>
                  </div>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='w-9 h-9 rounded-full hover:bg-white/10 transition flex items-center justify-center'
                aria-label='Đóng chat'
              >
                <Icon icon='tabler:x' className='text-2xl' />
              </button>
            </div>

            <div className='px-4 py-3 bg-gray-50 border-b border-gray-100'>
              <div className='flex flex-wrap gap-2'>
                {quickAsks.map((q) => (
                  <button
                    key={q}
                    type='button'
                    onClick={() => onSend(q)}
                    className='text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition text-gray-700'
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className='flex-1 overflow-y-auto px-4 py-4 bg-white'>
              <div className='space-y-3'>
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={[
                        'max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]',
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-br-md shadow-sm'
                          : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md',
                      ].join(' ')}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='p-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50'>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onSend()
                }}
                className='flex items-center gap-2'
              >
                <div className='flex-1 relative group'>
                  <div className='absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300' />
                  <Icon icon='tabler:message-circle' className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder='Hỏi nhanh: "ngập nước thì còn bao nhiêu?"'
                    disabled={sending}
                    className='relative w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all font-medium bg-white'
                  />
                </div>
                <button
                  type='submit'
                  disabled={sending}
                  className='px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap'
                >
                  <Icon icon='tabler:send' className='text-lg' />
                  <span className='hidden sm:inline'>{sending ? 'Đang gửi...' : 'Gửi'}</span>
                </button>
              </form>

              <div className='mt-2 text-xs text-gray-500 font-medium'>
                {basePrice == null ? (
                  <span>Chưa có giá để tính theo tình huống.</span>
                ) : (
                  <span>
                    Giá tham chiếu: <b className='text-primary'>{formatVND(basePrice)}</b>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

