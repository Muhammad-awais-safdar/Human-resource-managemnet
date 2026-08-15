'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, Shield, Server, CheckCircle2, AlertTriangle, 
  Search, Filter, RefreshCw, Layers, Database, Lock, Unlock, 
  Building2, ArrowRight, Activity, Cpu, Sparkles, Globe
} from 'lucide-react';
import apiClient from '@/services/api';

export default function SuperAdminModuleManagementPage() {
  const [modules, setModules] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [updatingKey, setUpdatingKey] = useState(null);
  
  // Tenant Override Modal State
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantOverrides, setTenantOverrides] = useState([]);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [modRes, tenRes] = await Promise.all([
        apiClient.get('/superadmin/modules'),
        apiClient.get('/superadmin/tenants/deep-dive')
      ]);

      if (modRes && modRes.success !== false) {
        const moduleList = Array.isArray(modRes) ? modRes : (modRes.data || modRes.result || []);
        setModules(moduleList.length > 0 ? moduleList : []);
      } else {
        // Fallback default modules if backend is rebuilding
        setModules([
          { moduleKey: 'RECRUITMENT', name: 'Recruitment & ATS', category: 'TALENT', description: 'Applicant tracking, job postings, candidate pipelines, and AI resume parsing', isGloballyEnabled: true },
          { moduleKey: 'PAYROLL', name: 'Payroll & Disbursements', category: 'FINANCE', description: 'Multi-currency payroll engine, batch salary payouts, and tax withholding', isGloballyEnabled: true },
          { moduleKey: 'ATTENDANCE', name: 'Attendance & Shifts', category: 'WORKFORCE', description: 'Biometric tracking, shift rosters, geofenced clock-in, and overtime rules', isGloballyEnabled: true },
          { moduleKey: 'EXPENSE', name: 'Expense Management', category: 'FINANCE', description: 'Expense reimbursement claims, policy thresholds, and OCR receipt parsing', isGloballyEnabled: true },
          { moduleKey: 'ASSET', name: 'Asset Management', category: 'OPERATIONS', description: 'Hardware asset allocation, device tracking, and maintenance logs', isGloballyEnabled: true },
          { moduleKey: 'PERFORMANCE', name: 'Performance & OKRs', category: 'TALENT', description: '360 appraisal reviews, OKR goal tracking, and merit matrices', isGloballyEnabled: true },
          { moduleKey: 'LEARNING', name: 'LMS & Training', category: 'TALENT', description: 'Employee onboarding courses, certifications, and skill compliance', isGloballyEnabled: true },
          { moduleKey: 'TICKET', name: 'Helpdesk & Ticketing', category: 'OPERATIONS', description: 'Internal IT/HR ticketing, SLA tracking, and issue resolution', isGloballyEnabled: true },
          { moduleKey: 'SUCCESSION', name: 'Succession Planning', category: 'TALENT', description: '9-box talent grid, key role backups, and talent pipeline management', isGloballyEnabled: true },
          { moduleKey: 'AICOPILOT', name: 'AI HR Assistant', category: 'INNOVATION', description: 'Natural language HR assistant, document summary, and predictive analytics', isGloballyEnabled: true },
          { moduleKey: 'OBSERVABILITY', name: 'Observability Platform', category: 'SYSTEM', description: 'SRE metrics, Grafana dashboards, Loki log streaming, and telemetry', isGloballyEnabled: true }
        ]);
      }

      if (tenRes) {
        const tenantList = Array.isArray(tenRes) ? tenRes : (tenRes.data || tenRes.result || []);
        setTenants(tenantList);
      }
    } catch (err) {
      console.error("Failed to load module control data:", err);
      setError("Failed to connect to backend module management API.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobal = async (moduleKey, currentStatus) => {
    setUpdatingKey(moduleKey);
    const newStatus = !currentStatus;
    try {
      const data = await apiClient.put(`/superadmin/modules/${moduleKey}/toggle`, { enabled: newStatus });
      if (data && data.success !== false) {
        setModules(prev => prev.map(m => (m.moduleKey || m.module_key) === moduleKey ? { ...m, isGloballyEnabled: newStatus, is_globally_enabled: newStatus } : m));
      }
    } catch (err) {
      alert(`Failed to update module ${moduleKey}`);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleOpenOverrideModal = async (tenant) => {
    setSelectedTenant(tenant);
    setOverrideModalOpen(true);
    setOverrideLoading(true);
    try {
      const data = await apiClient.get(`/superadmin/modules/overrides/${tenant.id}`);
      if (data && data.success !== false) {
        setTenantOverrides(Array.isArray(data) ? data : (data.data || []));
      } else {
        setTenantOverrides([]);
      }
    } catch (err) {
      setTenantOverrides([]);
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleSetTenantOverride = async (moduleKey, enabledState) => {
    if (!selectedTenant) return;
    try {
      const data = await apiClient.post(`/superadmin/modules/overrides`, {
        tenantId: selectedTenant.id,
        moduleKey,
        enabled: enabledState
      });
      if (data && data.success !== false) {
        const ovData = await apiClient.get(`/superadmin/modules/overrides/${selectedTenant.id}`);
        if (ovData) setTenantOverrides(Array.isArray(ovData) ? ovData : (ovData.data || []));
      }
    } catch (err) {
      alert("Failed to update tenant module override");
    }
  };

  const categories = ['ALL', 'TALENT', 'FINANCE', 'WORKFORCE', 'OPERATIONS', 'INNOVATION', 'SYSTEM'];

  const filteredModules = modules.filter(m => {
    const key = m.moduleKey || m.module_key || '';
    const name = m.name || '';
    const desc = m.description || '';
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCount = modules.filter(m => m.isGloballyEnabled !== undefined ? m.isGloballyEnabled : m.is_globally_enabled).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(129, 140, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sliders size={14} /> PRODUCT OWNER FEATURE FLAGS
            </span>
            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              {activeCount} / {modules.length} Active
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Dynamic Module Control Center
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px' }}>
            Power ON or OFF any application module globally across all tenants or set per-tenant custom entitlements.
          </p>
        </div>

        <button 
          onClick={fetchData}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL PLATFORM MODULES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{modules.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.5rem' }}>GLOBALLY ENABLED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{activeCount}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginBottom: '0.5rem' }}>DISABLED / CUTOFF</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>{modules.length - activeCount}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, marginBottom: '0.5rem' }}>ACTIVE TENANTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>{tenants.length}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search module by name, key, or capability..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid #6366f1' : '1px solid #e2e8f0',
                background: selectedCategory === cat ? '#edf2fe' : '#ffffff',
                color: selectedCategory === cat ? '#4338ca' : '#64748b'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {filteredModules.map(module => {
          const moduleKey = module.moduleKey || module.module_key;
          const isEnabled = module.isGloballyEnabled !== undefined ? module.isGloballyEnabled : module.is_globally_enabled;
          const isBusy = updatingKey === moduleKey;

          return (
            <div 
              key={moduleKey}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: isEnabled ? '1px solid #cbd5e1' : '1px solid #fecaca',
                padding: '1.5rem',
                boxShadow: isEnabled ? '0 1px 3px rgba(0,0,0,0.05)' : '0 2px 8px rgba(239, 68, 68, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', letterSpacing: '0.05em' }}>
                      {module.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0', color: '#0f172a' }}>
                      {module.name}
                    </h3>
                    <code style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                      {moduleKey}
                    </code>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleGlobal(moduleKey, isEnabled)}
                    disabled={isBusy}
                    style={{
                      background: isEnabled ? '#22c55e' : '#cbd5e1',
                      border: 'none',
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: isEnabled ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  {module.description}
                </p>
              </div>

              {/* Footer Row */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', color: isEnabled ? '#16a34a' : '#dc2626' }}>
                  {isEnabled ? (
                    <><CheckCircle2 size={14} /> Active Platform-wide</>
                  ) : (
                    <><AlertTriangle size={14} /> Disabled Globally</>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-Tenant Override Section */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Building2 size={24} style={{ color: '#6366f1' }} />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Per-Tenant Custom Module Entitlements</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Grant or revoke specific module access for individual tenant organizations regardless of global default settings.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Tenant Organization</th>
                <th style={{ padding: '0.85rem 1rem' }}>Subdomain</th>
                <th style={{ padding: '0.85rem 1rem' }}>Subscription Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Plan Tier</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>{tenant.name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}><code>{tenant.subdomain}.awais-hr.com</code></td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: tenant.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: tenant.status === 'ACTIVE' ? '#15803d' : '#b91c1c' }}>
                      {tenant.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#4338ca' }}>{tenant.planTier || 'ENTERPRISE'}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenOverrideModal(tenant)}
                      style={{
                        background: '#edf2fe',
                        color: '#4338ca',
                        border: '1px solid #c7d2fe',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      Configure Modules <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Override Modal */}
      {overrideModalOpen && selectedTenant && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Module Access for <span style={{ color: '#4338ca' }}>{selectedTenant.name}</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  Subdomain: <code>{selectedTenant.subdomain}</code>
                </p>
              </div>
              <button 
                onClick={() => setOverrideModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {overrideLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading tenant entitlement state...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {modules.map(mod => {
                  const modKey = mod.moduleKey || mod.module_key;
                  const isGloballyOn = mod.isGloballyEnabled !== undefined ? mod.isGloballyEnabled : mod.is_globally_enabled;
                  const override = tenantOverrides.find(o => (o.moduleKey || o.module_key) === modKey);
                  const hasCustomOverride = override !== undefined;
                  const customState = hasCustomOverride 
                    ? (override.isEnabled !== undefined ? override.isEnabled : override.is_enabled) 
                    : isGloballyOn;

                  return (
                    <div 
                      key={modKey}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: hasCustomOverride ? '#faf5ff' : '#ffffff'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{mod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Default Global: {isGloballyOn ? 'ON' : 'OFF'} 
                          {hasCustomOverride && <span style={{ color: '#9333ea', fontWeight: 700, marginLeft: '0.5rem' }}>[CUSTOM OVERRIDE]</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleSetTenantOverride(modKey, true)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: customState === true ? '#22c55e' : '#f1f5f9',
                            color: customState === true ? '#ffffff' : '#64748b'
                          }}
                        >
                          ALLOW
                        </button>
                        <button
                          onClick={() => handleSetTenantOverride(modKey, false)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: customState === false ? '#ef4444' : '#f1f5f9',
                            color: customState === false ? '#ffffff' : '#64748b'
                          }}
                        >
                          BLOCK
                        </button>
                        {hasCustomOverride && (
                          <button
                            onClick={() => handleSetTenantOverride(modKey, null)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                              background: '#ffffff',
                              color: '#64748b'
                            }}
                          >
                            RESET
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setOverrideModalOpen(false)}
                style={{
                  background: '#4338ca',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
