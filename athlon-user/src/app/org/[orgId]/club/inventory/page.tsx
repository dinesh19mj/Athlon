'use client';

import { useState } from 'react';
import { Package, Plus, X, ArrowDownToLine, ArrowUpFromLine, Calendar, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
  const [inventoryLog, setInventoryLog] = useState([
    { id: 1, type: 'IN', qty: 10, date: '18 Jul 2026', desc: 'New stock arrived' },
    { id: 2, type: 'OUT', qty: 2, date: '18 Jul 2026', desc: 'Daily practice' },
    { id: 3, type: 'OUT', qty: 3, date: '17 Jul 2026', desc: 'Tournament matches' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
  const [qty, setQty] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format for input
  const [desc, setDesc] = useState('');

  const currentStock = inventoryLog.reduce((total, log) => {
    return log.type === 'IN' ? total + log.qty : total - log.qty;
  }, 0);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || !logDate) return;

    // Convert date string to readable format
    const dateObj = new Date(logDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    const newLog = {
      id: Date.now(),
      type: actionType,
      qty: Number(qty),
      date: formattedDate,
      desc: desc || (actionType === 'IN' ? 'Stock Added' : 'Daily Usage')
    };

    setInventoryLog(prev => [newLog, ...prev]);
    setIsAdding(false);
    setQty('');
    setDesc('');
    setLogDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-6 shrink-0 relative z-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Inventory</h1>
            <p className="text-foreground/50 text-xs font-bold mt-1">Shuttle Stock Tracking</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 rounded-full bg-[#06B6D4] text-[#0A0F1A] shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-2xl p-5 flex flex-col shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#06B6D4]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black text-[#06B6D4] uppercase tracking-widest">Available Shuttles</span>
            {currentStock <= 5 && (
               <span className="bg-red-500/20 text-red-500 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase">
                 <AlertCircle className="w-3 h-3" /> Low Stock
               </span>
            )}
          </div>
          <div className="flex items-end gap-2 mt-2 relative z-10">
            <span className={`text-4xl font-black ${currentStock <= 5 ? 'text-red-500' : 'text-foreground'}`}>
              {currentStock}
            </span>
            <span className="text-sm font-bold text-foreground/50 mb-1">Tubes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar relative z-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-1">Activity Log</h2>
        </div>

        {inventoryLog.map((log) => (
          <div key={log.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between group cursor-pointer hover:border-[#06B6D4]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                log.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
              }`}>
                {log.type === 'IN' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-foreground text-sm leading-tight">{log.desc}</h3>
                <p className="text-[9px] text-foreground/50 uppercase tracking-wider mt-1">{log.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`font-black tracking-tight ${log.type === 'IN' ? 'text-green-500' : 'text-orange-500'}`}>
                {log.type === 'IN' ? '+' : '-'}{log.qty}
              </span>
              <span className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Tubes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Stock Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface w-full h-[85%] rounded-t-[32px] border-t border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black uppercase tracking-tight">Log Shuttles</h2>
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
                  onClick={() => setActionType('IN')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                    actionType === 'IN' ? 'bg-background shadow-md text-green-500' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  <ArrowDownToLine className="w-4 h-4" /> Add Stock
                </button>
                <button 
                  onClick={() => setActionType('OUT')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                    actionType === 'OUT' ? 'bg-background shadow-md text-orange-500' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  <ArrowUpFromLine className="w-4 h-4" /> Take Daily
                </button>
              </div>

              <form onSubmit={handleAddLog} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Quantity</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      <input 
                        type="number" 
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="e.g. 2"
                        min="1"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground font-bold focus:outline-none focus:border-[#06B6D4] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 px-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Description (Optional)</label>
                  <input 
                    type="text" 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={actionType === 'IN' ? 'e.g. Purchased from store' : 'e.g. Daily practice matches'}
                    className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 px-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={!qty || !logDate || (actionType === 'OUT' && Number(qty) > currentStock)}
                    className="w-full py-4 rounded-xl bg-[#06B6D4] text-[#0A0F1A] font-black tracking-wide shadow-[0_5px_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-[#0891b2] transition-colors uppercase"
                  >
                    Save {actionType === 'IN' ? 'Stock Entry' : 'Usage Entry'}
                  </button>
                  {actionType === 'OUT' && Number(qty) > currentStock && (
                    <p className="text-red-500 text-xs text-center mt-2 font-bold">Cannot take more than available stock!</p>
                  )}
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
