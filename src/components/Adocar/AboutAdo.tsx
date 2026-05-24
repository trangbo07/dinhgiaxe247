"use client"
import Image from "next/image"
import { motion } from "framer-motion"

export default function AboutAdo() {
  const features = [
    {
      title: "Tiết Kiệm Tối Đa",
      desc: "Không tốn chi phí xăng dầu đắt đỏ, hỗ trợ miễn phí sạc điện tại hệ thống trạm sạc phủ rộng toàn quốc."
    },
    {
      title: "Vận Hành Hiện Đại",
      desc: "Trải nghiệm lái êm ái, mượt mà không tiếng ồn. Xe trang bị các tính năng an toàn, hỗ trợ lái ADAS thông minh."
    },
    {
      title: "Dịch Vụ Linh Hoạt",
      desc: "Giao xe tận nơi theo yêu cầu. Thủ tục đăng ký nhanh gọn trong 15 phút, bảo hiểm và bảo dưỡng trọn gói 24/7."
    }
  ]

  return (
    <section id="about" className="relative w-full bg-white py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with decoration */}
          <div className="lg:col-span-6 order-2 lg:order-1 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 aspect-[4/3] max-w-[540px] mx-auto group"
            >
              <Image 
                src="/images/hero/banner3.png" 
                alt="VinFast Electric Vehicle Fleet" 
                fill 
                sizes="(max-w-720px) 100vw, 540px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Float badge overlay on image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 right-6 lg:right-12 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3"
            >
              <div className="h-10 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 shadow-sm">
                <Image
                  src="/images/logo/logo_Valucar.png"
                  alt="ValuCar Badge"
                  width={50}
                  height={15}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Đối tác di chuyển</div>
                <div className="text-xs font-bold text-slate-800">Xe Điện VinFast</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Title and Features */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/80 px-4 py-1.5 rounded-full"
            >
              Giải Pháp Di Chuyển Xanh
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight"
            >
              Hành Trình Tiết Kiệm – Trải Nghiệm Trọn Vẹn Cùng AdoCar
            </motion.h2>

            <motion.p 
              className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Không bận tâm xăng tăng giá hay chi phí bảo dưỡng phức tạp, dàn xe điện cao cấp của chúng tôi mang lại cho bạn một phương thức di chuyển thông minh hơn, êm ái hơn và tiết kiệm vượt bậc.
            </motion.p>

            {/* Feature Cards List */}
            <div className="mt-8 space-y-4">
              {features.map((feat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
                >
                  <div className="flex-shrink-0 h-10 w-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 shadow-sm">
                    <Image
                      src="/images/logo/logo_Valucar.png"
                      alt="ValuCar Icon"
                      width={48}
                      height={15}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{feat.title}</h4>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <a 
                href="#rent" 
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 font-bold px-6 py-3.5 shadow-lg transition-all duration-200"
              >
                Đặt Xe Nhận Ưu Đãi Ngay
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

