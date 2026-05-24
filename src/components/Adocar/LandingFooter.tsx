"use client"
import Link from "next/link"

export default function LandingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-12 text-slate-500">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand indicators */}
        <div className="flex items-center gap-3">
          <div className="text-slate-800 font-extrabold text-base tracking-tight">ValuCar</div>
          <div className="text-slate-300">|</div>
          <div className="text-emerald-600 font-bold text-base tracking-tight">AdoCar</div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-400 order-3 md:order-2">
          © {new Date().getFullYear()} AdoCar × ValuCar. Hợp tác phát triển di chuyển xanh tại Việt Nam.
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm font-semibold order-2 md:order-3">
          <a 
            target="_blank" 
            rel="noreferrer" 
            href="https://www.facebook.com/profile.php?id=100064330291919"
            className="text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Facebook
          </a>
          <a 
            href="tel:0787866999"
            className="text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Hotline
          </a>
          <a 
            target="_blank" 
            rel="noreferrer" 
            href="https://m.me/100064330291919"
            className="text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Messenger
          </a>
        </div>

      </div>
    </footer>
  )
}
