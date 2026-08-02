'use client';

import { Package, Plus, AlertCircle } from 'lucide-react';

export default function CourtInventoryPage() {
  const items = [
    { id: 1, name: 'Yonex Mavis 350', type: 'Pro Shop (Sale)', stock: 8, unit: 'Tubes', status: 'healthy' },
    { id: 2, name: 'Non-Marking Shoes', type: 'Rentals', stock: 12, unit: 'Pairs', status: 'healthy' },
    { id: 3, name: 'Towel Grips', type: 'Pro Shop (Sale)', stock: 3, unit: 'Pieces', status: 'critical' },
  ];

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Inventory</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Manage pro-shop & rentals</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#EAB308] text-[#0A0F1A] shadow-[0_4px_20px_rgba(234,179,8,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                item.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                'bg-green-500/10 border-green-500/30'
              }`}>
                <Package className={`w-4 h-4 ${
                  item.status === 'critical' ? 'text-red-500' : 'text-green-500'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  {item.name}
                  {item.status === 'critical' && <AlertCircle className="w-3 h-3 text-red-500" />}
                </h3>
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider">{item.type}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xl font-black ${
                item.status === 'critical' ? 'text-red-500' : 'text-foreground'
              }`}>
                {item.stock}
              </span>
              <span className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
