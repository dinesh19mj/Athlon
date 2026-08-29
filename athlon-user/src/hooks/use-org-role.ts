'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

export type UserOrgRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'MEMBER' | 'COACH' | 'STUDENT' | 'ATHLETE';

export function useOrgRole(customOrgId?: string) {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const targetOrgId = customOrgId || orgIdParam;

  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const org = organizations.find((o) => o.id === targetOrgId) || getActiveOrganization();

  const role: UserOrgRole = useMemo(() => {
    if (!org) return 'MEMBER';
    const r = (org.role || 'ADMIN').toUpperCase();
    if (['ADMIN', 'OWNER', 'MANAGER', 'COACH', 'STUDENT', 'ATHLETE'].includes(r)) {
      return r as UserOrgRole;
    }
    return 'MEMBER';
  }, [org]);

  const isAdmin = useMemo(() => {
    return role === 'ADMIN' || role === 'OWNER' || role === 'MANAGER';
  }, [role]);

  const isCoach = useMemo(() => {
    return role === 'COACH';
  }, [role]);

  const isMember = useMemo(() => {
    return role === 'MEMBER' || role === 'STUDENT' || role === 'ATHLETE';
  }, [role]);

  const canManage = isAdmin;

  return {
    org,
    role,
    isAdmin,
    isCoach,
    isMember,
    canManage,
  };
}
