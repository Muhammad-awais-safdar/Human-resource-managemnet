'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as employeeService from '../../../services/employeeService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [email, setEmail] = useState('');
  
  // Passport State
  const [passportNumber, setPassportNumber] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportPlace, setPassportPlace] = useState('');

  // Visa State
  const [visaNumber, setVisaNumber] = useState('');
  const [visaType, setVisaType] = useState('');
  const [visaExpiryDate, setVisaExpiryDate] = useState('');
  const [visaEntryType, setVisaEntryType] = useState('MULTIPLE');

  // Custom Metadata Key-Value pairs grid
  const [metadataGrid, setMetadataGrid] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProfile = () => {
    employeeService.getEmployeeInfo('me')
      .then(res => {
        // Basic fields
        const emp = res.employee || {};
        setFirstName(emp.firstName || '');
        setLastName(emp.lastName || '');
        setEmployeeCode(emp.employeeCode || '');
        setEmail(emp.email || '');

        // Parse custom JSONB metadata into key-value pairs
        if (emp.customMetadata) {
          try {
            const parsed = typeof emp.customMetadata === 'string' 
              ? JSON.parse(emp.customMetadata) 
              : emp.customMetadata;
            const grid = Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v) }));
            setMetadataGrid(grid);
          } catch (e) {
            console.error("Failed to parse custom metadata JSON", e);
          }
        }

        // Passport
        const pass = res.passport || {};
        setPassportNumber(pass.passportNumber || '');
        setPassportIssueDate(pass.issueDate ? pass.issueDate.split('T')[0] : '');
        setPassportExpiryDate(pass.expiryDate ? pass.expiryDate.split('T')[0] : '');
        setPassportPlace(pass.placeOfIssue || '');

        // Visa
        const vis = res.visa || {};
        setVisaNumber(vis.visaNumber || '');
        setVisaType(vis.visaType || '');
        setVisaExpiryDate(vis.expiryDate ? vis.expiryDate.split('T')[0] : '');
        setVisaEntryType(vis.entryType || 'MULTIPLE');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to retrieve employee profile data.');
      });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddMetaItem = () => {
    if (!newKey.trim()) return;
    // Check if key already exists
    if (metadataGrid.some(item => item.key === newKey.trim())) {
      setError('Custom metadata key already exists.');
      return;
    }
    setMetadataGrid([...metadataGrid, { key: newKey.trim(), value: newValue.trim() }]);
    setNewKey('');
    setNewValue('');
    setError('');
  };

  const handleRemoveMetaItem = (keyToRemove) => {
    setMetadataGrid(metadataGrid.filter(item => item.key !== keyToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Reconstruct metadata grid into a single JSON object
    const customMetadataObj = {};
    metadataGrid.forEach(item => {
      customMetadataObj[item.key] = item.value;
    });

    startTransition(async () => {
      try {
        await employeeService.updateEmployeeInfo('me', {
          employee: {
            firstName,
            lastName,
            customMetadata: JSON.stringify(customMetadataObj)
          },
          passport: {
            passportNumber,
            issueDate: passportIssueDate,
            expiryDate: passportExpiryDate,
            placeOfIssue: passportPlace
          },
          visa: {
            visaNumber,
            visaType,
            expiryDate: visaExpiryDate,
            entryType: visaEntryType
          }
        });
        setMessage('Your profile and custom metadata fields have been successfully updated.');
        loadProfile();
      } catch (err) {
        setError(err.message || 'Failed to update employee profile.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">My Employee Profile</h1>
        <p className="page-subtitle">Manage personal details, passport, visa records, and customize dynamic custom metadata</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Personal details */}
        <div className="form-card" style={{ maxWidth: '100%' }}>
          <h3>Personal Credentials</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Employee Code (Read-Only)</label>
              <input type="text" className={styles.input} value={employeeCode} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address (Read-Only)</label>
              <input type="text" className={styles.input} value={email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name</label>
              <input type="text" className={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input type="text" className={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} disabled={isPending} />
            </div>
          </div>
        </div>

        {/* Passport & Visa section */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          <div className="form-card" style={{ flex: 1, minWidth: '300px' }}>
            <h3>Passport Records</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Passport Number</label>
                <input type="text" className={styles.input} value={passportNumber} onChange={e => setPassportNumber(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Issue Date</label>
                <input type="date" className={styles.input} value={passportIssueDate} onChange={e => setPassportIssueDate(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expiry Date</label>
                <input type="date" className={styles.input} value={passportExpiryDate} onChange={e => setPassportExpiryDate(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Place of Issue</label>
                <input type="text" className={styles.input} value={passportPlace} onChange={e => setPassportPlace(e.target.value)} disabled={isPending} />
              </div>
            </div>
          </div>

          <div className="form-card" style={{ flex: 1, minWidth: '300px' }}>
            <h3>Visa Credentials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Visa Number</label>
                <input type="text" className={styles.input} value={visaNumber} onChange={e => setVisaNumber(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Visa Type</label>
                <input type="text" className={styles.input} placeholder="e.g. Work, Business, Tourist" value={visaType} onChange={e => setVisaType(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expiry Date</label>
                <input type="date" className={styles.input} value={visaExpiryDate} onChange={e => setVisaExpiryDate(e.target.value)} disabled={isPending} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Entry Type</label>
                <select className={styles.input} value={visaEntryType} onChange={e => setVisaEntryType(e.target.value)} style={{ background: 'var(--bg-tertiary)' }} disabled={isPending}>
                  <option value="SINGLE">Single Entry</option>
                  <option value="MULTIPLE">Multiple Entry</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic JSONB custom metadata editor */}
        <div className="form-card" style={{ maxWidth: '100%' }}>
          <h3>Custom Dynamic Fields (JSONB metadata)</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>Configure dynamic key-value parameters that save natively into the database profile JSONB context.</p>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Metadata key (e.g. blood_group)" 
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              style={{ flex: 1, minWidth: '180px' }}
              disabled={isPending}
            />
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Metadata value (e.g. O+)" 
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              style={{ flex: 1, minWidth: '180px' }}
              disabled={isPending}
            />
            <button 
              type="button" 
              onClick={handleAddMetaItem}
              className={`${styles.btn}`}
              style={{ border: '1px solid var(--border-light)', background: 'none', color: '#fff', minWidth: '100px' }}
              disabled={isPending}
            >
              + Add Field
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {metadataGrid.map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>{item.key}</strong> : {item.value}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveMetaItem(item.key)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                  disabled={isPending}
                >
                  Remove
                </button>
              </div>
            ))}
            {metadataGrid.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No custom metadata fields mapped yet.</p>
            )}
          </div>
        </div>

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: 'flex-start', padding: '12px 28px' }} disabled={isPending}>
          Save Profile Details
        </button>

      </form>
    </div>
  );
}
