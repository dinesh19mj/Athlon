'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AcademyPermissionMatrixView } from '@/components/academy/AcademyPermissionMatrixView';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function AcademyPermissionsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <Link
          href={`/org/${orgId}/settings`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
      </div>

      {/* Main Admin Permission Matrix */}
      <AcademyPermissionMatrixView orgUuid={org?.id || orgId} />
    </div>
  );
}
