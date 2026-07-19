import React from 'react';
import TenantRegisterWizard from '../../../modules/auth/components/TenantRegisterWizard';
import styles from '../../../modules/auth/styles/register.module.css';

export const metadata = {
  title: 'Register Workspace - Awais HR',
  description: 'Create and provision your isolated HR tenant workspace database context.',
};

export default function RegisterPage() {
  return (
    <main className={styles.authContainer}>
      <TenantRegisterWizard />
    </main>
  );
}
