"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext, useState, useLayoutEffect, useEffect, useCallback } from "react";
import WorldCupBootLoader from "@/components/WorldCupBootLoader";
import { FREE_VALUATIONS_PER_MONTH, getPlanLimits } from "@/lib/plan-limits";

// ─── Theme Context ────────────────────────────────────────────────────────────

type ThemeContextType = {
  worldcupEnabled: boolean
  themeReady: boolean
  toggleWorldcup: (enabled: boolean) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within Providers')
  return ctx
}

// ─── Wallet Context ───────────────────────────────────────────────────────────
// Nguồn sự thật cho gói/quota nằm ở server (bảng subscriptions/valuation_usage,
// xem src/lib/plan-quota.ts). Context này chỉ là cache phía client, hydrate từ
// GET /api/plans/me, dùng cho UI hiển thị tức thời — API vẫn tự kiểm tra lại.

type WalletContextType = {
  isPro: boolean;
  /** true khi đã có kết quả (thật hoặc rỗng) từ GET /api/plans/me — tránh nhấp nháy UI trước khi biết isPro. */
  planStateLoaded: boolean;
  planCode: 'monthly' | 'quarterly' | 'yearly' | null;
  planExpiresAt: string | null;
  planName: string;
  maxValuationsPerMonth: number;
  remainingFreeValuations: number;
  maxChatPerValuation: number;
  canUseValuation: () => boolean;
  refreshPlanState: () => Promise<void>;
  /** Trừ lạc quan 1 lượt ngay sau khi gọi API định giá thành công, tránh phải refetch. */
  consumeLocalValuation: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

function WalletProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [planStateLoaded, setPlanStateLoaded] = useState(false);
  const [planCode, setPlanCode] = useState<'monthly' | 'quarterly' | 'yearly' | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [remainingFreeValuations, setRemainingFreeValuations] = useState(FREE_VALUATIONS_PER_MONTH);

  const planLimits = getPlanLimits({ isPro });

  const refreshPlanState = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/plans/me');
      if (!res.ok) return;
      const data = await res.json();
      setIsPro(Boolean(data.hasActivePlan));
      setPlanCode(data.planCode ?? null);
      setPlanExpiresAt(data.expiresAt ?? null);
      if (Number.isFinite(data.monthlyRemaining)) {
        setRemainingFreeValuations(data.monthlyRemaining);
      } else {
        setRemainingFreeValuations(FREE_VALUATIONS_PER_MONTH);
      }
    } catch {
    } finally {
      setPlanStateLoaded(true);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshPlanState();
    } else if (status === 'unauthenticated') {
      setIsPro(false);
      setPlanCode(null);
      setPlanExpiresAt(null);
      setRemainingFreeValuations(FREE_VALUATIONS_PER_MONTH);
      setPlanStateLoaded(true);
    }
  }, [status, refreshPlanState]);

  const canUseValuation = () => {
    if (isPro) return true;
    return remainingFreeValuations > 0;
  };

  const consumeLocalValuation = () => {
    if (isPro) return;
    setRemainingFreeValuations((prev) => Math.max(0, prev - 1));
  };

  return (
    <WalletContext.Provider
      value={{
        isPro,
        planStateLoaded,
        planCode,
        planExpiresAt,
        planName: planLimits.planName,
        maxValuationsPerMonth: planLimits.maxValuationsPerMonth,
        remainingFreeValuations,
        maxChatPerValuation: planLimits.maxChatPerValuation,
        canUseValuation,
        refreshPlanState,
        consumeLocalValuation,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // ── World Cup Theme ────────────────────────────────────────────────────────
  const [worldcupEnabled, setWorldcupEnabled] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  const applyWorldcupClass = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('worldcup-theme')
    } else {
      document.documentElement.classList.remove('worldcup-theme')
    }
  }

  useLayoutEffect(() => {
    const startedAt = Date.now()
    const MIN_LOADER_MS = 550

    const finishBoot = (nextEnabled?: boolean) => {
      if (typeof nextEnabled === 'boolean') {
        setWorldcupEnabled(nextEnabled)
        applyWorldcupClass(nextEnabled)
        try {
          localStorage.setItem('valucar_wc_theme', nextEnabled ? '1' : '0')
        } catch {}
      }
      const wait = Math.max(0, MIN_LOADER_MS - (Date.now() - startedAt))
      window.setTimeout(() => {
        setThemeReady(true)
        document.documentElement.classList.add('theme-ready')
      }, wait)
    }

    let localEnabled = false
    try {
      const cached = localStorage.getItem('valucar_wc_theme')
      if (cached !== null) {
        localEnabled = cached === '1'
        setWorldcupEnabled(localEnabled)
        applyWorldcupClass(localEnabled)
      }
    } catch {}

    fetch('/api/admin/site-settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.worldcup_theme === 'boolean') {
          finishBoot(data.worldcup_theme)
        } else {
          finishBoot()
        }
      })
      .catch(() => finishBoot())
  }, [])

  const toggleWorldcup = async (enabled: boolean) => {
    setWorldcupEnabled(enabled)
    applyWorldcupClass(enabled)
    try { localStorage.setItem('valucar_wc_theme', enabled ? '1' : '0') } catch {}
    await fetch('/api/admin/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'worldcup_theme', value: enabled ? 'true' : 'false' }),
    }).catch(() => {})
  }

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ worldcupEnabled, themeReady, toggleWorldcup }}>
        <WalletProvider>
          {!themeReady ? (
            <WorldCupBootLoader />
          ) : (
            <div className="theme-content-enter">{children}</div>
          )}
        </WalletProvider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
