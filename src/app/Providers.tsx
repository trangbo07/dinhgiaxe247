"use client";

import { SessionProvider } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

type WalletContextType = {
  balance: number;
  isPro: boolean;
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
  const [balance, setBalance] = useState(1200000);
  const [isPro, setIsPro] = useState(false);

  const buyPro = (price: number) => {
    if (balance >= price) {
      setBalance(balance - price);
      setIsPro(true);
      toast.success(`Đã mua thành công! Đã trừ ${price.toLocaleString('vi-VN')}đ`);
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
      <WalletContext.Provider value={{ balance, isPro, buyPro, deductBalance }}>
        {children}
      </WalletContext.Provider>
    </SessionProvider>
  );
}
