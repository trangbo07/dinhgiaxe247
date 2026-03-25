"use client";

import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

type WalletContextType = {
  balance: number;
  isPro: boolean;
  remainingFreeValuations: number;
  canUseValuation: () => boolean;
  syncFreeUsageForUser: (userKey?: string | null) => void;
  consumeValuationUse: (userKey?: string | null) => void;
  buyPro: (price: number) => boolean;
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
  const [balance, setBalance] = useState(1800000);
  const [isPro, setIsPro] = useState(false);
  const [remainingFreeValuations, setRemainingFreeValuations] = useState(0);
  const [activeUserKey, setActiveUserKey] = useState<string | null>(null);

  const maxFreePerMonth = 3;

  const syncFreeUsageForUser = (userKey?: string | null) => {
    const key = (userKey ?? '').trim();
    setActiveUserKey(key || null);

    if (!key) {
      setRemainingFreeValuations(0);
      return;
    }

    if (isPro) return;
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const usageStorageKey = `valucar_free_usage_v1_${key}`;
      const raw = localStorage.getItem(usageStorageKey);
      const parsed = raw ? JSON.parse(raw) as { month: string; used: number } : null;
      const usedBase = parsed && parsed.month === currentMonthKey ? Number(parsed.used) || 0 : 0;

      if (!parsed || parsed.month !== currentMonthKey) {
        localStorage.setItem(usageStorageKey, JSON.stringify({ month: currentMonthKey, used: 0 }));
        setRemainingFreeValuations(maxFreePerMonth);
        return;
      }

      const used = Math.max(0, Math.min(maxFreePerMonth, usedBase));
      setRemainingFreeValuations(maxFreePerMonth - used);
    } catch {
      setRemainingFreeValuations(maxFreePerMonth);
    }
  };

  useEffect(() => {
    // If user hasn't called sync yet, keep remaining = 0 until they login.
  }, []);

  const canUseValuation = () => {
    // Nếu chưa login (activeUserKey = null) => không cho dùng free.
    if (isPro) return true;
    if (!activeUserKey) return false;
    return remainingFreeValuations > 0;
  };

  const consumeValuationUse = (userKey?: string | null) => {
    if (isPro) return;
    const key = (userKey ?? activeUserKey ?? '').trim();
    if (!key) return;

    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const usageStorageKey = `valucar_free_usage_v1_${key}`;
      const raw = localStorage.getItem(usageStorageKey);
      const parsed = raw ? JSON.parse(raw) as { month: string; used: number } : null;
      const usedBase = parsed && parsed.month === currentMonthKey ? Number(parsed.used) || 0 : 0;

      const used = Math.max(0, Math.min(maxFreePerMonth, usedBase + 1));
      localStorage.setItem(usageStorageKey, JSON.stringify({ month: currentMonthKey, used }));
      setRemainingFreeValuations(maxFreePerMonth - used);
    } catch {
      setRemainingFreeValuations((prev) => Math.max(0, prev - 1));
    }
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
      <WalletContext.Provider
        value={{
          balance,
          isPro,
          remainingFreeValuations,
          canUseValuation,
          syncFreeUsageForUser,
          consumeValuationUse,
          buyPro,
          deductBalance,
        }}
      >
        {children}
      </WalletContext.Provider>
    </SessionProvider>
  );
}
