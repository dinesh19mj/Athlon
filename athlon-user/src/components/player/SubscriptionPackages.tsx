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
  const [modules, setModules] = useState<WorkspaceModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  const handleSelectModule = (mod: WorkspaceModule) => {
    router.push(`/setup-workspace?packageId=${mod.id}`);
  };

  useEffect(() => {
    setIsClient(true);

    const fetchPackages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/identity/subscriptions/getAllPackages`);
        const json = await response.json();
        if (json.success && json.data) {
          const fetchedModules: WorkspaceModule[] = json.data.map((pkg: any) => {

            let type: WorkspaceType = 'PERSONAL';
            let icon = Trophy;
            let color = 'text-yellow-400';

            if (pkg.name.toLowerCase().includes('organizer')) {
              type = 'ORGANIZER';
              icon = Trophy;
              color = 'text-yellow-400';
            } else if (pkg.name.toLowerCase().includes('academy')) {
              type = 'ACADEMY';
              icon = Users;
              color = 'text-[#1B9C56]';
            } else if (pkg.name.toLowerCase().includes('club')) {
              type = 'CLUB';
              icon = Building;
              color = 'text-purple-400';
            } else if (pkg.name.toLowerCase().includes('court')) {
              type = 'COURT';
              icon = MapPin;
              color = 'text-pink-400';
            }

            let parsedFeatures: string[] = [];
            try {
              parsedFeatures = JSON.parse(pkg.features);
            } catch (e) {
              parsedFeatures = [];
            }

            return {
              id: pkg.uuid,
              type,
              title: pkg.name,
              description: pkg.description,
              icon,
              color,
              features: parsedFeatures,
              pricingOptions: [
                {
                  label: 'Monthly License',
                  value: 'monthly',
                  price: `₹${pkg.price.toLocaleString()}`,
                  description: 'Billed every month'
                },
                {
                  label: 'Yearly License',
                  value: 'yearly',
                  price: `₹${(pkg.price * 10).toLocaleString()}`,
                  description: 'Save 20% on annual billing'
                }
              ]
            };
          });
          setModules(fetchedModules);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchPackages();
  }, []);

  if (!isClient) return null;

  return (
    <>
      <section className="mt-8 px-6 max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
              Create a Workspace
            </h2>
            <p className="text-base font-medium text-foreground/50 mt-2 max-w-xl">
              Select a module to establish your organization. Each workspace operates independently under your centralized Digital Sports Passport.
            </p>
          </div>
        </div>

        {isLoadingModules ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-4 border-[#1B9C56] border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (

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

                    <div className="flex items-baseline gap-2 mb-6 relative z-10">
                      <span className="text-3xl font-black text-white">{mod.pricingOptions[0]?.price}</span>
                      <span className="text-sm font-bold text-white/50">/ month</span>
                    </div>

                    <button
                      onClick={() => handleSelectModule(mod)}
                      className={`w-full relative z-10 text-sm font-black uppercase tracking-wider py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B9C56] to-[#158045] text-black shadow-[0_0_20px_rgba(27,156,86,0.3)] hover:shadow-[0_0_30px_rgba(27,156,86,0.5)] hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      Select Module
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
