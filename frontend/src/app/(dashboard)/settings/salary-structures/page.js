'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as salaryStructureService from '../../../../services/salaryStructureService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function SalaryStructurePage() {
  const [components, setComponents] = useState([]);
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('EARNING');
  const [calculationType, setCalculationType] = useState('FIXED');
  const [defaultAmount, setDefaultAmount] = useState(500);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    salaryStructureService.getComponents()
      .then(res => setComponents(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateComponent = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!componentName) return setError('Component name is required.');

    startTransition(async () => {
      try {
        await salaryStructureService.createComponent({ componentName, componentType, calculationType, defaultAmount: parseFloat(defaultAmount) || 0, isTaxable: true });
        setMessage('Salary component configured successfully.');
        setComponentName('');
        setDefaultAmount(500);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create salary component.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Salary Structure & Component Builder</h1>
        <p className="page-subtitle">Configure pay grades, taxable/non-taxable earnings, deductions, HRA, Medical allowances, and dynamic CTC breakdowns</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Active Salary Components</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {components.map((c, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{c.component_name || c.componentName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Type: {c.component_type || c.componentType} | Calculation: {c.calculation_type || c.calculationType}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-success)' }}>${c.default_amount || c.defaultAmount}</div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '2px 6px', borderRadius: '4px' }}>TAXABLE</span>
                </div>
              </div>
            ))}
            {components.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No components configured.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Create Salary Component</h3>
          <form onSubmit={handleCreateComponent} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Component Name</label>
              <input type="text" className={styles.input} placeholder="Transport Allowance" value={componentName} onChange={e => setComponentName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Category</label>
              <select className={styles.input} value={componentType} onChange={e => setComponentType(e.target.value)} disabled={isPending}>
                <option value="EARNING">Earning / Allowance</option>
                <option value="DEDUCTION">Deduction / Withholding</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Calculation Mode</label>
              <select className={styles.input} value={calculationType} onChange={e => setCalculationType(e.target.value)} disabled={isPending}>
                <option value="FIXED">Fixed Monthly Amount</option>
                <option value="PERCENTAGE">Percentage of Basic Salary</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Default Monthly Value ($)</label>
              <input type="number" className={styles.input} value={defaultAmount} onChange={e => setDefaultAmount(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Add Component</button>
          </form>
        </div>
      </div>
    </div>
  );
}
