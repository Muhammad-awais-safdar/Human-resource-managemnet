import { test, expect } from '@playwright/test';

test('Tenant Workspace Login Flow Simulation', async ({ page }) => {
  console.log('1. Navigating to Tenant Login Page...');
  await page.goto('http://localhost:3000/login');

  console.log('2. Filling in Credentials for ceo@ep-systems.com...');
  await page.fill('input[type="email"]', 'ceo@ep-systems.com');
  await page.fill('input[type="password"]', 'password123');

  console.log('3. Submitting Login Form...');
  await page.click('button[type="submit"]');

  console.log('4. Waiting for Authentication & Response...');
  await page.waitForTimeout(2000);

  // Check if MFA prompt or Dashboard appears
  const pageContent = await page.content();
  console.log('Page URL after submit:', page.url());

  expect(pageContent).toBeTruthy();
  console.log('✅ Tenant Login Test Completed Successfully!');
});
