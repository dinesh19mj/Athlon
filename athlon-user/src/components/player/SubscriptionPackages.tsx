'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore, WorkspaceType, Organization } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { Trophy, Users, Building, Check, MapPin, Video, X, CreditCard, Box, Info } from 'lucide-react';

type BillingCycle = 'tournament' | 'monthly' | 'yearly';

interface WorkspaceModule {
  id: string;
  type: WorkspaceType;
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  pricingOptions: {
    label: string;
    value: BillingCycle;
    price: string;
    description: string;
  }[];
}

export function SubscriptionPackages() {
  const { isAuthenticated } = useAuthStore();
  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  
  // Creation Flow State
  const [selectedModule, setSelectedModule] = useState<WorkspaceModule | null>(null);
  const [orgName, setOrgName] = useState('');
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>('monthly');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectModule = (mod: WorkspaceModule) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedModule(mod);
    setOrgName('');
    setSelectedBilling(mod.pricingOptions[0].value);
  };

  const handleCreateWorkspace = async () => {
    if (!selectedModule || !orgName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const orgRes = await OrganizationService.create({
        name: orgName.trim(),
        type: selectedModule.type,
        isActive: 1
      });
      
      const newOrgIdStr = orgRes.orgId ? orgRes.orgId.toString() : `org_${Date.now()}`;
      
      if (orgRes.orgId) {
        await OrganizationService.updateSubscription(
          orgRes.orgId, 
          'ACTIVE', 
          `mock_pay_${Date.now()}`
        ).catch(err => console.error('Failed to update subscription status', err));
      }
      
      const newOrg: Organization = {
        id: newOrgIdStr,
        name: orgRes.name || orgName.trim(),
        type: (orgRes.type as WorkspaceType) || selectedModule.type,
      };
      
      addOrganization(newOrg);
      setActiveWorkspace(newOrgIdStr);
      
      setIsCreating(false);
      setSelectedModule(null);
      
      // Navigate to the new workspace dashboard
      router.push(`/org/${newOrgIdStr}/dashboard`);
    } catch (err) {
      console.error('Failed to create workspace', err);
      setIsCreating(false);
    }
  };

  const modules: WorkspaceModule[] = [
    {
      id: 'mod_organizer',
      type: 'ORGANIZER',
      title: 'Tournament Organizer',
      description: 'The ultimate multi-sport experience for hosting tournaments, managing brackets, and live broadcasting.',
      icon: Trophy,
      color: 'text-yellow-400',
      features: ['Multi-Sport Organizing', 'Advanced Bracket Generation', 'Umpiring Interface', 'Live YouTube Streaming'],
      pricingOptions: [
        { label: 'Per Tournament', value: 'tournament', price: '₹1,200', description: 'Pay as you go per event' },
        { label: 'Monthly License', value: 'monthly', price: '₹3,900', description: 'Unlimited tournaments for 30 days' },
        { label: 'Yearly License', value: 'yearly', price: '₹39,000', description: 'Save 20% on annual billing' }
      ]
    },
    {
      id: 'mod_academy',
      type: 'ACADEMY',
      title: 'Academy Hub',
      description: 'End-to-end management for sports academies, student rosters, coaches, and training schedules.',
      icon: Users,
      color: 'text-[#1B9C56]',
      features: ['Student Roster & Profiles', 'Billing & Invoicing', 'Coach Assignments', 'Performance Tracking'],
      pricingOptions: [
        { label: 'Monthly License', value: 'monthly', price: '₹7,900', description: 'Billed every month' },
        { label: 'Yearly License', value: 'yearly', price: '₹79,000', description: 'Save 20% on annual billing' }
      ]
    },
    {
      id: 'mod_club',
      type: 'CLUB',
      title: 'Club Management',
      description: 'Run your local sports club efficiently with member management and facility booking.',
      icon: Building,
      color: 'text-purple-400',
      features: ['Member Directory', 'Facility Booking', 'Internal Club Tournaments', 'Financial Analytics'],
      pricingOptions: [
        { label: 'Monthly License', value: 'monthly', price: '₹6,300', description: 'Billed every month' },
        { label: 'Yearly License', value: 'yearly', price: '₹63,000', description: 'Save 20% on annual billing' }
      ]
    },
    {
      id: 'mod_court',
      type: 'COURT',
      title: 'Court Provider',
      description: 'List your courts for booking, manage availability, and handle payments.',
      icon: MapPin,
      color: 'text-pink-400',
      features: ['Dynamic Court Scheduling', 'Payment Processing', 'Player Reviews', 'Booking Analytics'],
      pricingOptions: [
        { label: 'Monthly License', value: 'monthly', price: '₹3,100', description: 'Billed every month' },
        { label: 'Yearly License', value: 'yearly', price: '₹31,000', description: 'Save 20% on annual billing' }
      ]
    }
  ];

  if (!isClient) return null;

  return (
    <>
      <section className="mt-8 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B9C56]/10 border border-[#1B9C56]/20 mb-4">
              <Box className="w-4 h-4 text-[#1B9C56]" />
              <span className="text-[10px] font-bold text-[#1B9C56] uppercase tracking-wider">ATHLON OS App Store</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
              Create a Workspace
            </h2>
            <p className="text-base font-medium text-foreground/50 mt-2 max-w-xl">
              Select a module to establish your organization. Each workspace operates independently under your centralized Digital Sports Passport.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((mod) => {
            const Icon = mod.icon;

            return (
              <div 
                key={mod.id} 
                className={`relative overflow-hidden rounded-[32px] p-[1px] group transition-all duration-500 hover:-translate-y-2`}
              >
                {/* Colorful Gradient Border Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent group-hover:from-[${mod.color.replace('text-', '#').replace('-400', '')}] group-hover:to-transparent opacity-50 transition-colors duration-500`} />
                
                {/* Glassmorphism Inner Card */}
                <div className="relative h-full bg-[#0A0F1A]/80 backdrop-blur-xl rounded-[31px] p-8 flex flex-col border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  
                  {/* Floating Background Icon */}
                  <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform group-hover:rotate-12">
                    <Icon className={`w-48 h-48 ${mod.color}`} />
                  </div>
                  
                  <div className="flex items-center gap-5 relative z-10 mb-6">
                    <div className={`p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${mod.color} drop-shadow-[0_0_10px_currentColor]`} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-2xl tracking-tight">{mod.title}</h3>
                      <span className="text-xs font-black text-white/50 uppercase tracking-widest mt-1 block">Module</span>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-white/70 relative z-10 mb-8 leading-relaxed max-w-sm">{mod.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mb-8 flex-grow">
                    {mod.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        {feature.toLowerCase().includes('streaming') ? (
                           <Video className="w-4 h-4 text-red-500 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        ) : (
                           <Check className="w-4 h-4 text-[#1B9C56] shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(27,156,86,0.6)]" />
                        )}
                        <span className="text-xs text-white/90 font-bold leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {!isAuthenticated ? (
                    <button 
                      onClick={() => router.push('/login')}
                      className="w-full relative z-10 bg-gradient-to-r from-[#1B9C56] to-[#158045] text-black text-sm font-black uppercase tracking-wider py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(27,156,86,0.3)] hover:shadow-[0_0_30px_rgba(27,156,86,0.5)] flex items-center justify-center gap-2"
                    >
                      Login to Create Workspace
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSelectModule(mod)}
                      className={`w-full relative z-10 text-sm font-black uppercase tracking-wider py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B9C56] to-[#158045] text-black shadow-[0_0_20px_rgba(27,156,86,0.3)] hover:shadow-[0_0_30px_rgba(27,156,86,0.5)] hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      Select Module
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creation / Licensing Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface border border-foreground/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors z-20 bg-black/20 p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Left Sidebar - Summary */}
            <div className="w-full md:w-2/5 bg-[#0A0F1A] p-8 border-r border-foreground/5 relative overflow-hidden">
               <div className="absolute -top-12 -left-12 opacity-5 pointer-events-none">
                 <selectedModule.icon className={`w-64 h-64 ${selectedModule.color}`} />
               </div>
               
               <div className="relative z-10 flex flex-col h-full">
                 <div className="mb-auto">
                   <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <selectedModule.icon className={`w-6 h-6 ${selectedModule.color}`} />
                   </div>
                   <h3 className="text-xl font-black text-white mb-2">{selectedModule.title}</h3>
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-6">Module License Checkout</span>
                   
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <Check className="w-4 h-4 text-[#1B9C56]" />
                       <span className="text-xs text-white/70 font-medium">Instant Provisioning</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <Check className="w-4 h-4 text-[#1B9C56]" />
                       <span className="text-xs text-white/70 font-medium">Independent Dashboard</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-12 p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                      <p className="text-[10px] text-[#3B82F6] font-medium leading-relaxed">
                        This workspace will be securely linked to your ATHLON ID. You can add staff and co-admins later.
                      </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-3/5 p-8 bg-surface">
              <h3 className="text-2xl font-black text-foreground mb-8">Setup Workspace</h3>
              
              <div className="space-y-8">
                {/* 1. Name */}
                <div>
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-3 block">1. Organization Name</label>
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={`e.g. Elite ${selectedModule.title}`}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-4 text-foreground font-bold focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all"
                    autoFocus
                  />
                </div>
                
                {/* 2. Billing Cycle */}
                <div>
                  <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-3 block">2. Select License Plan</label>
                  <div className="space-y-3">
                    {selectedModule.pricingOptions.map((option) => (
                      <div 
                        key={option.value}
                        onClick={() => setSelectedBilling(option.value)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedBilling === option.value 
                            ? 'border-[#1B9C56] bg-[#1B9C56]/5' 
                            : 'border-foreground/5 hover:border-foreground/20'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-foreground">{option.label}</div>
                          <div className="text-xs text-foreground/50 mt-1">{option.description}</div>
                        </div>
                        <div className="text-lg font-black text-foreground">{option.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 3. Checkout */}
                <div className="pt-4 border-t border-foreground/10">
                  <button 
                    onClick={handleCreateWorkspace}
                    disabled={!orgName.trim() || isCreating}
                    className="w-full bg-foreground disabled:opacity-50 disabled:cursor-not-allowed text-background text-sm font-black uppercase tracking-wider py-4 rounded-xl transition-all hover:bg-foreground/90 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> Secure Checkout & Create
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-foreground/40 mt-3">
                    By confirming, you agree to ATHLON OS terms of service.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
