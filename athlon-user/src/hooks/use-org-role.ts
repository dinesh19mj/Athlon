'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export type UserOrgRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'COACH' | 'STAFF' | 'STUDENT' | 'ATHLETE' | 'PARENT' | 'MEMBER';

export function useOrgRole(customOrgId?: string) {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const targetOrgId = customOrgId || orgIdParam;

  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const org = organizations.find((o) => o.id === targetOrgId) || getActiveOrganization();

  const role: UserOrgRole = useMemo(() => {
    if (!org) return 'MEMBER';
    const r = (org.role || 'ADMIN').toUpperCase();
    if (['ADMIN', 'OWNER', 'MANAGER', 'COACH', 'STAFF', 'STUDENT', 'ATHLETE', 'PARENT'].includes(r)) {
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

  const isStaff = useMemo(() => {
    return role === 'STAFF';
  }, [role]);

  const isStudent = useMemo(() => {
    return role === 'STUDENT' || role === 'ATHLETE';
  }, [role]);

  const isParent = useMemo(() => {
    return role === 'PARENT';
  }, [role]);

  const isMember = useMemo(() => {
    return role === 'MEMBER' || isStudent || isParent;
  }, [role, isStudent, isParent]);

  const canManage = isAdmin;

  return {
    org,
    role,
    isAdmin,
    isCoach,
    isStaff,
    isStudent,
    isParent,
    isMember,
    canManage,
  };
}
