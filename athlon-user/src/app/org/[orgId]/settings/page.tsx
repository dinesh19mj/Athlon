'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Settings, User, Bell, CreditCard, ShieldAlert, Upload, Save, Building, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { OrganizationService } from '@/lib/api/organization';

export default function SettingsPage() {
  const { getActiveOrganization, updateOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [activeTab, setActiveTab] = useState('profile');

  // Form State
  const [name, setName] = useState(org?.name || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!org) return null;

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (org.id.startsWith('org_')) {
        console.warn('Cannot update mock organization in backend');
      } else {
        await OrganizationService.update(parseInt(org.id), {
          name: name.trim(),
          type: org.type,
          contactEmail: email,
          contactPhone: phone,
          address: address
        });
      }
      
      // Update local store
      updateOrganization(org.id, { name: name.trim() });
    } catch (err) {
      console.error('Failed to update organization profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#1B9C56]" /> Workspace Settings
        </h1>
        <p className="text-foreground/50 font-medium mt-2">Manage preferences, billing, and configurations for {org.name}.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'profile' 
                ? 'bg-[#1B9C56]/10 text-[#1B9C56]' 
                : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" /> Organization Profile
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'notifications' 
                ? 'bg-[#1B9C56]/10 text-[#1B9C56]' 
                : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'billing' 
                ? 'bg-[#1B9C56]/10 text-[#1B9C56]' 
                : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Plan
          </button>
          <div className="pt-4 mt-4 border-t border-foreground/10">
            <button 
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'danger' 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'text-red-500/60 hover:bg-red-500/10 hover:text-red-500'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-grow">
          <div className="bg-surface border border-foreground/5 rounded-[24px] p-6 md:p-8 shadow-sm">
            
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Organization Profile</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Update your workspace identity and contact details.</p>
                  
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-foreground/5 border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center text-foreground/40 hover:bg-foreground/10 hover:border-foreground/30 transition-colors cursor-pointer group">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1 group-hover:text-[#1B9C56] transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#1B9C56] transition-colors">Upload</span>
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Workspace Logo</h3>
                      <p className="text-xs text-foreground/50 mb-3">Recommended size: 512x512px. Max 2MB.</p>
                      <button className="px-4 py-1.5 rounded-lg border border-foreground/10 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors">
                        Remove Logo
                      </button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Organization Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Workspace Type</label>
                      <input type="text" defaultValue={org.type} disabled className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground/60 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Support Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@organization.com" className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Support Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Primary Address</label>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter full address..." className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56] focus:ring-1 focus:ring-[#1B9C56] transition-all min-h-[100px]" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-foreground/10">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B9C56] text-black text-sm font-black tracking-wide hover:bg-[#158045] transition-colors shadow-lg shadow-[#1B9C56]/20 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Notification Preferences</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Choose how you want to be alerted about workspace activity.</p>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'New Member Registrations', desc: 'Get notified when a new member or student joins.' },
                      { title: 'Fee Payment Alerts', desc: 'Notifications for successful fee collections and overdue alerts.' },
                      { title: 'Schedule Changes', desc: 'Alerts when a coach modifies or cancels a batch.' },
                      { title: 'Weekly Reports', desc: 'Receive a weekly digest of analytics and attendance.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-background border border-foreground/10 rounded-xl">
                        <div>
                          <div className="font-bold text-foreground">{item.title}</div>
                          <div className="text-xs text-foreground/50 mt-0.5">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                          <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B9C56]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Billing & Plan</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Manage your ATHLON OS license and billing details.</p>
                  
                  <div className="bg-gradient-to-br from-[#1B9C56] to-[#158045] p-6 rounded-2xl text-black shadow-lg shadow-[#1B9C56]/20 relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-black/70 text-xs font-black uppercase tracking-widest mb-1">Current Plan</div>
                        <h3 className="text-2xl font-black mb-2">{org.type} Pro License</h3>
                        <p className="text-sm font-bold text-black/80">₹2,999 / month. Next billing on Sep 12, 2026.</p>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-black tracking-wide hover:bg-black/80 transition-colors shadow-xl shrink-0">
                        Manage Subscription
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground mb-4">Billing History</h3>
                  <div className="border border-foreground/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-foreground/[0.02] border-b border-foreground/10">
                        <tr>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Description</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/5">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Aug 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-xs font-bold text-[#1B9C56] hover:underline">Download</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Jul 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-xs font-bold text-[#1B9C56] hover:underline">Download</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-red-500 mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                  </h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Irreversible actions for your workspace.</p>
                  
                  <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                    <h3 className="font-bold text-foreground mb-2">Delete Workspace</h3>
                    <p className="text-sm text-foreground/60 mb-6">Once you delete a workspace, there is no going back. All members, settings, and financial data will be permanently wiped from ATHLON OS.</p>
                    <button className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black tracking-wide hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                      Delete {org.name}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
    </div>
  );
}