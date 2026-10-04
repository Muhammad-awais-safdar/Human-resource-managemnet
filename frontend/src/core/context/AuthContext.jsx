import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  tenantId: null,
  subdomain: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [subdomain, setSubdomain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const storedTenant = localStorage.getItem('tenant_id');
      const storedSubdomain = localStorage.getItem('tenant_subdomain');

      if (storedToken) setToken(storedToken);
      if (storedTenant) setTenantId(storedTenant);
      if (storedSubdomain) setSubdomain(storedSubdomain);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user session', e);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = (sessionData) => {
    const { token, user, tenantId, subdomain } = sessionData;
    if (token) {
      setToken(token);
      localStorage.setItem('auth_token', token);
    }
    if (user) {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (tenantId) {
      setTenantId(tenantId);
      localStorage.setItem('tenant_id', tenantId);
    }
    if (subdomain) {
      setSubdomain(subdomain);
      localStorage.setItem('tenant_subdomain', subdomain);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTenantId(null);
    setSubdomain(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_subdomain');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenantId,
        subdomain,
        isAuthenticated: Boolean(token),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
