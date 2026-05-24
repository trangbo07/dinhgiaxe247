"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

function Counter({ to }: { to: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const dur = 1500
    let raf: number

    const step = (ts: number) => {
      const elapsed = ts - start
      const progress = Math.min(1, elapsed / dur)
      // Ease out quad formula
      const easeProgress = progress * (2 - progress)
      setValue(Math.round(easeProgress * to))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to])

  return <span>{value.toLocaleString()}</span>
}

export default function CompanyCard() {
  return (
    <section id="contact" className="relative w-full bg-white py-24 overflow-hidden border-t border-slate-100">
      {/* Background blobs for light mode depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 border border-cyan-200/50 px-4 py-1.5 rounded-full backdrop-blur-md">
            Đồng Hành Cùng Bạn
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Kết Nối Trực Tiếp Với Chúng Tôi
          </h2>
          <p className="mt-4 text-slate-500 text-sm md:text-base">
            Đội ngũ tư vấn viên của ValuCar và AdoCar luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: ValuCar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.02)] flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:bg-white transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-900">ValuCar</h4>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">Định giá ô tô thông minh</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 text-xs font-bold">
                  AI Technology
                </div>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Nền tảng kiểm định và định giá xe ô tô tự động bằng trí tuệ nhân tạo, cung cấp báo cáo chi tiết giá trị thực tế của xe theo biến động thị trường.
              </p>

              <div className="space-y-3.5 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-blue-500">☎</span>
                  <span><strong>Hotline:</strong> 085 996 8686</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500">⚡</span>
                  <span><strong>Dịch vụ:</strong> Định giá AI - Chatbot tư vấn - Phân tích dữ liệu</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500">🌐</span>
                  <span><strong>Website:</strong> <a href="/" className="text-blue-600 hover:underline font-medium">dinhgiaxe247.vn</a></span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="text-blue-600 font-bold text-sm"><Counter to={15840} />+</span> người dùng tin cậy
              </div>
              <div className="flex gap-2">
                <a 
                  href="tel:0859968686" 
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center transition-all duration-200"
                >
                  Gọi Hotline
                </a>
                <a 
                  href="/#valuation" 
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all duration-200"
                >
                  Thử Định Giá
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 2: AdoCar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.02)] flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:bg-white transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-900">AdoCar</h4>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">Dịch vụ thuê xe điện VinFast</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 text-xs font-bold">
                  Green Mobility
                </div>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Đơn vị tiên phong cung cấp giải pháp cho thuê xe điện VinFast thông minh tự lái hoặc kèm tài xế, tối ưu hóa chi phí vận hành cho cả cá nhân & doanh nghiệp.
              </p>

              <div className="space-y-3.5 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">☎</span>
                  <span><strong>Hotline:</strong> 078.78.66.999</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">⚡</span>
                  <span><strong>Dịch vụ:</strong> Giao nhận xe tận nhà - Hỗ trợ cứu hộ sạc pin 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">f</span>
                  <span><strong>Facebook:</strong> <a className="text-emerald-600 hover:underline font-medium" target="_blank" rel="noreferrer" href="https://www.facebook.com/profile.php?id=100064330291919">Fanpage AdoCar</a></span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="text-emerald-600 font-bold text-sm"><Counter to={1280} />+</span> khách hàng đồng hành
              </div>
              <div className="flex gap-2">
                <a 
                  href="tel:0787866999" 
                  className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center transition-all duration-200"
                >
                  Gọi Hotline
                </a>
                <a 
                  target="_blank" 
                  rel="noreferrer" 
                  href="https://m.me/100064330291919"
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center transition-all duration-200"
                >
                  Chat Messenger
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

