'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Wallet, TrendingUp, MoreVertical, FileText, CheckCircle2, Clock, X } from 'lucide-react';

const MOCK_TRANSACTIONS_ACADEMY = [
  { id: '1', date: 'Aug 12, 2026', description: 'Monthly Coaching Fee', name: 'Aarav Patel', amount: 5000, type: 'Income', status: 'Completed', method: 'UPI' },
  { id: '2', date: 'Aug 11, 2026', description: 'Equipment Purchase (Shuttles)', name: 'Yonex Sports Ltd', amount: 12500, type: 'Expense', status: 'Completed', method: 'Bank Transfer' },
  { id: '3', date: 'Aug 10, 2026', description: 'Monthly Coaching Fee', name: 'Riya Sharma', amount: 6500, type: 'Income', status: 'Pending', method: 'Cash' },
  { id: '4', date: 'Aug 09, 2026', description: 'Tournament Entry Fee', name: 'Kabir Singh', amount: 1500, type: 'Income', status: 'Completed', method: 'Card' },
  { id: '5', date: 'Aug 05, 2026', description: 'Court Maintenance', name: 'Elite Services', amount: 8000, type: 'Expense', status: 'Completed', method: 'Bank Transfer' },
];

const MOCK_TRANSACTIONS_CLUB = [
  { id: 'c1', date: 'Aug 12, 2026', description: 'Monthly Court Fee', name: 'Alex Johnson', amount: 2000, type: 'Income', status: 'Completed', method: 'UPI' },
  { id: 'c2', date: 'Aug 12, 2026', description: 'Monthly Shuttle Fee', name: 'Alex Johnson', amount: 500, type: 'Income', status: 'Pending', method: 'Cash' },
  { id: 'c3', date: 'Aug 10, 2026', description: 'Court Booking Charge', name: 'City Sports Arena', amount: 15000, type: 'Expense', status: 'Completed', method: 'Bank Transfer' },
  { id: 'c4', date: 'Aug 09, 2026', description: 'Monthly Court Fee', name: 'Sarah Williams', amount: 2000, type: 'Income', status: 'Completed', method: 'UPI' },
  { id: 'c5', date: 'Aug 08, 2026', description: 'Shuttle Restock (Other Expenses)', name: 'Yonex Pro Shop', amount: 8500, type: 'Expense', status: 'Completed', method: 'Card' },
];

export default function FinancesPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [member, setMember] = useState('Alex Johnson');
  const [feeMonth, setFeeMonth] = useState('August 2026');
  const [expenseDesc, setExpenseDesc] = useState('Court Rent Paid');
  const [amount, setAmount] = useState('');

  const membersList = ['Alex Johnson', 'Sarah Williams', 'Raj Kumar', 'Vikram Singh'];
  const months = ['June 2026', 'July 2026', 'August 2026', 'September 2026'];
  const expenseCategories = ['Court Rent Paid', 'Shuttle Expenses', 'Tournament Fee', 'Other Maintenance'];

  if (!org) return null;

  const isClub = org.type === 'CLUB';
  const transactionsData = isClub ? MOCK_TRANSACTIONS_CLUB : MOCK_TRANSACTIONS_ACADEMY;

  const filteredTransactions = transactionsData.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    // Normally we would push to backend
    setIsAdding(false);
    setAmount('');
  };

  const handleOpenAdd = (type: 'Income' | 'Expense') => {
    setTxType(type);
    setIsAdding(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Financial Overview</h1>
          <p className="text-foreground/50 font-medium mt-1">
            {isClub ? `Manage member court fees, shuttle fees, and other expenses for ${org.name}.` : `Manage revenue, expenses, and fee collection for ${org.name}.`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isClub && (
            <>
              <button 
                onClick={() => handleOpenAdd('Income')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors"
              >
                <DollarSign className="w-4 h-4" /> Collect Member Fees
              </button>
            </>
          )}
          {!isClub && (
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          )}
          <button 
            onClick={() => handleOpenAdd('Expense')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/20"
          >
            <Plus className="w-4 h-4" /> {isClub ? 'Add Expense' : 'Record Transaction'}
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-foreground/5 p-5 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest">Total Income</div>
            <div className="p-2 bg-green-500/10 text-green-500 rounded-xl"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-foreground">₹1,42,500</div>
          <div className="text-xs font-medium text-green-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12% from last month
          </div>
        </div>

        <div className="bg-surface border border-foreground/5 p-5 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest">Total Expenses</div>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl"><Wallet className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-foreground">₹32,400</div>
          <div className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +4% from last month
          </div>
        </div>

        <div className="bg-surface border border-foreground/5 p-5 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="text-foreground/50 text-xs font-bold uppercase tracking-widest">Pending Dues</div>
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-foreground">₹18,500</div>
          <div className="text-xs font-medium text-foreground/50 mt-2">Across 8 members</div>
        </div>

        <div className="bg-gradient-to-br from-foreground to-foreground/80 p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] text-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="text-background/70 text-xs font-bold uppercase tracking-widest">Net Profit</div>
            <div className="p-2 bg-background/20 text-background rounded-xl"><CreditCard className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black relative z-10">₹1,10,100</div>
          <div className="text-xs font-bold text-background/70 mt-2 flex items-center gap-1 relative z-10">
            <ArrowUpRight className="w-3 h-3" /> Healthy Margin
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface/50 backdrop-blur-sm border border-foreground/5 rounded-[24px] p-3 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-grow w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search transactions by name or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-full pl-12 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-background border border-foreground/10 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <select className="flex-1 sm:flex-none appearance-none bg-background border border-foreground/10 rounded-full px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-foreground/30 cursor-pointer">
            <option>August 2026</option>
            <option>July 2026</option>
            <option>June 2026</option>
          </select>
        </div>
      </div>

      {/* Transaction List (Card Based) */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="group bg-surface/50 backdrop-blur-sm border border-foreground/5 p-4 md:p-5 rounded-[24px] hover:border-foreground/10 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Icon & Details */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                transaction.type === 'Income' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
              }`}>
                {transaction.type === 'Income' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold text-foreground mb-1 group-hover:text-blue-500 transition-colors">{transaction.description}</div>
                <div className="text-xs font-medium text-foreground/50 flex items-center gap-2">
                  <span>{transaction.name}</span>
                  <span className="w-1 h-1 rounded-full bg-foreground/20" />
                  <span>{transaction.date}</span>
                </div>
              </div>
            </div>

            {/* Right: Amount, Status, Actions */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 sm:gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-foreground/5">
              
              {/* Payment Method Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-foreground/5 text-xs font-bold text-foreground/60">
                <CreditCard className="w-3.5 h-3.5" /> {transaction.method}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                {transaction.status === 'Completed' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className={`text-xl font-black w-32 text-right ${transaction.type === 'Income' ? 'text-green-600' : 'text-foreground'}`}>
                {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl bg-background border border-foreground/5 hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors" title="Download Receipt">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-colors" title="More Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center border border-dashed border-foreground/10 rounded-[24px]">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No transactions found</h3>
            <p className="text-foreground/50 font-medium text-sm">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal Overlay (Ported from Old Club Login) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-3xl border border-foreground/10 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Add Transaction</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Type Switcher */}
              <div className="flex bg-foreground/5 rounded-xl p-1 mb-6">
                <button 
                  onClick={() => setTxType('Income')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    txType === 'Income' ? 'bg-background shadow-sm text-green-600' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Fee Collection (Income)
                </button>
                <button 
                  onClick={() => setTxType('Expense')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    txType === 'Expense' ? 'bg-background shadow-sm text-red-600' : 'text-foreground/50 hover:text-foreground'
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
                      <select 
                        value={member}
                        onChange={(e) => setMember(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                      >
                        {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Fee Month</label>
                      <select 
                        value={feeMonth}
                        onChange={(e) => setFeeMonth(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                      >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Expense Category</label>
                    <select 
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                    >
                      {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 pl-9 pr-4 text-sm text-foreground font-bold focus:outline-none focus:border-foreground/30 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={!amount}
                    className="w-full py-3.5 rounded-xl bg-foreground text-background font-black tracking-wide disabled:opacity-50 hover:bg-foreground/90 transition-colors uppercase text-sm"
                  >
                    Save Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}