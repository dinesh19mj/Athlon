'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, Package, AlertTriangle, CheckCircle2, History, MoreVertical, Archive } from 'lucide-react';

const MOCK_INVENTORY = [
  { id: 'inv1', name: 'Yonex Mavis 350 Shuttles', category: 'Consumables', quantity: 45, status: 'In Stock', lastRestocked: '2 Days Ago', image: '🏸' },
  { id: 'inv2', name: 'Training Bibs (Assorted)', category: 'Apparel', quantity: 12, status: 'Low Stock', lastRestocked: '1 Month Ago', image: '🎽' },
  { id: 'inv3', name: 'Agility Cones', category: 'Equipment', quantity: 40, status: 'In Stock', lastRestocked: '3 Months Ago', image: '🔺' },
  { id: 'inv4', name: 'Tennis Balls (Slazenger)', category: 'Consumables', quantity: 0, status: 'Out of Stock', lastRestocked: '2 Weeks Ago', image: '🎾' },
  { id: 'inv5', name: 'First Aid Kit (Standard)', category: 'Medical', quantity: 2, status: 'Low Stock', lastRestocked: '6 Months Ago', image: '⚕️' },
  { id: 'inv6', name: 'Football (Size 5)', category: 'Equipment', quantity: 8, status: 'In Stock', lastRestocked: '1 Week Ago', image: '⚽' },
];

export default function InventoryPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Items');

  if (!org) return null;

  const filteredItems = MOCK_INVENTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All Items' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalItems = MOCK_INVENTORY.length;
  const lowStock = MOCK_INVENTORY.filter(i => i.status === 'Low Stock').length;
  const outOfStock = MOCK_INVENTORY.filter(i => i.status === 'Out of Stock').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Club Inventory</h1>
          <p className="text-foreground/50 text-sm font-medium mt-1">
            Manage shared gear, consumables, and equipment for {org.name}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/20">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Compact Top Metrics Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex-1 bg-surface border border-foreground/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Total Categories</div>
            <div className="text-2xl font-black text-foreground">{totalItems}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
            <Package className="w-5 h-5 text-foreground/50" />
          </div>
        </div>
        
        <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-black text-yellow-600/70 uppercase tracking-widest mb-1">Low Stock Warning</div>
            <div className="text-2xl font-black text-yellow-600">{lowStock}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="flex-1 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-black text-red-600/70 uppercase tracking-widest mb-1">Out of Stock</div>
            <div className="text-2xl font-black text-red-600">{outOfStock}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Archive className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search inventory items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface/50 border border-foreground/10 rounded-full pl-12 pr-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-foreground/30 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
          {['All Items', 'In Stock', 'Low Stock', 'Out of Stock'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === filter 
                ? 'bg-foreground text-background shadow-md' 
                : 'bg-surface border border-foreground/10 text-foreground/70 hover:bg-foreground/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid (No Datatables) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col bg-surface/50 backdrop-blur-md border border-foreground/5 rounded-[24px] overflow-hidden hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300"
          >
            {/* Top Area: Image/Icon & Actions */}
            <div className="flex items-start justify-between p-5 pb-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center text-3xl shadow-inner border border-foreground/5">
                {item.image}
              </div>
              <button className="w-8 h-8 rounded-full hover:bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="inline-block px-2.5 py-1 rounded-md bg-foreground/5 text-foreground/60 text-[10px] font-black uppercase tracking-widest w-max mb-3">
                {item.category}
              </div>
              
              <h3 className="text-lg font-bold text-foreground leading-tight mb-4 group-hover:text-blue-500 transition-colors">
                {item.name}
              </h3>

              <div className="mt-auto space-y-4">
                {/* Stock Level Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground/60">Stock Level</span>
                    <span className="text-sm font-black text-foreground">{item.quantity} Units</span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'In Stock' ? 'bg-green-500' 
                        : item.status === 'Low Stock' ? 'bg-yellow-500' 
                        : 'bg-red-500'
                      }`}
                      style={{ width: `${item.status === 'Out of Stock' ? 100 : item.quantity > 30 ? 100 : (item.quantity / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'In Stock' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {item.status === 'Low Stock' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {item.status === 'Out of Stock' && <Archive className="w-4 h-4 text-red-500" />}
                    <span className={`text-xs font-bold ${
                      item.status === 'In Stock' ? 'text-green-600' : 
                      item.status === 'Low Stock' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-foreground/40 text-xs font-medium">
                    <History className="w-3.5 h-3.5" />
                    {item.lastRestocked}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-foreground/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
            <p className="text-foreground/50 font-medium text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
