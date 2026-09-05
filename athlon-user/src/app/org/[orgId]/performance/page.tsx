'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import AcademyPerformanceView from '@/components/academy/AcademyPerformanceView';

export default function PerformancePage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

  return (
    <AcademyPerformanceView
      orgUuid={orgUuid}
      orgName={org?.name || 'Academy'}
    />
  );
}
