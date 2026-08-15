'use client';

import React, { useEffect, useState } from 'react';
import { 
  Puzzle, Download, Upload, CheckCircle2, AlertCircle, 
  Sparkles, ShieldCheck, Zap, RefreshCw, Trash2, Search, SlidersHorizontal,
  Power, Layers, Check, X, ArrowUpRight
} from 'lucide-react';
import * as marketplaceService from '../../../services/marketplaceService';

export default function PluginMarketplacePage() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('STORE'); // 'STORE', 'INSTALLED', 'UPLOAD'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [actionBusyId, setActionBusyId] = useState(null);

  // Custom Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [pluginName, setPluginName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getPlugins();
      if (Array.isArray(res)) {
        setPlugins(res);
      } else if (res && res.data) {
        setPlugins(res.data);
      } else {
        setPlugins([]);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('plugin-status-changed'));
      }
    } catch (err) {
      console.error("Failed to load plugins from backend API", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async (app) => {
    setActionBusyId(app.id || app.plugin_name);
    try {
      await marketplaceService.installPlugin({
        pluginName: app.plugin_name || app.pluginName,
        vendor: app.vendor || 'COMMUNITY',
        version: app.version || '1.0.0',
        category: app.category || 'GENERAL',
        description: app.description || '',
        icon: app.icon || '🔌',
        moduleKey: app.module_key || app.moduleKey
      });
      setMessage(`Plugin "${app.plugin_name || app.pluginName}" successfully installed & activated!`);
      await loadData();
    } catch (err) {
      alert("Failed to install plugin: " + (err.message || 'Unknown error'));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleTogglePlugin = async (p) => {
    setActionBusyId(p.id);
    try {
      const currentInstalled = p.is_installed !== undefined ? p.is_installed : (p.isInstalled !== undefined ? p.isInstalled : true);
      const newStatus = !currentInstalled;
      await marketplaceService.togglePlugin(p.id, newStatus);
      setMessage(`Plugin "${p.plugin_name || p.pluginName}" is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
      await loadData();
    } catch (err) {
      alert("Failed to toggle plugin: " + (err.message || 'Unknown error'));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleUninstallPlugin = async (p) => {
    if (!confirm(`Are you sure you want to uninstall plugin "${p.plugin_name || p.pluginName}"?`)) return;
    setActionBusyId(p.id);
    try {
      await marketplaceService.uninstallPlugin(p.id);
      setMessage(`Plugin "${p.plugin_name || p.pluginName}" has been uninstalled.`);
      await loadData();
    } catch (err) {
      alert("Failed to uninstall plugin: " + (err.message || 'Unknown error'));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleCustomUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    try {
      if (uploadFile) {
        const res = await marketplaceService.uploadPluginBundle(uploadFile);
        setMessage(res.message || `Custom plugin bundle successfully verified and installed!`);
      } else if (pluginName) {
        await marketplaceService.installPlugin({
          pluginName: pluginName,
          vendor: vendorName || 'Custom Developer / Upload',
          version: version || '1.0.0'
        });
        setMessage(`Custom plugin "${pluginName}" registered and activated successfully!`);
      } else {
        alert("Please select a .zip plugin bundle file or enter a plugin name.");
        setUploading(false);
        return;
      }
      setPluginName('');
      setVendorName('');
      setUploadFile(null);
      setActiveTab('INSTALLED');
      await loadData();
    } catch (err) {
      alert("Plugin upload failed: " + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const installedPlugins = plugins.filter(p => p.is_installed !== false && p.isInstalled !== false);
  const installedCount = installedPlugins.length;

  const categories = ['ALL', 'TALENT', 'FINANCE', 'WORKFORCE', 'OPERATIONS', 'INNOVATION', 'COMMUNICATION', 'HARDWARE'];

  const filteredPlugins = plugins.filter(app => {
    const name = app.plugin_name || app.pluginName || '';
    const desc = app.description || '';
    const category = app.category || 'GENERAL';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || category === selectedCategory;
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
              <Puzzle size={14} /> ENTERPRISE PLUGIN & EXTENSION ECOSYSTEM
            </span>
            <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              {installedCount} Active Plugins
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Plugin Marketplace & Add-on Store
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px' }}>
            One-click install, activate, or deactivate platform add-ons, third-party integrations, and custom <code>.zip</code> extension bundles for your enterprise tenant.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={loadData}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
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
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Tabs & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
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
            <Sparkles size={18} /> Plugin Directory ({plugins.length})
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
            <CheckCircle2 size={18} /> Installed & Active ({installedCount})
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
            <Upload size={18} /> Upload Plugin Bundle
          </button>
        </div>

        {activeTab === 'STORE' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search plugins..."
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: PLUGIN DIRECTORY MATRIX */}
      {activeTab === 'STORE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {filteredPlugins.map(app => {
            const pluginId = app.id || app.plugin_name;
            const isInstalled = app.is_installed !== false && app.isInstalled !== false;
            const isBusy = actionBusyId === pluginId;

            return (
              <div 
                key={pluginId}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: isInstalled ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isInstalled ? '0 4px 12px rgba(99, 102, 241, 0.08)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isInstalled ? '#e0e7ff' : '#edf2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: '1px solid #c7d2fe' }}>
                        {app.icon || '🔌'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          {app.plugin_name || app.pluginName}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                          By {app.vendor || 'Awais HR Labs'} • v{app.version || '1.0.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                    {app.description || 'Enterprise plugin extension providing dedicated workspace functionality.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {app.category || 'GENERAL'}
                  </span>

                  {isInstalled ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleTogglePlugin(app)}
                        disabled={isBusy}
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 size={14} /> Active
                      </button>
                      <button
                        onClick={() => handleUninstallPlugin(app)}
                        disabled={isBusy}
                        title="Uninstall Plugin"
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInstallApp(app)}
                      disabled={isBusy}
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
                      {isBusy ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                      Install Plugin
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
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Installed plugins registered and operational for your workspace.</p>
          </div>

          {installedCount > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Extension Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vendor / Developer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Version</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {installedPlugins.map((p, idx) => {
                    const isInstalled = p.is_installed !== false && p.isInstalled !== false;
                    const isBusy = actionBusyId === p.id;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{p.icon || '🔌'}</span> {p.plugin_name || p.pluginName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                            {p.category || 'GENERAL'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{p.vendor || 'Custom Upload'}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>v{p.version || '1.0.0'}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <button 
                            onClick={() => handleTogglePlugin(p)}
                            disabled={isBusy}
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
                            {isInstalled ? 'ACTIVE' : 'DEACTIVATED'}
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleUninstallPlugin(p)}
                            disabled={isBusy}
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
              <div style={{ fontWeight: 600 }}>No Installed Plugins</div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>Browse the Plugin Directory tab to install extensions for your workspace.</p>
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
              If you have a custom <code>.zip</code> or extension manifest package from a developer, upload it below to install and activate it.
            </p>
          </div>

          <form onSubmit={handleCustomUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Drag & Drop File Upload Area */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
              <Upload size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Drag & drop your <code>.zip</code> plugin bundle file here</div>
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
              disabled={uploading || (!uploadFile && !pluginName)}
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
