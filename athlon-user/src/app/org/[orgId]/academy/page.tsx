'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  CreditCard,
  CalendarCheck,
  TrendingUp,
  Package,
  Activity,
  ArrowRight,
  TrendingDown,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AcademyService, AcademyDashboardSummary } from '@/lib/api/academy';

const bgImages = [
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop',
];

export default function AcademyDashboardPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { userEmail } = useAuthStore();
  const displayName = userEmail ? userEmail.split('@')[0] : 'Admin';
  
  const [currentBg, setCurrentBg] = useState(0);
  const [dashboard, setDashboard] = useState<AcademyDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orgId) {
      setLoading(true);
      AcademyService.getDashboard(orgId)
        .then((data) => {
          setDashboard(data);
        })
        .catch((err) => {
          console.error('Error fetching academy dashboard:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orgId]);

  const quickActions = [
    { id: `/org/${orgId}/students`, label: 'Students', icon: Users },
    { id: `/org/${orgId}/batches`, label: 'Batches', icon: BookOpen },
    { id: `/org/${orgId}/finances`, label: 'Fees', icon: CreditCard },
    { id: `/org/${orgId}/attendance`, label: 'Attendance', icon: CalendarCheck },
    { id: `/org/${orgId}/inventory`, label: 'Inventory', icon: Package },
    { id: `/org/${orgId}/performance`, label: 'Progress', icon: TrendingUp },
    { id: `/org/${orgId}/coaches`, label: 'Coaches', icon: Activity },
    { id: `/org/${orgId}/centres`, label: 'Centres', icon: Building2 },
  ];

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

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none z-0" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 backdrop-blur-md mb-4 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Academy Management</span>
          </div>

          <h1 className="text-3xl font-extrabold mb-1 text-foreground tracking-tight flex items-center gap-2 relative z-10">
            Hi, <span className="capitalize">{displayName}</span> <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>
          <p className="text-foreground/80 text-sm font-medium mb-6 relative z-10">Here's your academy overview for today.</p>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 bg-black/40 border border-foreground/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg">
              <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1">Students</span>
              {loading ? (
                <div className="h-7 w-16 bg-foreground/20 rounded animate-pulse my-0.5" />
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-foreground">{dashboard?.activeStudents ?? 0}</span>
                  <span className="text-xs font-bold text-blue-400 mb-1 flex items-center">
                    {dashboard?.activeBatches ?? 0} Batches
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 bg-[#F97316]/10 border border-[#F97316]/30 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F97316]/10 pointer-events-none" />
              <span className="text-[10px] font-black text-[#F97316]/80 uppercase tracking-widest mb-1">Fees Collected</span>
              {loading ? (
                <div className="h-7 w-20 bg-[#F97316]/20 rounded animate-pulse my-0.5" />
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-[#F97316]">
                    ₹{Number(dashboard?.feesCollected ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-rose-400 mb-1 flex items-center">
                    ₹{Number(dashboard?.pendingFees ?? 0).toLocaleString('en-IN')} Due
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="p-6 overflow-hidden">
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">Academy Operations</h2>
          <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {quickActions.map((action) => (
              <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
                  <action.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
              </Link>
            ))}
          </section>
        </div>

        {/* RECENT ACTIVITY / SESSIONS */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4 pl-1 pr-2">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Active Coaching Sessions</h2>
            <Link href={`/org/${orgId}/batches`} className="text-[10px] font-bold text-primary hover:underline">
              View All &rarr;
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-surface/50 border border-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (dashboard?.upcomingBatches && dashboard.upcomingBatches.length > 0) ? (
            <div className="space-y-3">
              {dashboard.upcomingBatches.map((batch) => (
                <div key={batch.batchUuid} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{batch.batchName}</p>
                      <p className="text-[10px] text-foreground/50 truncate">
                        Coach: {batch.coachName || 'Unassigned'} • {batch.enrolledCount ?? 0}/{batch.maxCapacity ?? 0} Enrolled
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-primary shrink-0">
                    {batch.startTime?.substring(0, 5)} - {batch.endTime?.substring(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface/50 border border-foreground/5 rounded-2xl p-6 text-center space-y-1">
              <Calendar className="w-6 h-6 text-foreground/30 mx-auto" />
              <p className="text-xs font-medium text-foreground/60">No active batches scheduled today</p>
            </div>
          )}
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
