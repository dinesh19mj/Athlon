'use client';

import { useState, useRef } from 'react';
import { Users, Plus, Search, Filter, X, Camera, Phone, User } from 'lucide-react';
import Link from 'next/link';

export default function ClubMembersPage() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Arjun Patel', role: 'Captain', joined: 'Jan 2026', phone: '+91 98765 43210', photo: null as string | null },
    { id: 2, name: 'Neha Gupta', role: 'Member', joined: 'Feb 2026', phone: '+91 98765 43211', photo: null },
    { id: 3, name: 'Raj Kumar', role: 'Member', joined: 'Mar 2026', phone: '+91 98765 43212', photo: null },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', photo: null as string | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewMember(prev => ({ ...prev, photo: url }));
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    
    setMembers(prev => [{
      id: Date.now(),
      name: newMember.name,
      role: 'Member',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      phone: newMember.phone,
      photo: newMember.photo
    }, ...prev]);
    
    setNewMember({ name: '', phone: '', photo: null });
    setIsAdding(false);
  };

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex flex-col gap-4 shrink-0 relative z-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Members</h1>
            <p className="text-foreground/50 text-xs font-bold mt-1">Total: {members.length} Active Members</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 rounded-full bg-[#06B6D4] text-[#0A0F1A] shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-surface border border-foreground/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Search className="w-4 h-4 text-foreground/40" />
            <input type="text" placeholder="Search members..." className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-foreground/40" />
          </div>
          <button className="bg-surface border border-foreground/10 rounded-xl px-3 py-2.5 flex items-center justify-center">
            <Filter className="w-4 h-4 text-foreground/70" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar relative z-0">
        {members.map((member) => (
          <div key={member.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between group cursor-pointer hover:border-[#06B6D4]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center overflow-hidden shrink-0">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-[#06B6D4]" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-foreground text-sm leading-tight">{member.name}</h3>
                <span className="text-xs text-foreground/60 mt-0.5">{member.phone}</span>
                <p className="text-[9px] text-foreground/40 uppercase tracking-wider mt-1">Joined: {member.joined}</p>
              </div>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${
              member.role === 'Captain' ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20' :
              'bg-foreground/5 text-foreground/50 border border-foreground/10'
            }`}>
              {member.role}
            </span>
          </div>
        ))}
      </div>

      {/* Add Member Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface w-full h-[85%] rounded-t-[32px] border-t border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black uppercase tracking-tight">Add New Member</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              <form onSubmit={handleAddMember} className="space-y-6">
                
                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-foreground/5 border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#06B6D4]/50 hover:bg-[#06B6D4]/5 transition-colors overflow-hidden relative group"
                  >
                    {newMember.photo ? (
                      <>
                        <img src={newMember.photo} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-foreground/40 mb-1" />
                        <span className="text-[10px] font-bold text-foreground/40 uppercase">Add Photo</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input 
                        type="text" 
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="E.g. Arjun Patel"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input 
                        type="tel" 
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={!newMember.name || !newMember.phone}
                    className="w-full py-4 rounded-xl bg-[#06B6D4] text-[#0A0F1A] font-black tracking-wide shadow-[0_5px_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-[#0891b2] transition-colors"
                  >
                    ADD MEMBER
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
