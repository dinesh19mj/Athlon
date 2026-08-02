'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { MapPin, Plus, Filter, Search, CheckCircle2, AlertCircle, Clock, Users, Building, Wrench, MoreVertical } from 'lucide-react';

const MOCK_FACILITIES = [
  { id: '1', name: 'Main Indoor Arena', type: 'Badminton Courts', count: 6, status: 'Available', utilization: 85, location: 'Building A, Ground Floor' },
  { id: '2', name: 'Outdoor Turf', type: 'Football Turf', count: 1, status: 'In Use', utilization: 100, location: 'East Wing Outdoors' },
  { id: '3', name: 'Practice Nets', type: 'Cricket Nets', count: 3, status: 'Available', utilization: 40, location: 'West Wing' },
  { id: '4', name: 'Swimming Pool', type: 'Aquatics', count: 1, status: 'Maintenance', utilization: 0, location: 'Building B' },
];

export default function FacilitiesPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  if (!org) return null;

  const filteredFacilities = MOCK_FACILITIES.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Facilities Management</h1>
          <p className="text-foreground/50 font-medium mt-1">Manage physical spaces, courts, and infrastructure for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B9C56] text-black text-sm font-black tracking-wide hover:bg-[#158045] transition-colors shadow-lg shadow-[#1B9C56]/20">
            <Plus className="w-4 h-4" /> Add Facility
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-foreground/5 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1B9C56]/10 text-[#1B9C56] flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">11</div>
            <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Total Units</div>
          </div>
        </div>
        
        <div className="bg-surface border border-foreground/5 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">78%</div>
            <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Avg Daily Utilization</div>
          </div>
        </div>

        <div className="bg-surface border border-foreground/5 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">1</div>
            <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">In Maintenance</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input 
          type="text" 
          placeholder="Search facilities..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-foreground/5 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all shadow-sm"
        />
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            
            <div className="p-5 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">{facility.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/50 uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5" /> {facility.location}
                </div>
              </div>
              <button className="text-foreground/40 hover:text-foreground transition-colors p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-background border border-foreground/5 rounded-xl">
                <div>
                  <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-0.5">Facility Type</div>
                  <div className="text-sm font-bold text-foreground">{facility.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-0.5">Units</div>
                  <div className="text-sm font-bold text-foreground">{facility.count}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Current Status</span>
                  {facility.status === 'Available' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#1B9C56]"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>
                  ) : facility.status === 'In Use' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-500"><Clock className="w-3.5 h-3.5" /> In Use</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500"><AlertCircle className="w-3.5 h-3.5" /> Maintenance</span>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground/70">Daily Utilization</span>
                    <span className="text-foreground">{facility.utilization}%</span>
                  </div>
                  <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        facility.utilization > 80 ? 'bg-blue-500' : facility.utilization > 40 ? 'bg-[#1B9C56]' : 'bg-foreground/20'
                      }`}
                      style={{ width: `${facility.utilization}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background border-t border-foreground/5">
              <button className="w-full py-2 rounded-xl bg-surface border border-foreground/10 text-xs font-black uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-colors">
                Manage Bookings
              </button>
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
}
