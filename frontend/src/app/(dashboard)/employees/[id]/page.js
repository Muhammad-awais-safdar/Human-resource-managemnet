'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as employeeService from '../../../../services/employeeService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function Employee360Page({ params }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const loadData = () => {
    employeeService.getEmployee360(id)
      .then(res => {
        if (res.success) {
          setProfile(res.data || res.roles || null);
        } else {
          setError(res.message || 'Failed to fetch employee profile.');
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch employee profile.');
      });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: '40px', color: 'var(--accent-danger)' }}>
        <h3>Error: {error}</h3>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>
        <h3>Loading Employee 360 Profile...</h3>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="form-card" style={{ margin: 0, padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Personal & Organization Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Employee ID</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{profile.id || profile.ID}</p>
              </div>
              <div>
                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Work Email</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{profile.email || profile.EMAIL}</p>
              </div>
              <div>
                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Corporate Role</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: 'var(--accent-primary)' }}>
                  {profile.role_name || profile.ROLE_NAME || 'EMPLOYEE'}
                </p>
              </div>
              <div>
                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Joining Date</label>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{profile.joining_date || profile.JOINING_DATE}</p>
              </div>
              <div>
                <label className={styles.label} style={{ fontSize: '0.7rem' }}>Employment Status</label>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: (profile.status || profile.STATUS) === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: (profile.status || profile.STATUS) === 'ACTIVE' ? 'var(--accent-success)' : 'var(--accent-danger)',
                    border: (profile.status || profile.STATUS) === 'ACTIVE' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {profile.status || profile.STATUS}
                </span>
              </div>
            </div>

            {profile.custom_metadata && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>Custom HR Metadata Fields</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {Object.entries(typeof profile.custom_metadata === 'string' ? JSON.parse(profile.custom_metadata) : profile.custom_metadata).map(([key, value]) => (
                    <div key={key}>
                      <label className={styles.label} style={{ fontSize: '0.7rem' }}>{key.replace('_', ' ')}</label>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '500', color: '#fff' }}>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'assets':
        return (
          <div className="form-card" style={{ margin: 0, padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Allocated Corporate Assets</h3>
            {(!profile.assets || profile.assets.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No physical or hardware assets assigned to this employee.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Asset Name</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Serial Code</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Allocated Date</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Returned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.assets.map(asset => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '500', color: '#fff' }}>{asset.asset_name || asset.ASSET_NAME}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{asset.asset_code || asset.ASSET_CODE}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{asset.allocated_at || asset.ALLOCATED_AT}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {asset.returned_at || asset.RETURNED_AT ? (
                          <span style={{ color: 'var(--text-muted)' }}>Returned ({asset.returned_at || asset.RETURNED_AT})</span>
                        ) : (
                          <span style={{ color: 'var(--accent-success)' }}>Active Allocation</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'leaves':
        return (
          <div className="form-card" style={{ margin: 0, padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Leave Requests History</h3>
            {(!profile.leaves || profile.leaves.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No leave applications logged for this profile.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Policy</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Duration</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reason</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.leaves.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '500', color: '#fff' }}>{l.policy_name || l.POLICY_NAME}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        {l.start_date || l.START_DATE} to {l.end_date || l.END_DATE}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{l.reason || l.REASON || 'No reason provided.'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: (l.status || l.STATUS) === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : (l.status || l.STATUS) === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: (l.status || l.STATUS) === 'APPROVED' ? 'var(--accent-success)' : (l.status || l.STATUS) === 'PENDING' ? '#f59e0b' : 'var(--accent-danger)',
                          }}
                        >
                          {l.status || l.STATUS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'performance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-card" style={{ margin: 0, padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Corporate Goals</h3>
              {(!profile.goals || profile.goals.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No performance goals configured.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Goal Title</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.goals.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '500', color: '#fff' }}>{g.title || g.TITLE}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{g.target_value || g.TARGET_VALUE}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{g.current_value || g.CURRENT_VALUE}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ fontSize: '0.8rem', color: (g.status || g.STATUS) === 'COMPLETED' ? 'var(--accent-success)' : '#f59e0b' }}>
                            {(g.status || g.STATUS).replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="form-card" style={{ margin: 0, padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Performance Peer Reviews</h3>
              {(!profile.feedback || profile.feedback.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No peer feedback logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.feedback.map(f => (
                    <div key={f.id} style={{ background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--accent-primary)', padding: '12px', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.85rem' }}>
                          ⭐ Rating: {f.rating || f.RATING} / 5
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {f.created_at || f.CREATED_AT}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        "{f.feedback || f.FEEDBACK}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div className="form-card" style={{ margin: 0, padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Payslips Payroll Logs</h3>
            {(!profile.payroll || profile.payroll.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No payslip record processed yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pay Period</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Net Salary</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.payroll.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '500', color: '#fff' }}>{p.pay_period || p.PAY_PERIOD}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>${p.net_salary || p.NET_SALARY}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: (p.status || p.STATUS) === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: (p.status || p.STATUS) === 'PAID' ? 'var(--accent-success)' : 'var(--accent-danger)',
                          }}
                        >
                          {p.status || p.STATUS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'timeline':
        return (
          <div className="form-card" style={{ margin: 0, padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Lifecycle Milestones Chronology</h3>
            {(!profile.timeline || profile.timeline.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No milestone milestones recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px', borderLeft: '1px solid var(--border-light)' }}>
                {profile.timeline.map((event, idx) => (
                  <div key={event.id} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '4px',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        border: '3px solid var(--bg-primary)'
                      }}
                    />
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                      {event.type || event.TYPE}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                      Effective: {event.effective_date || event.EFFECTIVE_DATE}
                    </span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {event.description || event.DESCRIPTION}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>
            {profile.first_name || profile.FIRST_NAME} {profile.last_name || profile.LAST_NAME}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
            Employee Code: <strong>{profile.employee_code || profile.EMPLOYEE_CODE}</strong>
          </p>
        </div>
      </header>

      {/* Tabs Toolbar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', gap: '24px', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: '👤 Profile & Org' },
          { id: 'assets', label: '💻 Hardware Assets' },
          { id: 'leaves', label: '📅 Leaves' },
          { id: 'payroll', label: '💵 Payroll' },
          { id: 'performance', label: '📈 Performance' },
          { id: 'timeline', label: '⏱️ Milestone Timeline' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}
