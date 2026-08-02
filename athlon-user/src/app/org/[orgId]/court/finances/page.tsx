'use client';

import { DollarSign, TrendingDown, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function CourtFinancesPage() {
  const transactions = [
    { id: 1, desc: 'Hourly Rental - Court 2', type: 'Income', amount: 600, date: 'Today, 19:00' },
    { id: 2, desc: 'Grip Tape Sale (x2)', type: 'Income', amount: 300, date: 'Today, 18:45' },
    { id: 3, name: 'Electricity Bill', type: 'Expense', amount: 14500, date: 'Yesterday' },
  ];

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Finances</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Revenue and expense ledger</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col">
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Income</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">₹8.4k</span>
            </div>
            <span className="text-[10px] text-green-500 font-bold mt-2">Today's Revenue</span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Expenses</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">₹1.2k</span>
            </div>
            <span className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Maintenance</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
        <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 pl-1">Recent Ledger</h2>
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#EAB308]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">{tx.desc || tx.name}</h3>
                <p className="text-[9px] text-foreground/50 uppercase tracking-wider">{tx.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`font-black ${tx.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'Income' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
