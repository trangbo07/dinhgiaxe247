"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/Footer"
import WorldCupBanner from "@/components/WorldCupBanner"
import WorldCupDecorStrip from "@/components/WorldCupDecorStrip"
import { useTheme } from "@/app/Providers"

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { worldcupEnabled } = useTheme()
  const isAdocarRoute = pathname?.startsWith("/adocar")
  const isDashboard = pathname?.startsWith("/dashboard")
  const showBanner = !isAdocarRoute && worldcupEnabled
  const showHeader = !isAdocarRoute && !isDashboard
  const showFooter = !isAdocarRoute && !isDashboard

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("site-has-header", showHeader)
    return () => document.documentElement.classList.remove("site-has-header")
  }, [showHeader])

  return (
    <>
      {/* Banner + Navbar cố định sát đầu trang */}
      <div id="site-fixed-chrome" className="site-fixed-chrome">
        {showBanner && <WorldCupBanner />}
        {showHeader && <Header />}
      </div>

      {/* Đẩy nội dung xuống dưới chrome cố định */}
      <div className="site-top-spacer" aria-hidden />

      {children}

      {showFooter && worldcupEnabled && (
        <WorldCupDecorStrip variant="compact" />
      )}
      {showFooter && <Footer />}
    </>
  )
}
