"use client";

import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useState, useLayoutEffect, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import WorldCupBootLoader from "@/components/WorldCupBootLoader";
import {
  type AccountType,
  getPlanLimits,
} from "@/lib/plan-limits";

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

type WalletContextType = {
  balance: number;
  isPro: boolean;
  isUltra: boolean;
  ultraUntil: number | null;
  accountType: AccountType | null;
  planName: string;
  maxValuationsPerMonth: number;
  remainingFreeValuations: number;
  maxChatPerValuation: number;
  canUseValuation: () => boolean;
  syncFreeUsageForUser: (userKey?: string | null, accountType?: AccountType | null) => void;
  consumeValuationUse: (userKey?: string | null) => void;
  buyPro: (price: number) => boolean;
  activateUltraTrial: () => void;
  deductBalance: (amount: number) => boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

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

  // ── Wallet ─────────────────────────────────────────────────────────────────
  const [balance, setBalance] = useState(1800000);
  const [isPro, setIsPro] = useState(false);
  const [isUltra, setIsUltra] = useState(false);
  const [ultraUntil, setUltraUntil] = useState<number | null>(null);
  const [remainingFreeValuations, setRemainingFreeValuations] = useState(0);
  const [activeUserKey, setActiveUserKey] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const planLimits = useMemo(
    () => getPlanLimits({ accountType, isPro, isUltra }),
    [accountType, isPro, isUltra]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem('valucar_ultra_trial_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as { until: number };
        if (parsed.until > Date.now()) {
          setIsUltra(true);
          setUltraUntil(parsed.until);
        } else {
          localStorage.removeItem('valucar_ultra_trial_v1');
        }
      }
    } catch {}

    // Dọn legacy gói Cá nhân Pro (đã gộp thành 1 gói)
    try {
      localStorage.removeItem('valucar_personal_pro_v1');
    } catch {}
  }, []);

  const syncFreeUsageForUser = (userKey?: string | null, nextAccountType?: AccountType | null) => {
    const key = (userKey ?? '').trim();
    setActiveUserKey(key || null);

    if (nextAccountType === 'personal' || nextAccountType === 'business') {
      setAccountType(nextAccountType);
    }

    if (!key) {
      setRemainingFreeValuations(0);
      return;
    }

    const limits = getPlanLimits({
      accountType: nextAccountType ?? accountType,
      isPro,
      isUltra,
    });

    if (limits.unlimited) return;

    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const maxForUser = limits.maxValuationsPerMonth;
      const usageStorageKey = `valucar_free_usage_v1_${key}`;
      const raw = localStorage.getItem(usageStorageKey);
      const parsed = raw ? JSON.parse(raw) as { month: string; used: number } : null;
      const usedBase = parsed && parsed.month === currentMonthKey ? Number(parsed.used) || 0 : 0;

      if (!parsed || parsed.month !== currentMonthKey) {
        localStorage.setItem(usageStorageKey, JSON.stringify({ month: currentMonthKey, used: 0 }));
        setRemainingFreeValuations(maxForUser);
        return;
      }

      const used = Math.max(0, Math.min(maxForUser, usedBase));
      setRemainingFreeValuations(maxForUser - used);
    } catch {
      setRemainingFreeValuations(limits.maxValuationsPerMonth);
    }
  };

  useEffect(() => {
    if (activeUserKey) {
      syncFreeUsageForUser(activeUserKey, accountType);
    }
  }, [isPro, isUltra, accountType, activeUserKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const canUseValuation = () => {
    if (isPro || isUltra) return true;
    if (!activeUserKey) return false;
    return remainingFreeValuations > 0;
  };

  const consumeValuationUse = (userKey?: string | null) => {
    if (isPro || isUltra) return;
    const key = (userKey ?? activeUserKey ?? '').trim();
    if (!key) return;

    const limits = getPlanLimits({ accountType, isPro, isUltra });
    if (limits.unlimited) return;

    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const maxForUser = limits.maxValuationsPerMonth;
      const usageStorageKey = `valucar_free_usage_v1_${key}`;
      const raw = localStorage.getItem(usageStorageKey);
      const parsed = raw ? JSON.parse(raw) as { month: string; used: number } : null;
      const usedBase = parsed && parsed.month === currentMonthKey ? Number(parsed.used) || 0 : 0;

      const used = Math.max(0, Math.min(maxForUser, usedBase + 1));
      localStorage.setItem(usageStorageKey, JSON.stringify({ month: currentMonthKey, used }));
      setRemainingFreeValuations(maxForUser - used);
    } catch {
      setRemainingFreeValuations((prev) => Math.max(0, prev - 1));
    }
  };

  const activateUltraTrial = () => {
    const until = Date.now() + 30 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem('valucar_ultra_trial_v1', JSON.stringify({ until }));
    } catch {}
    setIsUltra(true);
    setUltraUntil(until);
    toast.success('Đã kích hoạt Ultra 1 tháng miễn phí! Tận hưởng đầy đủ tính năng.');
  };

  const buyPro = (price: number) => {
    if (balance >= price) {
      setBalance(balance - price);
      setIsPro(true);
      toast.success(`Đã kích hoạt gói Doanh nghiệp! Đã trừ ${price.toLocaleString('vi-VN')}đ`);
      return true;
    } else {
      toast.error(`Không đủ số dư! Cần ${price.toLocaleString('vi-VN')}đ, còn ${balance.toLocaleString('vi-VN')}đ`);
      return false;
    }
  };

  const deductBalance = (amount: number) => {
    if (balance >= amount) {
      setBalance(b => b - amount);
      return true;
    }
    return false;
  };

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ worldcupEnabled, themeReady, toggleWorldcup }}>
        <WalletContext.Provider
          value={{
            balance,
            isPro,
            isUltra,
            ultraUntil,
            accountType,
            planName: planLimits.planName,
            maxValuationsPerMonth: planLimits.maxValuationsPerMonth,
            remainingFreeValuations,
            maxChatPerValuation: planLimits.maxChatPerValuation,
            canUseValuation,
            syncFreeUsageForUser,
            consumeValuationUse,
            buyPro,
            activateUltraTrial,
            deductBalance,
          }}
        >
          {!themeReady ? (
            <WorldCupBootLoader />
          ) : (
            <div className="theme-content-enter">{children}</div>
          )}
        </WalletContext.Provider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
