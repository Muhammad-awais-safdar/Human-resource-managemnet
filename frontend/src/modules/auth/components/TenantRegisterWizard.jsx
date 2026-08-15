'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { authService } from '../services/authService';
import styles from '../styles/register.module.css';

export default function TenantRegisterWizard() {
  const [mounted, setMounted] = useState(false);
  const [isSubdomainRestricted, setIsSubdomainRestricted] = useState(false);
  const [step, setStep] = useState(1);

  // Form Fields - Tenant Registration
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [industryType, setIndustryType] = useState('GENERAL');

  // Branding Fields
  const [logoUrl, setLogoUrl] = useState('https://via.placeholder.com/150?text=Company+Logo');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');

  // Plan & Payment Fields
  const [planTier, setPlanTier] = useState('ENTERPRISE');
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);

  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  const [successData, setSuccessData] = useState(null);

  // Employee Registration State (for Tenant Subdomain context)
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empErrors, setEmpErrors] = useState({});
  const [empSuccess, setEmpSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 1) {
          const sub = parts[0].toLowerCase();
          if (sub !== 'localhost' && sub !== 'www' && sub !== 'app') {
            setIsSubdomainRestricted(true);
          }
        }
      }
    }, 0);
  }, []);

  const validateStep1 = () => {
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
    if (!adminPassword.trim()) {
      newErrors.adminPassword = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && !validateStep1()) return;
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentConfirmed) {
      setErrors({ payment: 'Please confirm payment authorization to activate workspace.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authService.registerTenant({
          companyName,
          subdomain,
          adminEmail,
          adminPassword,
          logoUrl,
          primaryColor,
          secondaryColor,
          planTier,
          industryType,
          paymentConfirmed,
        });

        if (response.success) {
          setSuccessData({
            subdomain: response.subdomain,
            tenantId: response.tenantId,
            adminEmail: adminEmail,
            planTier: planTier,
          });
        } else {
          setErrors({ submit: response.message || 'Workspace registration failed' });
        }
      } catch (err) {
        setErrors({ submit: err.message || 'An unexpected registration error occurred' });
      }
    });
  };

  const handleEmployeeRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!empFirstName.trim()) newErrors.firstName = 'First name is required';
    if (!empEmail.trim()) {
      newErrors.email = 'Corporate email address is required';
    } else if (!/\S+@\S+\.\S+/.test(empEmail)) {
      newErrors.email = 'Invalid email address format';
    }
    if (!empPassword.trim()) newErrors.password = 'Account password is required';

    if (Object.keys(newErrors).length > 0) {
      setEmpErrors(newErrors);
      return;
    }
    setEmpErrors({});

    startTransition(async () => {
      try {
        const response = await authService.registerEmployee({
          firstName: empFirstName,
          lastName: empLastName,
          email: empEmail,
          password: empPassword,
          employeeCode: empCode,
        });

        if (response.success) {
          setEmpSuccess(true);
        } else {
          setEmpErrors({ submit: response.message || 'Employee registration failed' });
        }
      } catch (err) {
        setEmpErrors({ submit: err.message || 'An unexpected registration error occurred' });
      }
    });
  };

  // 1. Employee Registration Form (on Tenant Subdomain context)
  if (isSubdomainRestricted) {
    if (empSuccess) {
      return (
        <div className={`${styles.card} ${styles.successCard}`} style={{ maxWidth: '520px' }}>
          <div className={styles.iconContainer}>
            <svg className={styles.successIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={styles.title}>Employee Account Registered!</h2>
          <p className={styles.successMsg}>
            Your employee profile for email <strong>{empEmail}</strong> has been created successfully. You can now log in to your company workspace.
          </p>
          <a 
            href="/login" 
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '20px' }}
          >
            Sign In to Workspace
          </a>
        </div>
      );
    }

    return (
      <div className={styles.card} style={{ maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
            EMPLOYEE WORKSPACE REGISTRATION
          </div>
          <h2 className={styles.title} style={{ marginBottom: '8px' }}>Join Your Workspace</h2>
          <p className={styles.subtitle}>Create your employee account to access your company directory & portal.</p>
        </div>

        {empErrors.submit && <div className={styles.errorBanner}>{empErrors.submit}</div>}

        <form onSubmit={handleEmployeeRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>First Name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="John"
                value={empFirstName}
                onChange={(e) => setEmpFirstName(e.target.value)}
              />
              {empErrors.firstName && <span className={styles.errorText}>{empErrors.firstName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Doe"
                value={empLastName}
                onChange={(e) => setEmpLastName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Corporate Email *</label>
            <input
              type="email"
              className={styles.input}
              placeholder="john.doe@company.com"
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
            />
            {empErrors.email && <span className={styles.errorText}>{empErrors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Account Password *</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={empPassword}
              onChange={(e) => setEmpPassword(e.target.value)}
            />
            {empErrors.password && <span className={styles.errorText}>{empErrors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Employee ID Code (Optional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="EMP-1001"
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: '8px' }}
          >
            {isPending ? 'Registering Account...' : 'Register Employee Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an active workspace account?{' '}
            <a href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </a>
          </div>
        </form>
      </div>
    );
  }

  // 2. Success Provisioning & Payment Confirmation Screen
  if (successData) {
    const targetUrl = `http://${successData.subdomain}.localhost:3000/login?payment=success`;

    return (
      <div className={`${styles.card} ${styles.successCard}`} style={{ maxWidth: '560px' }}>
        <div className={styles.iconContainer} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
          <svg className={styles.successIcon} style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className={styles.title}>Payment Authorized & Workspace Active!</h2>
        <p className={styles.successMsg}>
          Your subscription order for <strong>{companyName}</strong> has been processed successfully.
        </p>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', color: '#10b981', fontSize: '0.88rem', fontWeight: 600, textAlign: 'center' }}>
          ✅ Gateway Payment Checkout Succeeded • Status: ACTIVE (30-Day Renewal)
        </div>

        <div className={styles.tenantDetails}>
          <div className={styles.detailRow}>
            <span>Subdomain Workspace:</span>
            <strong>{successData.subdomain}.localhost:3000</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Admin Email:</span>
            <strong>{successData.adminEmail}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Assigned Role:</span>
            <strong style={{ color: '#6366f1' }}>🏢 TENANT_ADMIN (Workspace Owner)</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Subscription Tier:</span>
            <strong>{successData.planTier} Plan</strong>
          </div>
        </div>

        <button 
          onClick={() => {
            window.location.href = targetUrl;
          }} 
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '24px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          🚀 Launch Workspace & Login as Tenant Admin →
        </button>
      </div>
    );
  }

  // 3. Main Domain 4-Step Tenant Onboarding Wizard
  return (
    <div className={styles.card}>
      {/* Stepper Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {[
            { num: 1, label: 'Workspace' },
            { num: 2, label: 'Branding' },
            { num: 3, label: 'Plan & Billing' },
            { num: 4, label: 'Provision' },
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: step >= s.num ? 'var(--primary-color)' : 'var(--bg-card-hover)',
                  color: step >= s.num ? '#ffffff' : 'var(--text-muted)',
                  border: step === s.num ? '2px solid #818cf8' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {s.num}
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '6px', color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === s.num ? 600 : 400 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: '4px', background: 'var(--bg-card-hover)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step - 1) / 3) * 100}%`, background: 'var(--primary-color)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {errors.submit && <div className={styles.errorBanner}>{errors.submit}</div>}

      <form onSubmit={step === 4 ? handleSubmit : handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* STEP 1: WORKSPACE SETUP */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className={styles.title}>Create Enterprise Tenant</h2>
              <p className={styles.subtitle}>Initialize your organization workspace</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Company / Organization Name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Workspace Subdomain *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="acme"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span style={{ padding: '0 14px', height: '42px', display: 'flex', alignItems: 'center', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderLeft: 'none', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                  .workforceos.com
                </span>
              </div>
              {errors.subdomain && <span className={styles.errorText}>{errors.subdomain}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Industry Capability Pack *</label>
              <select
                className={styles.input}
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <option value="GENERAL">🏢 General Corporate Enterprise (Standard Core HR)</option>
                <option value="HEALTHCARE">🏥 Healthcare & Hospitals (Ward Shifts, Clinical LMS, Medical Licenses)</option>
                <option value="IT_SERVICES">💻 Software & IT Services (Dev Worklogs, Equity Grants, OKRs)</option>
                <option value="MANUFACTURING">🏭 Manufacturing & Assembly (Piece-Rate Wage, Biometric Gateways)</option>
                <option value="HOSPITALITY">🏨 Hospitality & HoReCa (Hotel Rosters, Restaurant Tips, Permits)</option>
                <option value="AGRICULTURE">🌾 Agritech & Agriculture (Crop Yield Tracking, Harvest Output Wager)</option>
                <option value="RETAIL">🛍️ Retail & Supermarkets (POS Commissions, Shift Bidding Board)</option>
                <option value="EDUCATION">🎓 Education & Universities (Tenure Track, Academic Calendar)</option>
                <option value="CONSTRUCTION">🏗️ Construction & Engineering (Site Geofencing, Safety Permits)</option>
                <option value="LOGISTICS">🚚 Logistics & Fleet (DOT Logs, Route Mileage Calculation)</option>
                <option value="FINANCIAL_SERVICES">🏦 Financial Services & Banking (Insurance Commissions, Audits)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tenant Administrator Email *</label>
              <input
                type="email"
                className={styles.input}
                placeholder="admin@acme.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              {errors.adminEmail && <span className={styles.errorText}>{errors.adminEmail}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Master Password *</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              {errors.adminPassword && <span className={styles.errorText}>{errors.adminPassword}</span>}
            </div>
          </>
        )}

        {/* STEP 2: BRANDING CUSTOMIZATION */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className={styles.title}>White-Label Branding</h2>
              <p className={styles.subtitle}>Customize logo & colors for your tenant portal</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Company Logo URL</label>
              <input
                type="text"
                className={styles.input}
                placeholder="https://company.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Primary Theme Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Secondary Theme Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Live Brand Preview Card */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Portal Branding Live Preview</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {companyName ? companyName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{companyName || 'Acme HR'} Portal</h4>
                  <span style={{ fontSize: '0.8rem', color: secondaryColor }}>{subdomain ? `${subdomain}.workforceos.com` : 'subdomain.workforceos.com'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: PLAN & BILLING */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className={styles.title}>Subscription & Billing</h2>
              <p className={styles.subtitle}>Select enterprise tier & validate payment authorization</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'ENTERPRISE', name: 'Enterprise Unlimited', price: '$499 / mo', desc: 'Unlimited employees, dedicated PostgreSQL schema, ATS, Payroll & Audit Logs' },
                { id: 'GROWTH', name: 'Growth Business', price: '$199 / mo', desc: 'Up to 250 employees, automated leave management & attendance tracking' },
                { id: 'STARTER', name: 'Starter Team', price: '$79 / mo', desc: 'Up to 50 employees, Core HR directory & employee self-service' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setPlanTier(tier.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: planTier === tier.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: planTier === tier.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{tier.name}</strong>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{tier.price}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tier.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                Confirm payment method authorization & automatic provisioning agreement
              </label>
              {errors.payment && <span className={styles.errorText} style={{ display: 'block', marginTop: '6px' }}>{errors.payment}</span>}
            </div>
          </>
        )}

        {/* STEP 4: PROVISIONING CONFIRMATION */}
        {step === 4 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 className={styles.title}>Confirm & Provision</h2>
              <p className={styles.subtitle}>Review your details before launching your isolated database context</p>
            </div>

            <div className={styles.tenantDetails}>
              <div className={styles.detailRow}>
                <span>Company Name:</span>
                <strong>{companyName}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Subdomain URL:</span>
                <strong>{subdomain}.workforceos.com</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Master Admin:</span>
                <strong>{adminEmail}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Selected Tier:</span>
                <strong>{planTier}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Database Allocation:</span>
                <strong style={{ color: 'var(--primary-color)' }}>Isolated PostgreSQL Schema</strong>
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ flex: 1 }}
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ flex: 1 }}
            >
              Continue Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ flex: 1 }}
            >
              {isPending ? 'Provisioning Workspace...' : 'Launch Workspace'}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Existing enterprise admin?{' '}
          <a href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </a>
        </div>
      </form>
    </div>
  );
}
