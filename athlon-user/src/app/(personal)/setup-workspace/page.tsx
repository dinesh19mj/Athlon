'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore, WorkspaceType, Organization } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { Trophy, Users, Building, Check, MapPin, CreditCard, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

function SetupWorkspaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();

  const [selectedModule, setSelectedModule] = useState<WorkspaceModule | null>(null);
  const [orgName, setOrgName] = useState('');
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>('monthly');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!packageId) {
      router.push('/subscription');
      return;
    }

    const fetchPackage = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/identity/subscriptions/getPackageByUuid/${packageId}`);
        const json = await response.json();

        if (json.success && json.data) {
          const pkg = json.data;

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
            color = 'text-primary';
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

          const mod: WorkspaceModule = {
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

          setSelectedModule(mod);
          setSelectedBilling(mod.pricingOptions[0].value);
        } else {
          router.push('/subscription');
        }
      } catch (error) {
        console.error('Failed to fetch package:', error);
        router.push('/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, router]);

  const handleCreateWorkspace = async () => {
    if (!selectedModule || !orgName.trim()) return;

    setIsCreating(true);

    let newOrgIdStr = `org_${Date.now()}`;
    let finalOrgName = orgName.trim();
    let finalOrgType = selectedModule.type;

    try {
      const orgRes = await OrganizationService.create({
        name: finalOrgName,
        type: finalOrgType,
        subscriptionPackageUuid: selectedModule.id // Pass package UUID to auto-subscribe
      });

      if (orgRes && orgRes.data && orgRes.data.uuid) {
        newOrgIdStr = orgRes.data.uuid;
        finalOrgName = orgRes.data.name || finalOrgName;
        finalOrgType = (orgRes.data.type as WorkspaceType) || finalOrgType;
      }
    } catch (err) {
      console.warn('API Create Organization failed, proceeding with local simulation', err);
    }

    const newOrg: Organization = {
      id: newOrgIdStr,
      name: finalOrgName,
      type: finalOrgType,
    };

    addOrganization(newOrg);
    setActiveWorkspace(newOrgIdStr);

    setIsCreating(false);

    router.push(`/org/${newOrgIdStr}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!selectedModule) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-5xl mx-auto">
      <div className="w-full self-start mb-6">
        <Link href="/subscription" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors font-bold text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Packages
        </Link>
      </div>

      <div className="bg-surface border border-foreground/10 rounded-[32px] w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row min-h-[600px]">
        {/* Left Sidebar - Summary */}
        <div className="w-full md:w-2/5 bg-[#0A0F1A] p-8 md:p-10 border-r border-foreground/5 relative overflow-hidden flex flex-col">
          <div className="absolute -top-12 -left-12 opacity-5 pointer-events-none">
            <selectedModule.icon className={`w-64 h-64 ${selectedModule.color}`} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-auto">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <selectedModule.icon className={`w-6 h-6 ${selectedModule.color}`} />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{selectedModule.title}</h3>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-8">Module License Checkout</span>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm text-white/70 font-medium">Instant Provisioning</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm text-white/70 font-medium">Independent Dashboard</span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-5 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <p className="text-xs text-[#3B82F6] font-medium leading-relaxed">
                  This workspace will be securely linked to your ATHLON ID. You can add staff and co-admins later.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-3/5 p-8 md:p-10 bg-surface flex flex-col h-full">
          <h3 className="text-3xl font-black text-foreground mb-8">Setup Workspace</h3>

          <div className="flex flex-col flex-grow">
            {/* 1. Name */}
            <div className="mb-8">
              <label className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-4 block">1. Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={`e.g. Elite ${selectedModule.title}`}
                className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg"
                autoFocus
              />
            </div>

            {/* 2. Billing Cycle */}
            <div className="mb-10">
              <label className="text-xs font-black text-foreground/50 uppercase tracking-widest mb-4 block">2. Select License Plan</label>
              <div className="space-y-4">
                {selectedModule.pricingOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setSelectedBilling(option.value)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedBilling === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-foreground/5 hover:border-foreground/20'
                      }`}
                  >
                    <div>
                      <div className="font-bold text-base text-foreground">{option.label}</div>
                      <div className="text-sm text-foreground/50 mt-1">{option.description}</div>
                    </div>
                    <div className="text-2xl font-black text-foreground">{option.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Checkout */}
            <div className="pt-6 border-t border-foreground/10 mt-auto">
              <button
                onClick={handleCreateWorkspace}
                disabled={!orgName.trim() || isCreating}
                className="w-full bg-foreground disabled:opacity-50 disabled:cursor-not-allowed text-background text-base font-black uppercase tracking-wider py-5 rounded-2xl transition-all hover:bg-foreground/90 flex items-center justify-center gap-3 shadow-xl"
              >
                {isCreating ? (
                  <span className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Secure Checkout
                  </>
                )}
              </button>
              <p className="text-center text-xs font-bold text-foreground/40 mt-4">
                By confirming, you agree to ATHLON OS terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    }>
      <SetupWorkspaceForm />
    </Suspense>
  );
}
