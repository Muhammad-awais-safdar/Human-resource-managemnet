import { useState, useEffect } from 'react';

// Decodes JWT base64url payload client-side without third party dependencies
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

export default function usePermissions() {
  const [roles, setRoles] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          const rolesStr = payload.roles || '';
          setRoles(rolesStr.split(',').map((r) => r.trim().toUpperCase()));
          setEmail(payload.sub || '');
        }
      }
    }
  }, []);

  const hasRole = (roleName) => {
    return roles.includes(roleName.toUpperCase());
  };

  const hasPermission = (permissionName) => {
    // Admins hold full system privileges by default
    if (hasRole('ADMIN') || hasRole('SYSTEM_ADMIN')) {
      return true;
    }
    return false;
  };

  return { roles, email, hasRole, hasPermission };
}
