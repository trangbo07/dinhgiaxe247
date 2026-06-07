"use client"
import { motion } from "framer-motion"
import Link from "next/link"

export default function FinalCTA() {
  return (
    <section className="relative w-full bg-gradient-to-b from-white to-slate-50 py-28 overflow-hidden text-center border-t border-slate-100">
      {/* Glow layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-4xl">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 border border-blue-200/50 px-4 py-1.5 rounded-full"
        >
          Khởi Đầu Hành Trình Mới
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-3xl md:text-5xl font-black text-slate-900 leading-tight"
        >
          Bắt Đầu Hành Trình Di Chuyển Thông Minh & Tiết Kiệm
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-500 text-sm md:text-base max-w-2xl mx-auto"
        >
          Đồng hành cùng ValuCar & AdoCar để kiểm thử giá trị tài sản thực tế và nhận đặc quyền chuyển dịch xanh sang phương tiện xe điện thế hệ mới ngay hôm nay.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/#valuation"
            className="rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 px-8 py-3.5 font-bold text-white shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
          >
            Định Giá Xe AI
          </Link>
          <Link
            href="#rent"
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-8 py-3.5 font-bold text-slate-800 backdrop-blur-sm transition-all hover:scale-105"
          >
            Thuê Xe Điện VinFast
          </Link>
          <Link
            href="#contact"
            className="rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/50 px-8 py-3.5 font-semibold text-slate-600 transition-all hover:scale-105"
          >
            Liên Hệ Tư Vấn
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
