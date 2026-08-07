'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building, Trophy, Users, ShieldCheck, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function MyOrganizationsList() {
  const router = useRouter();
  const { organizations, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (!organizations || organizations.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">My Organizations</h2>
      <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
        {organizations.filter(org => org.id !== activeWorkspaceId).map((org) => {
          const isAssoc = org.type === 'ASSOCIATION';
          const isAcad = org.type === 'ACADEMY';
          const isClub = org.type === 'CLUB';

          return (
            <button
              key={org.id}
              onClick={() => {
                if (org.id) {
                  setActiveWorkspace(org.id);
                  router.push(`/org/${org.id}/dashboard`);
                }
              }}
              className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
            >
              <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface border border-foreground/5 flex flex-col items-center justify-center transition-all shadow-md hover:shadow-xl hover:border-foreground/20 cursor-pointer`}>
                {isAssoc && <Trophy className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />}
                {isAcad && <Building className="w-8 h-8 text-blue-500" strokeWidth={1.5} />}
                {isClub && <Users className="w-8 h-8 text-green-500" strokeWidth={1.5} />}
                {!isAssoc && !isAcad && !isClub && <ShieldCheck className="w-8 h-8 text-purple-500" strokeWidth={1.5} />}
              </div>
              <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">{org.name}</span>
            </button>
          )
        })}

        <button
          onClick={() => {
            router.push('/organizations/new');
          }}
          className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
        >
          <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface/50 border border-foreground/5 border-dashed flex flex-col items-center justify-center transition-all shadow-sm hover:shadow-md hover:border-foreground/20 cursor-pointer`}>
            <Plus className="w-8 h-8 text-foreground/40" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">Add New</span>
        </button>
      </section>
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
