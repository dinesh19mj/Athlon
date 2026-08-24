'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useRouter, usePathname } from 'next/navigation';
import { Building, Home, Users, ChevronDown, Check, Plus, Trophy } from 'lucide-react';

export default function ContextSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeWorkspaceId, personalProfile, organizations, setActiveWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-10 w-full animate-pulse bg-white/5 rounded-lg" />;

  const activeOrg = organizations.find((o) => o.id === activeWorkspaceId);
  const isPersonal = activeWorkspaceId === 'PERSONAL';

  const handleSelect = (id: string | 'PERSONAL') => {
    setActiveWorkspace(id);
    setIsOpen(false);
    
    // Don't redirect if we're on a shared page like profile
    if (pathname === '/profile') {
      return;
    }

    if (id === 'PERSONAL') {
      router.push('/profile');
    } else {
      router.push(`/org/${id}/dashboard`);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'ACADEMY') return <Building className="w-4 h-4 text-blue-400" />;
    if (type === 'ASSOCIATION') return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (type === 'CLUB') return <Users className="w-4 h-4 text-green-400" />;
    return <Building className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors border border-border bg-surface"
      >
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black/40 flex items-center justify-center border border-white/5 shrink-0">
          {isPersonal ? (
            <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             getIcon(activeOrg?.type || '')
          )}
        </div>
        
        <div className="flex-1 text-left truncate">
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest leading-none mb-1">
            {isPersonal ? 'Personal Space' : activeOrg?.type}
          </div>
          <div className="text-sm font-medium text-white leading-none truncate">
            {isPersonal ? personalProfile?.name : activeOrg?.name}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          
          {!isPersonal && (
            <>
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Personal</div>
                <button
                  onClick={() => handleSelect('PERSONAL')}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors text-white hover:bg-white/5"
                >
                  <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-5 h-5 rounded-full" />
                  <span className="flex-1 text-left">{personalProfile?.name}</span>
                </button>
              </div>
              <div className="h-px bg-white/5 my-1 mx-3" />
            </>
          )}

          {organizations.filter(org => org.id !== activeWorkspaceId).length > 0 && (
            <>
              <div className="px-3 py-1.5">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Organizations</div>
                <div className="space-y-1">
                  {organizations
                    .filter((org) => org.id !== activeWorkspaceId)
                    .map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelect(org.id)}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors text-white hover:bg-white/5"
                    >
                      {getIcon(org.type)}
                      <span className="flex-1 text-left truncate">{org.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-white/5 my-1 mx-3" />
            </>
          )}
          
          <div className="px-3 py-1.5">
            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <Plus className="w-4 h-4" />
              Create Organization
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
