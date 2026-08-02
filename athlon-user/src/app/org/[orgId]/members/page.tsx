'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Search, Plus, Filter, MoreVertical, Mail, Shield, User } from 'lucide-react';

const MOCK_MEMBERS = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Student', status: 'Active', joinDate: '12 Aug 2025' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', role: 'Coach', status: 'Active', joinDate: '05 Jan 2025' },
  { id: '3', name: 'Amit Kumar', email: 'amit@example.com', role: 'Student', status: 'Inactive', joinDate: '22 Mar 2025' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'Admin', status: 'Active', joinDate: '10 Nov 2024' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'Student', status: 'Pending', joinDate: '01 Aug 2026' },
];

export default function MembersPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');

  if (!org) return null;

  const filteredMembers = MOCK_MEMBERS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Member Directory</h1>
          <p className="text-foreground/50 font-medium mt-1">Manage athletes, coaches, and staff for {org.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B9C56] text-black text-sm font-black tracking-wide hover:bg-[#158045] transition-colors shadow-lg shadow-[#1B9C56]/20">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search members by name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-foreground/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-bold shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{member.name}</div>
                        <div className="text-xs text-foreground/50">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'Admin' ? <Shield className="w-3.5 h-3.5 text-purple-500" /> : <User className="w-3.5 h-3.5 text-foreground/40" />}
                      <span className="text-sm font-semibold text-foreground/70">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      member.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                      member.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground/60">
                    {member.joinDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="Message">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors" title="Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-foreground/40 font-medium">No members found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}