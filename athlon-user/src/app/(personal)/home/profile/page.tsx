'use client';

import { useAuthStore } from '@/lib/store/useAuthStore';

export default function ProfilePage() {
  const { userEmail } = useAuthStore();
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-extrabold mb-4">My Profile</h1>
      <p className="text-(--text-muted)">Manage your personal information and settings.</p>
      
      <div className="mt-8 bg-(--surface) border border-(--border) p-8 rounded-2xl max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-(--primary) flex items-center justify-center font-bold text-black text-xl">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-xl">{userEmail || 'Player'}</h3>
            <p className="text-(--text-muted)">Amateur Player</p>
          </div>
        </div>
        
        <hr className="border-(--border) my-6" />
        
        <h4 className="font-bold mb-4">Account Settings</h4>
        <button className="bg-(--surface-elevated) hover:bg-(--border) transition-colors px-4 py-2 rounded-(--radius-pill) text-sm font-semibold">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
