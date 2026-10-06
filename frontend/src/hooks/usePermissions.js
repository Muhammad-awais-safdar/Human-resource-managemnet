import { useState, useEffect } from 'react';

// Decodes JWT base64url payload client-side cleanly
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const SUPERUSER_ROLES = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TENANT_ADMIN', 'ADMIN'];

export default function usePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          const rolesStr = payload.roles || payload.authorities || '';
          const rolesList = Array.isArray(rolesStr)
            ? rolesStr
            : String(rolesStr).split(',').map((r) => r.trim().toUpperCase());

          const permsStr = payload.permissions || payload.scopes || '';
          const permsList = Array.isArray(permsStr)
            ? permsStr
            : String(permsStr).split(',').map((p) => p.trim());

          setRoles(rolesList);
          setPermissions(permsList);
          setEmail(payload.sub || payload.email || '');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const hasRole = (roleName) => {
    if (!roleName) return true;
    return roles.some((r) => r.toUpperCase() === String(roleName).toUpperCase());
  };

  const isSuperUser = () => {
    return roles.some((r) => SUPERUSER_ROLES.includes(r.toUpperCase()));
  };

  const hasPermission = (permissionName) => {
    if (!permissionName) return true;
    if (isSuperUser()) return true;

    const targetPerm = String(permissionName).trim();
    if (permissions.includes(targetPerm)) return true;

    // Check wildcard scope matches e.g. "payroll:*" matches "payroll:run"
    const domain = targetPerm.split(':')[0];
    if (domain && permissions.includes(`${domain}:*`)) return true;

    return false;
  };

  const hasAnyPermission = (requiredPermissions = []) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (isSuperUser()) return true;
    return requiredPermissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (requiredPermissions = []) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (isSuperUser()) return true;
    return requiredPermissions.every((perm) => hasPermission(perm));
  };

  return {
    roles,
    permissions,
    email,
    isLoading,
    hasRole,
    isSuperUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
