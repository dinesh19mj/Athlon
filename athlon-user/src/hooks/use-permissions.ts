'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AcademyPermissionService, AcademyRolePermission, AccessLevel } from '@/lib/api/permissions';
import { useOrgRole } from './use-org-role';

// System Default Fallback Matrix if API is unreachable
const DEFAULT_ACCESS_MATRIX: Record<string, Record<string, AccessLevel>> = {
  ADMIN: {
    batches: 'MANAGE',
    schedule: 'MANAGE',
    attendance: 'MANAGE',
    students: 'MANAGE',
    coaches: 'MANAGE',
    performance: 'MANAGE',
    posts: 'MANAGE',
    tournaments: 'MANAGE',
    matches: 'MANAGE',
    inventory: 'MANAGE',
    centres: 'MANAGE',
    facilities: 'MANAGE',
    staff: 'MANAGE',
    finances: 'MANAGE',
    settings: 'MANAGE',
  },
  COACH: {
    batches: 'MANAGE',
    schedule: 'MANAGE',
    attendance: 'MANAGE',
    students: 'VIEW',
    coaches: 'VIEW',
    performance: 'MANAGE',
    posts: 'MANAGE',
    tournaments: 'MANAGE',
    matches: 'MANAGE',
    inventory: 'VIEW',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'NONE',
    settings: 'NONE',
  },
  STAFF: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'MANAGE',
    students: 'MANAGE',
    coaches: 'VIEW',
    performance: 'NONE',
    posts: 'MANAGE',
    tournaments: 'VIEW',
    matches: 'VIEW',
    inventory: 'MANAGE',
    centres: 'VIEW',
    facilities: 'MANAGE',
    staff: 'VIEW',
    finances: 'VIEW',
    settings: 'NONE',
  },
  STUDENT: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'VIEW',
    students: 'NONE',
    coaches: 'VIEW',
    performance: 'VIEW',
    posts: 'VIEW',
    tournaments: 'MANAGE',
    matches: 'MANAGE',
    inventory: 'NONE',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'VIEW',
    settings: 'NONE',
  },
  PARENT: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'VIEW',
    students: 'VIEW',
    coaches: 'VIEW',
    performance: 'VIEW',
    posts: 'VIEW',
    tournaments: 'VIEW',
    matches: 'VIEW',
    inventory: 'NONE',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'MANAGE',
    settings: 'NONE',
  },
};

export function usePermissions(customOrgId?: string) {
  const { org, role, isAdmin } = useOrgRole(customOrgId);
  const orgUuid = org?.id || '';

  const [permissions, setPermissions] = useState<AcademyRolePermission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizedRole = useMemo(() => {
    const r = role.toUpperCase();
    if (['ADMIN', 'OWNER', 'MANAGER'].includes(r)) return 'ADMIN';
    if (r === 'COACH') return 'COACH';
    if (r === 'STAFF') return 'STAFF';
    if (r === 'PARENT') return 'PARENT';
    if (['STUDENT', 'ATHLETE', 'MEMBER'].includes(r)) return 'STUDENT';
    return 'STUDENT';
  }, [role]);

  const loadPermissions = useCallback(async () => {
    if (!orgUuid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await AcademyPermissionService.getOrgPermissions(orgUuid);
      const list = Array.isArray(res) ? res : res.data || [];
      if (list && list.length > 0) {
        setPermissions(list);
      }
    } catch (err) {
      console.warn('Failed to load permissions, using local defaults', err);
    } finally {
      setLoading(false);
    }
  }, [orgUuid]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const getAccessLevel = useCallback(
    (moduleId: string, targetRole?: string): AccessLevel => {
      const activeRole = (targetRole || normalizedRole).toUpperCase();
      const mod = moduleId.toLowerCase();

      // Check saved/customized permissions list first
      const found = permissions.find(
        (p) => p.role.toUpperCase() === activeRole && p.moduleId.toLowerCase() === mod
      );

      if (found) {
        return found.accessLevel;
      }

      // If active role is ADMIN and no override is saved, default to MANAGE
      if (activeRole === 'ADMIN' && !targetRole) {
        return 'MANAGE';
      }

      // Fallback matrix
      return DEFAULT_ACCESS_MATRIX[activeRole]?.[mod] || 'VIEW';
    },
    [normalizedRole, permissions]
  );

  const canAccessModule = useCallback(
    (moduleId: string): boolean => {
      const level = getAccessLevel(moduleId);
      return level !== 'NONE';
    },
    [getAccessLevel]
  );

  const canManageModule = useCallback(
    (moduleId: string): boolean => {
      const level = getAccessLevel(moduleId);
      return level === 'MANAGE';
    },
    [getAccessLevel]
  );

  const isViewOnly = useCallback(
    (moduleId: string): boolean => {
      const level = getAccessLevel(moduleId);
      return level === 'VIEW';
    },
    [getAccessLevel]
  );

  return {
    permissions,
    loading,
    isAdmin,
    role: normalizedRole,
    getAccessLevel,
    canAccessModule,
    canManageModule,
    isViewOnly,
    canManage: canManageModule,
    refreshPermissions: loadPermissions,
  };
}
