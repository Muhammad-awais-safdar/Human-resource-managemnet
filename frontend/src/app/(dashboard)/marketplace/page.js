'use client';

import React, { useEffect, useState } from 'react';
import { 
  Puzzle, Download, Upload, CheckCircle2, AlertCircle, 
  ExternalLink, Sparkles, ShieldCheck, Zap, RefreshCw, Trash2, Search, SlidersHorizontal
} from 'lucide-react';
import * as marketplaceService from '../../../services/marketplaceService';

export default function WordPressStyleMarketplacePage() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('STORE'); // 'STORE', 'INSTALLED', 'UPLOAD'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Custom Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [pluginName, setPluginName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const featuredMarketplaceApps = [
    {
      id: 'app_slack_timeoff',
      plugin_name: 'Slack Time-Off & Attendance Bot',
      vendor: 'Slack Technologies',
      category: 'COMMUNICATION',
      version: '2.4.0',
      description: 'Receive instant Slack notifications for leave approvals, daily attendance digests, and clock-in reminders.',
      icon: '💬',
      installed: false
    },
    {
      id: 'app_whatsapp_payroll',
      plugin_name: 'WhatsApp Payslip & Alert Gateway',
      vendor: 'Meta Business',
      category: 'COMMUNICATION',
      version: '1.8.2',
      description: 'Send PDF payslips directly to employee WhatsApp accounts and trigger automated shift change alerts.',
      icon: '📱',
      installed: false
    },
    {
      id: 'app_quickbooks_sync',
      plugin_name: 'QuickBooks Financial Accounting Sync',
      vendor: 'Intuit',
      category: 'FINANCE',
      version: '3.1.0',
      description: 'Automatically export payroll journal entries, salary tax withholding, and expense reimbursements to QuickBooks Online.',
      icon: '📊',
      installed: true
    },
    {
      id: 'app_zoom_interviews',
      plugin_name: 'Zoom ATS Interview Auto-Scheduler',
      vendor: 'Zoom Video',
      category: 'RECRUITMENT',
      version: '1.5.0',
      description: 'Generate unique Zoom video meeting links automatically when recruiters schedule ATS candidate interviews.',
      icon: '🎥',
      installed: false
    },
    {
      id: 'app_biometric_gateway',
      plugin_name: 'ZKTeco / Hikvision Biometric Sync Engine',
      vendor: 'Enterprise Hardware Labs',
      category: 'HARDWARE',
      version: '4.0.1',
      description: 'Real-time TCP/IP push listener connecting physical attendance turnstiles and fingerprint scanners directly to Core HR.',
      icon: '🔑',
      installed: true
    },
    {
      id: 'app_ai_candidate_screener',
      plugin_name: 'AI Smart Resume Screener & Ranking',
      vendor: 'Awais HR AI Labs',
      category: 'AI_INNOVATION',
      version: '2.0.0',
      description: 'Leverage deep NLP model to automatically parse PDF candidate resumes against job requisitions and score suitability.',
      icon: '🤖',
      installed: false
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getPlugins();
      setPlugins(res || []);
    } catch (err) {
      console.error("Failed to load installed plugins", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async (app) => {
    try {
      await marketplaceService.installPlugin({
        pluginName: app.plugin_name,
        vendor: app.vendor,
        version: app.version
      });
      setMessage(`Plugin "${app.plugin_name}" successfully installed!`);
      loadData();
    } catch (err) {
      alert("Failed to install plugin: " + err.message);
    }
  };

  const handleTogglePlugin = async (p) => {
    try {
      const currentInstalled = p.is_installed !== undefined ? p.is_installed : (p.isInstalled !== undefined ? p.isInstalled : true);
      const newStatus = !currentInstalled;
      await marketplaceService.togglePlugin(p.id, newStatus);
      setMessage(`Plugin "${p.plugin_name || p.pluginName}" ${newStatus ? 'enabled' : 'disabled'}.`);
      loadData();
    } catch (err) {
      alert("Failed to toggle plugin: " + err.message);
    }
  };

  const handleUninstallPlugin = async (p) => {
    if (!confirm(`Are you sure you want to uninstall "${p.plugin_name || p.pluginName}"?`)) return;
    try {
      await marketplaceService.uninstallPlugin(p.id);
      setMessage(`Plugin "${p.plugin_name || p.pluginName}" uninstalled.`);
      loadData();
    } catch (err) {
      alert("Failed to uninstall plugin: " + err.message);
    }
  };

  const handleCustomUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    try {
      if (uploadFile) {
        const res = await marketplaceService.uploadPluginBundle(uploadFile);
        setMessage(res.message || `Custom plugin bundle successfully verified by security sandbox and installed!`);
      } else if (pluginName) {
        await marketplaceService.installPlugin({
          pluginName: pluginName,
          vendor: vendorName || 'Custom Developer / Upload',
          version: version || '1.0.0'
        });
        setMessage(`Custom plugin "${pluginName}" registered and installed successfully!`);
      } else {
        alert("Please select a .zip plugin bundle file or enter a plugin name.");
        setUploading(false);
        return;
      }
      setPluginName('');
      setVendorName('');
      setUploadFile(null);
      setActiveTab('INSTALLED');
      loadData();
    } catch (err) {
      alert("Plugin upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };


  const filteredStoreApps = featuredMarketplaceApps.filter(app => {
    const matchesSearch = app.plugin_name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: '16px',
        padding: '2.25rem 2.5rem',
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
            <span style={{ background: 'rgba(129, 140, 248, 0.2)', color: '#a5b4fc', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(165, 180, 252, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Puzzle size={14} /> EXTENSION MARKETPLACE & PLUGIN ENGINE
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            WordPress-Style App & Plugin Store
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '700px' }}>
            Install pre-built third-party integration add-ons or upload custom <code>.zip</code> extension bundles to instantly expand your enterprise capabilities.
          </p>
        </div>

        <button 
          onClick={() => setActiveTab('UPLOAD')}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <Upload size={18} /> Upload Plugin (.zip)
        </button>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Tabs & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', pb: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('STORE')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: activeTab === 'STORE' ? '#4338ca' : '#64748b',
              borderBottom: activeTab === 'STORE' ? '3px solid #4338ca' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={18} /> Marketplace Store
          </button>
          <button
            onClick={() => setActiveTab('INSTALLED')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: activeTab === 'INSTALLED' ? '#4338ca' : '#64748b',
              borderBottom: activeTab === 'INSTALLED' ? '3px solid #4338ca' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle2 size={18} /> Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('UPLOAD')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: activeTab === 'UPLOAD' ? '#4338ca' : '#64748b',
              borderBottom: activeTab === 'UPLOAD' ? '3px solid #4338ca' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Upload size={18} /> Upload Custom Plugin
          </button>
        </div>

        {activeTab === 'STORE' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search extensions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', color: '#334155' }}
            >
              <option value="ALL">All Categories</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="FINANCE">Finance & Accounting</option>
              <option value="RECRUITMENT">Recruitment & ATS</option>
              <option value="HARDWARE">Hardware & Biometrics</option>
              <option value="AI_INNOVATION">AI & Automation</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: MARKETPLACE STORE MATRIX */}
      {activeTab === 'STORE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {filteredStoreApps.map(app => {
            const isInstalled = plugins.some(p => (p.plugin_name || p.pluginName) === app.plugin_name);

            return (
              <div 
                key={app.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#edf2fe', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.6rem', border: '1px solid #c7d2fe', justifyContent: 'center' }}>
                        {app.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{app.plugin_name}</h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>By {app.vendor} • v{app.version}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                    {app.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {app.category}
                  </span>

                  {isInstalled ? (
                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={14} /> Installed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInstallApp(app)}
                      style={{
                        background: '#4338ca',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Download size={14} /> Install Plugin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INSTALLED PLUGINS LIST */}
      {activeTab === 'INSTALLED' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Active Tenant Extensions</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Installed plugins registered and operational for this enterprise workspace.</p>
          </div>

          {plugins.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Extension Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vendor / Developer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Version</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plugins.map((p, idx) => {
                    const isInstalled = p.is_installed !== undefined ? p.is_installed : (p.isInstalled !== undefined ? p.isInstalled : true);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Puzzle size={16} /> {p.plugin_name || p.pluginName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{p.vendor || 'Custom Upload'}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>v{p.version || '1.0.0'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span 
                            onClick={() => handleTogglePlugin(p)}
                            style={{ 
                              padding: '0.25rem 0.65rem', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              cursor: 'pointer',
                              background: isInstalled ? '#dcfce7' : '#f1f5f9', 
                              color: isInstalled ? '#15803d' : '#64748b',
                              border: `1px solid ${isInstalled ? '#bbf7d0' : '#cbd5e1'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isInstalled ? '#22c55e' : '#94a3b8' }}></span>
                            {isInstalled ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button 
                            onClick={() => alert(`Plugin ${p.plugin_name || p.pluginName} configuration panel loaded.`)}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Configure
                          </button>
                          <button 
                            onClick={() => handleUninstallPlugin(p)}
                            title="Uninstall Plugin"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
              <Puzzle size={40} style={{ strokeWidth: 1.5, marginBottom: '0.75rem', color: '#cbd5e1' }} />
              <div style={{ fontWeight: 600 }}>No Marketplace Plugins Installed Yet</div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>Browse the Marketplace Store tab or upload a custom extension bundle.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD CUSTOM PLUGIN (.ZIP) */}
      {activeTab === 'UPLOAD' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2.5rem', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#edf2fe', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Upload size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Upload Custom Plugin Bundle</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.35rem' }}>
              If you have a custom <code>.zip</code> or <code>.json</code> extension manifest from a developer, upload it below to install.
            </p>
          </div>

          <form onSubmit={handleCustomUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Drag & Drop File Upload Area */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
              <Upload size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Drag & drop your <code>.zip</code> plugin file here</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Maximum file size: 50 MB</div>
              <input 
                type="file" 
                accept=".zip,.json,.jar" 
                onChange={e => setUploadFile(e.target.files[0])}
                style={{ marginTop: '1rem', fontSize: '0.85rem' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Plugin / Extension Name *</label>
              <input
                type="text"
                placeholder="e.g. Custom Attendance Hardware Gateway"
                value={pluginName}
                onChange={e => setPluginName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Vendor / Developer</label>
                <input
                  type="text"
                  placeholder="e.g. In-house Engineering"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Version</label>
                <input
                  type="text"
                  placeholder="1.0.0"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !pluginName}
              style={{
                background: '#4338ca',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? 'Installing Plugin Bundle...' : 'Install & Activate Plugin'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
