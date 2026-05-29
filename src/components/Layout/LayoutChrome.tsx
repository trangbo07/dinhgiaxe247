"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/Layout/Header"
import Footer from "@/components/Layout/Footer"

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdocarRoute = pathname?.startsWith("/adocar")
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <>
      {!isAdocarRoute && !isDashboard && <Header />}
      {children}
      {!isAdocarRoute && !isDashboard && <Footer />}
    </>
  )
}
