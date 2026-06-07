"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 pt-28 pb-16 flex items-center">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none [background-image:radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,0,0,0.1),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.1)_1px,transparent_1.5px)] [background-size:24px_24px]" />

      <div className="container relative mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text & Content */}
          <div className="lg:col-span-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-4 py-1.5 text-xs sm:text-sm text-blue-700 font-semibold backdrop-blur-md mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Hợp Tác Chiến Lược Đột Phá 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
            >
              Hành Trình Xanh <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-clip-text text-transparent">
                Định Giá Thông Minh
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              Sự kết hợp hoàn hảo giữa <strong className="text-slate-900 font-bold">ValuCar</strong> - nền tảng định giá ô tô AI hàng đầu và <strong className="text-slate-900 font-bold">AdoCar</strong> - hệ thống thuê xe điện VinFast thông minh. Mang lại giải pháp di chuyển kinh tế, hiện đại và thân thiện với môi trường.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/#valuation"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-blue-500 px-6 py-3.5 font-bold text-white shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 duration-200"
              >
                Định Giá Xe Của Bạn
              </Link>

              <Link
                href="#rent"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3.5 font-bold text-slate-800 backdrop-blur-sm transition-all hover:scale-105 duration-200"
              >
                Thuê Xe Điện VinFast
              </Link>
            </motion.div>

            {/* Micro details / Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-10 pt-8 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-600">✓</span> Giao xe tận nơi toàn quốc
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-600">✓</span> Hỗ trợ cứu hộ 24/7
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-600">✓</span> Thủ tục nhanh 15 phút
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Image Centerpiece */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.25 }}
              className="relative w-full max-w-[540px] aspect-[4/3] rounded-3xl overflow-hidden p-2 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-primary/15 border border-slate-200/80 shadow-[0_30px_60px_rgba(15,23,42,0.08)] group"
            >
              {/* Inner light reflex reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-10" />

              {/* Actual Banner Image */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-50">
                <Image
                  src="/images/adocarXvalucar/Adocar_Valucar.png"
                  alt="ValuCar x AdoCar Strategic Partnership"
                  fill
                  sizes="(max-w-720px) 100vw, 540px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />
              </div>

              {/* Glowing label overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 border border-slate-200/60 backdrop-blur-md z-20 flex justify-between items-center shadow-md">
                <div>
                  <div className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">Special Edition</div>
                  <div className="text-sm font-bold text-slate-800">ValuCar × AdoCar</div>
                </div>
                <div className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                  Cooperation
                </div>
              </div>
            </motion.div>

            {/* Decorative background glow behind the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[80px] -z-10 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  )
}
