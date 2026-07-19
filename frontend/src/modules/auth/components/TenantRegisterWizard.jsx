'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { authService } from '../services/authService';
import styles from '../styles/register.module.css';

export default function TenantRegisterWizard() {
  const [mounted, setMounted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
      newErrors.subdomain = 'Subdomain must contain only alphanumeric characters and hyphens';
    }
    if (!adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.adminEmail = 'Invalid email address format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const response = await authService.registerTenant({
          companyName,
          subdomain,
          adminEmail,
        });
        
        if (response.success) {
          setSuccessData({
            subdomain: response.subdomain,
            tenantId: response.tenantId,
            adminEmail: adminEmail,
          });
        }
      } catch (err) {
        setErrors({ submit: err.message || 'An unexpected registration error occurred' });
      }
    });
  };

  if (!mounted) {
    // Return empty placeholder layout during server-side pre-rendering
    return <div style={{ minHeight: '300px' }} />;
  }

  if (successData) {
    return (
      <div className={`${styles.card} ${styles.successCard}`}>
        <div className={styles.iconContainer}>
          <svg className={styles.successIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={styles.title}>Provisioning Initiated!</h2>
        <p className={styles.successMsg}>
          We are dynamically creating your physical database and setting up your workspace environment.
        </p>
        <div className={styles.detailsBox}>
          <div className={styles.detailsRow}>
            <span>Subdomain:</span>
            <strong>{successData.subdomain}.localhost:3000</strong>
          </div>
          <div className={styles.detailsRow}>
            <span>Admin Email:</span>
            <strong>{successData.adminEmail}</strong>
          </div>
          <div className={styles.detailsRow}>
            <span>Default Password:</span>
            <code>admin123</code>
          </div>
          <div className={styles.detailsRow}>
            <span>Workspace ID:</span>
            <code>{successData.tenantId}</code>
          </div>
        </div>
        <a 
          href={`http://${successData.subdomain}.localhost:3000/login`} 
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '20px' }}
        >
          Launch Workspace
        </a>
      </div>
    );
  }

  return (
    <form className={`${styles.card} ${styles.formCard}`} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Get Started with Awais HR</h2>
      <p className={styles.subtitle}>Set up your isolated multi-tenant workspace registry</p>

      {errors.submit && <div className={`${styles.alert} ${styles.alertDanger}`}>{errors.submit}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="companyName" className={styles.label}>Company Name</label>
        <input
          type="text"
          id="companyName"
          className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
          placeholder="e.g. Acme Corporation"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isPending}
        />
        {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="subdomain" className={styles.label}>Target Subdomain</label>
        <div className={styles.subdomainInputWrapper}>
          <input
            type="text"
            id="subdomain"
            className={`${styles.input} ${errors.subdomain ? styles.inputError : ''}`}
            placeholder="acme"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            disabled={isPending}
          />
          <span className={styles.subdomainSuffix}>.awais-hr.com</span>
        </div>
        {errors.subdomain && <span className="error-text">{errors.subdomain}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="adminEmail" className={styles.label}>Administrator Email</label>
        <input
          type="email"
          id="adminEmail"
          className={`${styles.input} ${errors.adminEmail ? styles.inputError : ''}`}
          placeholder="admin@company.com"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          disabled={isPending}
        />
        {errors.adminEmail && <span className={styles.errorText}>{errors.adminEmail}</span>}
      </div>

      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
        {isPending ? (
          <span className={styles.spinnerWrapper}>
            <span className={styles.spinner}></span>
            Allocating Connection Pool...
          </span>
        ) : (
          'Register Workspace'
        )}
      </button>
    </form>
  );
}
