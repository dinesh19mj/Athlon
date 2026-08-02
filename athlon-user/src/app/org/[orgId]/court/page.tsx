'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

const bgImages = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611252758110-6c9f2868853b?q=80&w=800&auto=format&fit=crop',
];

const quickActions = [
  { id: '/court/bookings', label: 'Bookings', icon: Calendar, color: 'text-blue-400' },
  { id: '/court/finances', label: 'Finances', icon: DollarSign, color: 'text-emerald-400' },
  { id: '/court/inventory', label: 'Inventory', icon: Package, color: 'text-pink-400' },
];

export default function CourtDashboardPage() {
  const { userEmail } = useAuthStore();
  const displayName = userEmail ? userEmail.split('@')[0] : 'Court Admin';
  
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      
      {/* Main Scrollable Area */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar">
        
        {/* HERO SECTION */}
        <div className="px-6 pt-8 pb-6 border-b border-foreground/10 relative overflow-hidden">
          
          {/* Background Image Carousel (Hero Only) */}
          <div className="absolute inset-0 z-0">
            {bgImages.map((src, index) => (
              <div
                key={src}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: currentBg === index ? 1 : 0,
                  backgroundImage: `url(${src})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1A] via-[#0A0F1A]/60 to-transparent" />
              </div>
            ))}
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAB308]/10 rounded-full blur-[100px] pointer-events-none z-0" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 backdrop-blur-md mb-4 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Court Facility Management</span>
          </div>

          <h1 className="text-3xl font-extrabold mb-1 text-foreground tracking-tight flex items-center gap-2 relative z-10">
            Hi, <span className="capitalize">{displayName}</span> <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>
          <p className="text-foreground/80 text-sm font-medium mb-6 relative z-10 flex items-center gap-1"><MapPin className="w-4 h-4 text-[#EAB308]" /> Grand Slam Arena</p>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 bg-black/40 border border-foreground/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg">
              <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1">Occupancy</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-foreground">4/6</span>
                <span className="text-xs font-bold text-green-500 mb-1 flex items-center">Courts Active</span>
              </div>
            </div>
            <div className="flex-1 bg-[#EAB308]/10 border border-[#EAB308]/30 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[#EAB308]/10 pointer-events-none" />
              <span className="text-[10px] font-black text-[#EAB308]/80 uppercase tracking-widest mb-1">Today's Revenue</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-[#EAB308]">₹8.4k</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="p-6 overflow-hidden">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">Court Operations</h2>
          <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {quickActions.map((action) => (
              <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
                  <action.icon className={`w-6 h-6 ${action.color.replace('text-', '') === action.color ? action.color.replace('bg-', 'text-') : action.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
              </Link>
            ))}
          </section>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4 pl-1 pr-2">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Live Activity feed</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 1, text: 'Court 2 booked for 1 hour', time: '10 mins ago', color: 'bg-blue-500' },
              { id: 2, text: 'Racket rental payment received', time: '1 hour ago', color: 'bg-[#EAB308]' },
              { id: 3, text: 'Batch session completed on Court 4', time: '2 hours ago', color: 'bg-green-500' },
            ].map((activity) => (
              <div key={activity.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0`} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{activity.text}</p>
                </div>
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
        .animate-wave {
          animation: wave 2.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
