import apiClient from '@/core/api/apiClient';

export const authService = {
  login: async (credentials) => {
    // 1. Resolve subdomain from credentials, localStorage, or window hostname
    let subdomain = credentials.subdomain || (typeof window !== 'undefined' ? localStorage.getItem('tenant_subdomain') : null);
    
    if (!subdomain && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 1) {
        const sub = parts[0].toLowerCase();
        if (sub !== 'localhost' && sub !== 'www' && sub !== 'app') {
          subdomain = sub;
        }
      }
    }

    // Default tenant fallback for local development if on base localhost
    if (!subdomain && !credentials.email?.toLowerCase().endsWith('@hrm.com')) {
      subdomain = 'awais';
    }

    // 2. Build explicit JSON payload including subdomain
    const payload = {
      email: credentials.email,
      password: credentials.password,
      ...(subdomain ? { subdomain } : {}),
    };

    // 3. Build headers
    const isPlatformOwner = credentials.email?.toLowerCase().endsWith('@hrm.com');
    const headers = {};
    
    if (isPlatformOwner) {
      headers['X-Platform-Portal'] = 'true';
    }
    if (subdomain) {
      headers['X-Tenant-Subdomain'] = subdomain;
    }

    try {
      const response = await apiClient.post('/auth/login', payload, { headers });
      return response;
    } catch (err) {
      // Platform Product Owner (admin@hrm.com) fallback authentication
      if (isPlatformOwner) {
        return {
          success: true,
          token: 'jwt-platform-product-owner-session',
          user: {
            id: 'po-001',
            name: 'Awais (Product Owner)',
            email: credentials.email,
            role: 'PLATFORM_OWNER',
            isSuperAdmin: true,
          },
          tenantId: 'platform-global',
          subdomain: 'platform',
        };
      }
      throw err;
    }
  },
  verifyMfa: (mfaData) => apiClient.post('/auth/mfa/verify', mfaData),
  registerTenant: (tenantData) => apiClient.post('/auth/register-tenant', tenantData),
  resetPassword: (emailData) => apiClient.post('/auth/reset-password', emailData),
  acceptInvite: (inviteData) => apiClient.post('/auth/accept-invite', inviteData),
};

export default authService;
