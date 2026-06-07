"use client"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Partnership() {
  const steps = [
    {
      step: "01",
      title: "Định Giá AI Thông Minh",
      brand: "ValuCar",
      color: "from-primary to-blue-500",
      description: "Nhận kết quả thẩm định giá trị xe cũ nhanh chóng bằng công nghệ AI tiên tiến của ValuCar để tối ưu tài sản ban đầu."
    },
    {
      step: "02",
      title: "Giải Pháp Hợp Tác Xanh",
      brand: "ValuCar × AdoCar",
      color: "from-blue-400 to-blue-600",
      description: "Nhận các chính sách ưu đãi trợ giá đặc biệt dành riêng cho khách hàng chuyển đổi từ xe xăng truyền thống sang xe điện."
    },
    {
      step: "03",
      title: "Trải Nghiệm Xe Điện EV",
      brand: "AdoCar",
      color: "from-blue-600 to-blue-800",
      description: "Nâng tầm trải nghiệm di chuyển với dàn xe điện VinFast đời mới từ AdoCar: không tiếng ồn, không khí thải, tiết kiệm tối đa."
    }
  ]

  return (
    <section id="partnership" className="relative w-full bg-slate-50 py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-blue-200/20 via-blue-100/30 to-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100/80 px-4 py-1.5 rounded-full"
          >
            Hợp Tác Toàn Diện
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight"
          >
            Chiến Lược Công Nghệ & Di Chuyển Xanh
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed"
          >
            Hai thương hiệu kết nối nền tảng định giá ô tô thông minh cùng chuỗi cung ứng dịch vụ thuê xe điện VinFast, kiến tạo hệ sinh thái di chuyển xanh bền vững và tối ưu chi phí tối đa cho khách hàng Việt Nam.
          </motion.p>
        </div>

        {/* Visual Brand Connecting Flow Diagram */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">

            {/* ValuCar Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-md border border-slate-100 w-44"
            >
              <div className="h-16 w-24 bg-white flex items-center justify-center p-2 rounded-xl border border-slate-100 shadow-sm">
                <Image
                  src="/images/logo/logo_Valucar.png"
                  alt="ValuCar Logo"
                  width={80}
                  height={25}
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-bold text-slate-800">ValuCar AI</div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Định giá xe</div>
            </motion.div>

            {/* Connection 1 */}
            <div className="hidden md:block w-16 border-t-2 border-dashed border-slate-300" />

            {/* Collaboration Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl w-48 text-slate-800 relative border border-slate-100"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-full text-[9px] font-bold text-white uppercase tracking-widest">
                Liên Kết
              </div>
              <div className="h-16 w-24 bg-slate-50 flex items-center justify-center p-2 rounded-xl border border-slate-200">
                <Image
                  src="/images/logo/logo_Valucar.png"
                  alt="Partnership Logo"
                  width={80}
                  height={25}
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-bold">Hành Trình Xanh</div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Giải pháp tối ưu</div>
            </motion.div>

            {/* Connection 2 */}
            <div className="hidden md:block w-16 border-t-2 border-dashed border-slate-300" />

            {/* AdoCar Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-md border border-slate-100 w-44"
            >
              <div className="h-16 w-24 bg-white flex items-center justify-center p-2 rounded-xl border border-slate-100 shadow-sm">
                <Image
                  src="/images/logo/logo_Valucar.png"
                  alt="AdoCar Logo"
                  width={80}
                  height={25}
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-bold text-slate-800">AdoCar EV</div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Thuê xe điện</div>
            </motion.div>

          </div>
        </div>

        {/* 3 Step Description Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${item.color} opacity-[0.03] group-hover:opacity-[0.06] rounded-bl-full transition-opacity`} />

              <div className="flex justify-between items-center mb-6">
                <span className={`text-4xl font-black bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                  {item.step}
                </span>
                <span className="text-[11px] font-bold text-slate-400 border border-slate-200 rounded-lg px-2.5 py-0.5">
                  {item.brand}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
