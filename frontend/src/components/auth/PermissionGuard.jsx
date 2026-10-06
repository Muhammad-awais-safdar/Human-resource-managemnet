'use client';

import React from 'react';
import usePermissions from '@/hooks/usePermissions';

/**
 * PermissionGuard Component
 * Declaratively guards frontend components based on permissions or roles.
 *
 * Usage:
 * <PermissionGuard permission="leave:approve">
 *   <ApproveButton />
 * </PermissionGuard>
 */
export default function PermissionGuard({
  permission,
  permissions = [],
  role,
  requireAll = false,
  fallback = null,
  children,
}) {
  const { hasRole, hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (permissions.length > 0) {
    const isAuthorized = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!isAuthorized) {
      return fallback;
    }
  }

  return <>{children}</>;
}
