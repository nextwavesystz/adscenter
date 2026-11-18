import { useCallback, useEffect, useState } from 'react';

export interface WithdrawRecord {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved';
}

interface WalletState {
  profit: number;
  balance: number;
  watchedIds: number[];
  withdrawHistory: WithdrawRecord[];
}

const STORAGE_KEY = 'adscenter_wallet_v1';
const SEEDED_KEY = 'adscenter_wallet_seeded_v1';

const INITIAL_SEEDED_STATE: WalletState = {
  profit: 192000,
  balance: 52000,
  watchedIds: [],
  withdrawHistory: [],
};

function loadWallet(): WalletState {
  if (typeof window === 'undefined') return INITIAL_SEEDED_STATE;
  try {
    const alreadySeeded = window.localStorage.getItem(SEEDED_KEY) === '1';
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!alreadySeeded || !raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_STATE));
      window.localStorage.setItem(SEEDED_KEY, '1');
      return INITIAL_SEEDED_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return {
      profit: typeof parsed.profit === 'number' ? parsed.profit : INITIAL_SEEDED_STATE.profit,
      balance: typeof parsed.balance === 'number' ? parsed.balance : INITIAL_SEEDED_STATE.balance,
      watchedIds: Array.isArray(parsed.watchedIds) ? parsed.watchedIds : [],
      withdrawHistory: Array.isArray(parsed.withdrawHistory) ? parsed.withdrawHistory : [],
    };
  } catch {
    return INITIAL_SEEDED_STATE;
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(loadWallet);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    } catch {
      // Ignore storage quota errors
    }
  }, [wallet]);

  const creditReward = useCallback((videoId: number, amount: number) => {
    setWallet((prev) => ({
      ...prev,
      profit: prev.profit + amount,
      balance: prev.balance + amount,
      watchedIds: prev.watchedIds.includes(videoId)
        ? prev.watchedIds
        : [...prev.watchedIds, videoId],
    }));
  }, []);

  const recordWithdrawAttempt = useCallback((amount: number) => {
    if (!amount || amount <= 0) return;
    const txId = `AC${Date.now().toString().slice(-8)}`;
    const record: WithdrawRecord = {
      id: txId,
      amount,
      date: new Date().toISOString(),
      status: 'pending',
    };
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
      withdrawHistory: [record, ...prev.withdrawHistory],
    }));
  }, []);

  return {
    profit: wallet.profit,
    balance: wallet.balance,
    watchedIds: wallet.watchedIds,
    withdrawHistory: wallet.withdrawHistory,
    creditReward,
    recordWithdrawAttempt,
  };
}
