'use client';

import { useState } from 'react';
import { TrendingDown, Receipt, Plus, X, Users, Calendar, ArrowRightLeft } from 'lucide-react';

export default function FinancesPage() {
  const [transactions, setTransactions] = useState([
    { id: 1, desc: 'Court Rent Paid', type: 'Expense', amount: 8000, date: '18 Jul 2026', month: 'Jul 2026' },
    { id: 2, desc: 'Member Fee - Arjun (Jul)', type: 'Income', amount: 2500, date: '17 Jul 2026', month: 'Jul 2026' },
    { id: 3, desc: 'Shuttle Expenses', type: 'Expense', amount: 3000, date: '12 Jul 2026', month: 'Jul 2026' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  
  // Income form state
  const [member, setMember] = useState('Arjun Patel');
  const [feeMonth, setFeeMonth] = useState('Jul 2026');
  
  // Expense form state
  const [expenseDesc, setExpenseDesc] = useState('Court Rent Paid');
  
  // Shared state
  const [amount, setAmount] = useState('');

  const membersList = ['Arjun Patel', 'Neha Gupta', 'Raj Kumar', 'Vikram Singh'];
  const months = ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
  const expenseCategories = ['Court Rent Paid', 'Shuttle Expenses', 'Tournament Fee', 'Other Maintenance'];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    let desc = '';
    let targetMonth = '';

    if (txType === 'Income') {
      desc = `Member Fee - ${member} (${feeMonth.split(' ')[0]})`;
      targetMonth = feeMonth;
    } else {
      desc = expenseDesc;
      targetMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    const newTx = {
      id: Date.now(),
      desc,
      type: txType,
      amount: Number(amount),
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      month: targetMonth
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsAdding(false);
    setAmount('');
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-6 shrink-0 relative z-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Finances</h1>
            <p className="text-foreground/50 text-xs font-bold mt-1">Court & Shuttle Tracking</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 rounded-full bg-[#06B6D4] text-[#0A0F1A] shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col shadow-lg">
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Income (Fees)</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">₹{totalIncome.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-green-500 font-bold mt-2 truncate">Monthly Collection</span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col shadow-lg">
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Expenses</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">₹{totalExpense.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1 truncate"><TrendingDown className="w-3 h-3" /> Rent & Shuttles</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar relative z-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-1">Recent Ledger</h2>
        </div>

        {transactions.map((tx) => (
          <div key={tx.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between group cursor-pointer hover:border-[#06B6D4]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                tx.type === 'Income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-foreground text-sm leading-tight">{tx.desc}</h3>
                <p className="text-[9px] text-foreground/50 uppercase tracking-wider mt-1">{tx.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`font-black tracking-tight ${tx.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
              </span>
              {tx.type === 'Income' && (
                <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/40 border border-foreground/10 px-1.5 py-0.5 rounded-full">
                  {tx.month}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface w-full h-[85%] rounded-t-[32px] border-t border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black uppercase tracking-tight">Add Transaction</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              
              {/* Type Switcher */}
              <div className="flex bg-foreground/5 rounded-xl p-1 mb-6">
                <button 
                  onClick={() => setTxType('Income')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    txType === 'Income' ? 'bg-background shadow-md text-green-500' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Member Fee (Income)
                </button>
                <button 
                  onClick={() => setTxType('Expense')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    txType === 'Expense' ? 'bg-background shadow-md text-red-500' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Expense
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-5">
                
                {txType === 'Income' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Select Member</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <select 
                          value={member}
                          onChange={(e) => setMember(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-10 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                        >
                          {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/40">
                          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Fee Month</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <select 
                          value={feeMonth}
                          onChange={(e) => setFeeMonth(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-10 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                        >
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/40">
                          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Expense Category</label>
                    <div className="relative">
                      <ArrowRightLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      <select 
                        value={expenseDesc}
                        onChange={(e) => setExpenseDesc(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-10 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                      >
                        {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/40">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 2500"
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-foreground font-bold focus:outline-none focus:border-[#06B6D4] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={!amount}
                    className="w-full py-4 rounded-xl bg-[#06B6D4] text-[#0A0F1A] font-black tracking-wide shadow-[0_5px_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-[#0891b2] transition-colors uppercase"
                  >
                    Save Transaction
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
