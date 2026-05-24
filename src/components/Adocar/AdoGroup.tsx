"use client"
import { motion } from "framer-motion"

export default function AdoGroup() {
  const metrics = [
    {
      value: "2016",
      label: "Năm Thành Lập",
      desc: "Hơn 10 năm xây dựng và phát triển vững mạnh."
    },
    {
      value: "6,000 m²",
      label: "Diện Tích Nhà Máy",
      desc: "Hệ thống nhà xưởng sản xuất hiện đại và quy mô."
    },
    {
      value: "Hà Nội & Hòa Lạc",
      label: "Khu Vực Hoạt Động",
      desc: "Trọng điểm phát triển công nghệ cao tại thủ đô."
    }
  ]

  return (
    <section id="adogroup" className="relative w-full bg-slate-50 py-24 overflow-hidden">
      {/* Subtle Grid backdrop */}
      <div className="absolute inset-0 opacity-5 pointer-events-none [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="container relative mx-auto px-4 z-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-100 p-8 md:p-12 shadow-[0_20px_50px_rgba(2,6,23,0.06)]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-100 pb-10">
            <div className="lg:col-span-7">
              <motion.span 
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full"
              >
                Hệ Sinh Thái Doanh Nghiệp
              </motion.span>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-2xl md:text-3xl font-extrabold text-slate-900"
              >
                Trực Thuộc Tập Đoàn ADO Group
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-slate-500 text-sm md:text-base leading-relaxed"
              >
                Tập đoàn ADO Group (Công ty Cổ phần Tập đoàn ADO Việt Nam) là tổ chức kinh tế đa ngành hoạt động nổi bật trong các lĩnh vực dịch vụ di chuyển, sản xuất cơ khí chính xác và công nghệ cao, đóng góp tích cực cho sự phát triển của thủ đô.
              </motion.p>
            </div>
            
            <div className="lg:col-span-5 text-left lg:text-right text-xs md:text-sm text-slate-500 space-y-3 lg:border-l lg:border-slate-100 lg:pl-10">
              <div>
                <strong className="text-slate-800">Trụ sở chính:</strong>
                <p className="mt-1 text-slate-500">Tầng 1, LK03-02 KĐT mới An Hưng, La Khê, Hà Đông, Hà Nội</p>
              </div>
              <div>
                <strong className="text-slate-800">Tổ hợp nhà máy:</strong>
                <p className="mt-1 text-slate-500">Thôn 5, Phú Cát, Quốc Oai, Hà Nội</p>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl bg-slate-50 hover:bg-slate-900 p-6 border border-slate-100 hover:border-slate-900 transition-all duration-300 group"
              >
                <div className="text-3xl font-extrabold text-slate-900 group-hover:text-emerald-400 transition-colors">
                  {item.value}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-700 group-hover:text-white transition-colors">
                  {item.label}
                </div>
                <div className="mt-1 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

