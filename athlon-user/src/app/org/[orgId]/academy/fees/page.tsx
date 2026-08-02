'use client';

import { CreditCard, DollarSign, TrendingUp, TrendingDown, Search, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function FeesPage() {
  const transactions = [
    { id: 1, name: 'Arjun Patel', type: 'Monthly Fee', amount: 3500, date: 'Today, 10:30 AM', status: 'Paid' },
    { id: 2, name: 'Neha Gupta', type: 'Registration', amount: 1500, date: 'Yesterday', status: 'Pending' },
    { id: 3, name: 'Karan Singh', type: 'Tournament Fee', amount: 500, date: '12 Jul 2026', status: 'Paid' },
  ];

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Fee Management</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Track revenue and pending dues</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col">
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Collected</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-black text-foreground">45k</span>
            </div>
            <span className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12%</span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Pending</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-black text-foreground">8.5k</span>
            </div>
            <span className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> 14 students</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
        <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 pl-1">Recent Transactions</h2>
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">{tx.name}</h3>
                <p className="text-[9px] text-foreground/50 uppercase tracking-wider">{tx.type} • {tx.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-black text-[#F97316]">₹{tx.amount}</span>
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                tx.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
