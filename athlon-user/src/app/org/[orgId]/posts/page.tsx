'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import AcademyPostFeedView from '@/components/academy/AcademyPostFeedView';

export default function OrganizationPostsPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = organizations.find((o) => o.id === orgIdParam) || getActiveOrganization();

  const orgUuid = (org?.id || orgIdParam) as string;
  const orgName = org?.name || (org?.type === 'CLUB' ? 'Club' : 'Academy');
  const orgType = org?.type || 'ACADEMY';

  return <AcademyPostFeedView orgUuid={orgUuid} orgName={orgName} orgType={orgType} />;
}
