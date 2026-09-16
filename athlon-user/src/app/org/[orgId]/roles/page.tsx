'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import OrganizerRolesPermissionsView from '@/components/organizer/OrganizerRolesPermissionsView';
import AcademyPermissionMatrixView from '@/components/academy/AcademyPermissionMatrixView';
import ClubPermissionMatrixView from '@/components/club/ClubPermissionMatrixView';

export default function OrgRolesPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const orgUuid = org?.id || orgIdParam;
  const orgName = org?.name || 'Workspace';

  if (org?.type === 'ORGANIZER' || org?.type === 'ASSOCIATION') {
    return <OrganizerRolesPermissionsView orgUuid={orgUuid} orgName={orgName} />;
  }

  if (org?.type === 'ACADEMY') {
    return <AcademyPermissionMatrixView orgUuid={orgUuid} />;
  }

  if (org?.type === 'CLUB') {
    return <ClubPermissionMatrixView orgUuid={orgUuid} />;
  }

  return <OrganizerRolesPermissionsView orgUuid={orgUuid} orgName={orgName} />;
}
