import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './styles/register.module.css';
import apiClient from '@/core/api/apiClient';
import { useAuth } from '@/core/context/AuthContext';

export function TenantRegisterWizard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    plan: 'enterprise',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.companyName || !formData.subdomain) {
        return setError('Company Name and Subdomain are required.');
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.adminEmail || !formData.password) {
        return setError('Admin email and password are required.');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match.');
      }
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register-tenant', {
        companyName: formData.companyName,
        subdomain: formData.subdomain,
        adminName: formData.adminName || formData.adminEmail.split('@')[0],
        adminEmail: formData.adminEmail,
        password: formData.password,
        plan: formData.plan,
      });

      if (response.success || response.token) {
        login({
          token: response.token,
          user: response.user,
          tenantId: response.tenantId,
          subdomain: formData.subdomain,
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Tenant registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.card}>
        <div className={styles.authHeader}>
          <div className={styles.logoBadge}>A</div>
          <h1 className={styles.title}>Provision Workspace</h1>
          <p className={styles.subtitle}>Step {step} of 2: Set up your enterprise SaaS tenant</p>
        </div>

        {error && <div className={styles.alertDanger}>{error}</div>}

        <form onSubmit={handleNext}>
          {step === 1 ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Subdomain Identifier</label>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="acme"
                  className={styles.input}
                  required
                />
              </div>

              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                Continue to Admin Account
              </button>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Admin Email Address</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {loading ? 'Provisioning...' : 'Provision Tenant'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className={styles.authFooter}>
          Already registered? <Link to="/login" className={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
