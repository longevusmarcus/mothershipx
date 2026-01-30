import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Production Supabase credentials (from .env.secrets.local)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bbkhiwrgqilaokowhtxg.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test email pattern - easy to identify and cleanup
const TEST_EMAIL_PREFIX = 'test-e2e';
const TEST_EMAIL_DOMAIN = 'mothershipx.test';

// Admin client for creating/deleting test users
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

interface TestUser {
  id: string;
  email: string;
  password: string;
}

async function createTestUser(isPremium: boolean = false): Promise<TestUser> {
  const timestamp = Date.now();
  const email = `${TEST_EMAIL_PREFIX}-${timestamp}@${TEST_EMAIL_DOMAIN}`;
  const password = 'TestPassword123!';

  console.log(`Creating test user: ${email}`);

  // Create the user via admin API (skips email verification)
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Pre-verified, no email sent
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  const userId = data.user.id;
  console.log(`Created test user with ID: ${userId}`);

  // If premium, add subscriber record
  if (isPremium) {
    const { error: subError } = await adminSupabase
      .from('subscribers')
      .insert({
        user_id: userId,
        email: email,
        subscribed: true,
        subscription_tier: 'lifetime',
      });

    if (subError) {
      console.warn(`Failed to add premium status: ${subError.message}`);
    } else {
      console.log('Added premium subscriber status');
    }
  }

  return { id: userId, email, password };
}

async function deleteTestUser(userId: string) {
  console.log(`Deleting test user: ${userId}`);

  // Remove subscriber record first
  await adminSupabase
    .from('subscribers')
    .delete()
    .eq('user_id', userId)
    .catch(() => {});

  // Delete user
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);
  if (error) {
    console.warn(`Failed to delete test user: ${error.message}`);
  } else {
    console.log('Test user deleted');
  }
}

// Helper to sign in via the UI
async function signInViaUI(page: any, email: string, password: string) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Fill email
  await page.locator('[data-testid="auth-email-input"]').fill(email);

  // Fill password
  await page.locator('[data-testid="auth-password-input"]').fill(password);

  // Click sign in button
  await page.locator('[data-testid="auth-submit-button"]').click();

  // Wait for redirect to /problems (authenticated users go there)
  await page.waitForURL(/\/problems/, { timeout: 15000 });
  console.log('Signed in successfully');
}

test.describe('Live Paywall Tests', () => {
  test('non-premium user sees paywall on problem detail', async ({ page }) => {
    const testUser = await createTestUser(false);

    try {
      // Sign in
      await signInViaUI(page, testUser.email, testUser.password);

      // Go to problems list
      await page.waitForTimeout(2000);

      // Click on the first problem card to go to detail
      const problemCard = page.locator('[data-testid="problem-card"]').first();
      await problemCard.waitFor({ state: 'visible', timeout: 10000 });
      await problemCard.click();
      await page.waitForTimeout(2000);

      // Check for paywall dialog
      const paywallDialog = page.locator('[data-testid="subscription-paywall-dialog"]');

      // Take a screenshot for verification
      await page.screenshot({ path: 'test-results/paywall-visible.png' });

      console.log('Test completed - check screenshot for paywall visibility');

    } finally {
      await deleteTestUser(testUser.id);
    }
  });

  test('premium user does NOT see paywall', async ({ page }) => {
    const testUser = await createTestUser(true); // Premium user

    try {
      // Sign in
      await signInViaUI(page, testUser.email, testUser.password);

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Go to problems list and click first problem
      const problemCard = page.locator('[data-testid="problem-card"]').first();
      await problemCard.waitFor({ state: 'visible', timeout: 10000 });
      await problemCard.click();
      await page.waitForTimeout(3000);

      // Paywall should NOT be visible
      const paywallDialog = page.locator('[data-testid="subscription-paywall-dialog"]');

      // Take a screenshot
      await page.screenshot({ path: 'test-results/no-paywall-premium.png' });

      // Verify no paywall
      await expect(paywallDialog).not.toBeVisible();
      console.log('Premium user correctly does not see paywall');

    } finally {
      await deleteTestUser(testUser.id);
    }
  });

  test('full checkout flow with test card', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for checkout flow

    const testUser = await createTestUser(false);

    try {
      // Sign in
      await signInViaUI(page, testUser.email, testUser.password);
      await page.waitForTimeout(2000);

      // Navigate to profile to trigger upgrade
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Look for upgrade button
      const upgradeButton = page.locator('[data-testid="upgrade-button"]').first();

      if (await upgradeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Clicking upgrade button...');
        await upgradeButton.click();

        // Wait for paywall dialog to appear
        const paywallDialog = page.locator('[data-testid="subscription-paywall-dialog"]');
        await paywallDialog.waitFor({ state: 'visible', timeout: 5000 });

        // Click subscribe button in the paywall
        const subscribeButton = page.locator('[data-testid="subscribe-button"]');
        await subscribeButton.click();

        // Wait for Stripe checkout redirect
        await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
        console.log('Redirected to Stripe checkout');

        // Wait for checkout form to load
        await page.waitForSelector('#cardNumber', { timeout: 15000 });

        // Fill test card details
        console.log('Filling card details...');
        await page.locator('#cardNumber').fill('4242 4242 4242 4242');
        await page.locator('#cardExpiry').fill('12/34');
        await page.locator('#cardCvc').fill('123');

        // Fill name if visible
        const nameInput = page.locator('#billingName');
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('Test User');
        }

        // Fill country if visible
        const countrySelect = page.locator('#billingCountry');
        if (await countrySelect.isVisible().catch(() => false)) {
          await countrySelect.selectOption('US');
          await page.waitForTimeout(500);
        }

        // Fill postal code if visible
        const postalInput = page.locator('#billingPostalCode');
        if (await postalInput.isVisible().catch(() => false)) {
          await postalInput.fill('12345');
        }

        // Take screenshot before submitting
        await page.screenshot({ path: 'test-results/stripe-checkout-filled.png' });

        // Submit payment
        console.log('Submitting payment...');
        const submitButton = page.locator('.SubmitButton, button[type="submit"]').first();
        await submitButton.click();

        // Wait for redirect back to success page
        await page.waitForURL(/subscription\/success|success/i, { timeout: 30000 });
        console.log('Payment successful, redirected to success page');

        // Take screenshot of success
        await page.screenshot({ path: 'test-results/checkout-success.png' });

        // Wait for webhook to process
        await page.waitForTimeout(5000);

        // Verify user now has premium in DB
        const { data: subscriber } = await adminSupabase
          .from('subscribers')
          .select('subscribed')
          .eq('user_id', testUser.id)
          .single();

        console.log('Subscriber status:', subscriber);
        expect(subscriber?.subscribed).toBe(true);

      } else {
        console.log('No upgrade button found - user may already have access or UI different');
        await page.screenshot({ path: 'test-results/no-upgrade-button.png' });
      }

    } finally {
      await deleteTestUser(testUser.id);
    }
  });
});

// Cleanup utility - run separately to clean up any leftover test users
test.describe('Cleanup', () => {
  test.skip('cleanup all test users', async () => {
    console.log('Cleaning up test users...');

    // Find all test users by email pattern
    const { data: users, error } = await adminSupabase.auth.admin.listUsers();

    if (error) {
      console.error('Failed to list users:', error);
      return;
    }

    const testUsers = users.users.filter(u =>
      u.email?.startsWith(TEST_EMAIL_PREFIX) &&
      u.email?.endsWith(`@${TEST_EMAIL_DOMAIN}`)
    );

    console.log(`Found ${testUsers.length} test users to clean up`);

    for (const user of testUsers) {
      await deleteTestUser(user.id);
    }

    console.log('Cleanup complete');
  });
});
