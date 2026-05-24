import type { Metadata } from "next"
import Header from "../../components/Layout/Header"
import LandingFooter from "../../components/Adocar/LandingFooter"
import Hero from "../../components/Adocar/Hero"
import AboutAdo from "../../components/Adocar/AboutAdo"
import Partnership from "../../components/Adocar/Partnership"
import CompanyCard from "../../components/Adocar/CompanyCard"
import AdoGroup from "../../components/Adocar/AdoGroup"
import FinalCTA from "../../components/Adocar/FinalCTA"

export const metadata: Metadata = {
  title: "ValuCar × AdoCar | Hành Trình Tiết Kiệm",
  description:
    "Trang hợp tác ValuCar và AdoCar cho giải pháp định giá ô tô thông minh và thuê xe điện VinFast tại Việt Nam.",
  openGraph: {
    title: "ValuCar × AdoCar",
    description:
      "Đối tác đồng hành giữa nền tảng định giá ô tô ValuCar và dịch vụ thuê xe điện AdoCar.",
    images: ["/images/hero/banner4.png"],
  },
}

export default function AdocarPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />
      <Hero />
      <AboutAdo />
      <Partnership />
      <CompanyCard />
      <AdoGroup />
      <section id="valuation" className="container mx-auto px-6 py-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Khu vực định giá xe sẽ được kết nối biểu mẫu ValuCar ở bước tiếp theo.
        </div>
      </section>
      <section id="rent" className="container mx-auto px-6 py-6" />
      <FinalCTA />
      <LandingFooter />
    </main>
  )
}
