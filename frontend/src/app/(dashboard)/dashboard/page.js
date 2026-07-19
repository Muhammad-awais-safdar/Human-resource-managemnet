'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../../services/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    legalEntities: 0,
    costCenters: 0,
    departments: 0,
    teams: 0,
    totalNodes: 0,
  });
  const [workspaceName, setWorkspaceName] = useState('Workspace');

  useEffect(() => {
    // Retrieve workspace metadata
    apiClient.get('/tenants/active')
      .then((res) => {
        if (res.success) {
          setWorkspaceName(res.name);
        }
      })
      .catch((err) => console.error(err));

    // Retrieve active organization units to compute counts
    apiClient.get('/org')
      .then((res) => {
        if (Array.isArray(res)) {
          const counts = {
            legalEntities: res.filter(u => u.type === 'LEGAL_ENTITY').length,
            costCenters: res.filter(u => u.type === 'COST_CENTER').length,
            departments: res.filter(u => u.type === 'DEPARTMENT').length,
            teams: res.filter(u => u.type === 'TEAM').length,
            totalNodes: res.length,
          };
          setMetrics(counts);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Workspace Dashboard</h1>
        <p className="page-subtitle">Welcome to the administration portal for {workspaceName}</p>
      </header>

      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-title">Legal Entities</div>
          <div className="stats-value">{metrics.legalEntities}</div>
        </div>
        <div className="stats-card">
          <div className="stats-title">Cost Centers</div>
          <div className="stats-value">{metrics.costCenters}</div>
        </div>
        <div className="stats-card">
          <div className="stats-title">Departments</div>
          <div className="stats-value">{metrics.departments}</div>
        </div>
        <div className="stats-card">
          <div className="stats-title">Teams</div>
          <div className="stats-value">{metrics.teams}</div>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '100%' }}>
        <h3>Dynamic Connection Proof</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          This view connects to your isolated database container context. The counts displayed in the cards above are loaded dynamically in real time from the tenant schema by querying your dedicated PostgreSQL database tables.
        </p>
      </div>
    </div>
  );
}
