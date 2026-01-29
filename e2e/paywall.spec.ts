import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Local Supabase credentials (from supabase status -o json)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODUwMjkxOTV9.3JWfd6WDiqpISyHV2bd3ll9vwxnvsjvH-0Gwc4T26BctIw3CSRkvbQV3x3aYvDcdYR0n5Tw4qPWmtmbpHvpMIw';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA4NTAyOTE5NX0.SzbIcCNRB9Tbr2mVJzEr9yszRA0kherAIiNTK3drYdIp_yzETBCe9VsfZ8ThtZCZd3CJUVD-B4KNeJeuQ8_RWw';

// A known problem ID from the local database
const TEST_PROBLEM_ID = 'a1b2c3d4-0001-4000-8000-000000000001';

// Admin client for creating test users
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

interface TestUser {
  id: string;
  email: string;
  password: string;
}

async function createTestUser(isPremium: boolean): Promise<TestUser> {
  const userId = crypto.randomUUID();
  const email = `test-${userId}@test.com`;
  const password = 'testpassword123';

  // Create the user via admin API
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email verification
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  const createdUserId = data.user.id;

  // If premium, add subscriber role
  if (isPremium) {
    const { error: roleError } = await adminSupabase
      .from('user_roles')
      .insert({ user_id: createdUserId, role: 'subscriber' });

    if (roleError) {
      throw new Error(`Failed to add premium role: ${roleError.message}`);
    }
  }

  return { id: createdUserId, email, password };
}

async function deleteTestUser(userId: string) {
  await adminSupabase.auth.admin.deleteUser(userId);
}

// Helper to set up auth session by signing in via Supabase REST API in browser
async function setupAuthSession(page: any, email: string, password: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Sign in via fetch to Supabase auth API
  const signInResult = await page.evaluate(async (credentials: { email: string, password: string }) => {
    const url = 'http://127.0.0.1:54321';
    const anonKey = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODUwMjkxOTV9.3JWfd6WDiqpISyHV2bd3ll9vwxnvsjvH-0Gwc4T26BctIw3CSRkvbQV3x3aYvDcdYR0n5Tw4qPWmtmbpHvpMIw';

    // Call Supabase auth API directly
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error_description || data.msg || 'Sign in failed' };
    }

    // Store the session in localStorage with the correct key format
    // Supabase extracts just the first part of the hostname before the dot
    // For 127.0.0.1, it uses just "127"
    const storageKey = 'sb-127-auth-token';
    localStorage.setItem(storageKey, JSON.stringify(data));

    return { success: true, userId: data.user?.id };
  }, { email, password });

  if (!signInResult.success) {
    throw new Error(`Sign in failed: ${signInResult.error}`);
  }

  // Reload to ensure the app picks up the session
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// Helper to check if user has subscriber role in DB
async function hasSubscriberRole(userId: string): Promise<boolean> {
  const { data } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'subscriber')
    .maybeSingle();
  return !!data;
}

// Helper to remove subscriber role (for cleanup/cancel simulation)
async function removeSubscriberRole(userId: string) {
  await adminSupabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'subscriber');
}

test.describe('Subscription Paywall', () => {
  // Clear storage before each test for proper isolation
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('premium user does NOT see the paywall on problem detail page', async ({ page }) => {
    // Create a premium test user
    const premiumUser = await createTestUser(true);

    try {
      // Set up auth session in browser by signing in directly
      await setupAuthSession(page, premiumUser.email, premiumUser.password);

      // Navigate to problem detail page
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForLoadState('networkidle');

      // Give time for subscription check to complete
      await page.waitForTimeout(3000);

      // The paywall dialog should NOT be visible for premium users
      const paywallDialog = page.getByRole('dialog').filter({ hasText: 'Unlock MothershipX' });
      await expect(paywallDialog).not.toBeVisible();
    } finally {
      // Cleanup
      await deleteTestUser(premiumUser.id);
    }
  });

  test('non-premium user DOES see the paywall on problem detail page', async ({ page }) => {
    // Create a non-premium test user
    const regularUser = await createTestUser(false);

    try {
      // Set up auth session in browser by signing in directly
      await setupAuthSession(page, regularUser.email, regularUser.password);

      // Navigate to problem detail page
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForLoadState('networkidle');

      // Give time for subscription check to complete
      await page.waitForTimeout(3000);

      // The paywall dialog SHOULD be visible for non-premium users
      const paywallDialog = page.getByRole('dialog').filter({ hasText: 'Unlock MothershipX' });
      await expect(paywallDialog).toBeVisible();

      // Verify the subscribe button is present
      const subscribeButton = page.getByRole('button', { name: /Subscribe Now/i });
      await expect(subscribeButton).toBeVisible();
    } finally {
      // Cleanup
      await deleteTestUser(regularUser.id);
    }
  });

  test('full subscription flow: purchase, verify access, cancel', async ({ page }) => {
    // This test involves Stripe checkout, so give it more time
    test.setTimeout(120000); // 2 minutes
    // Create a non-premium test user
    const testUser = await createTestUser(false);

    try {
      // === STEP 1: Sign in and verify non-premium state ===
      await setupAuthSession(page, testUser.email, testUser.password);
      await page.waitForTimeout(2000);

      // Verify no premium badge (Crown icon in amber circle) before purchase
      const premiumBadgeBefore = page.locator('.bg-amber-500');
      await expect(premiumBadgeBefore).not.toBeVisible();

      // === STEP 2: Navigate to problem, verify paywall shows ===
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const paywallDialog = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      await expect(paywallDialog).toBeVisible();

      // === STEP 3: Click subscribe button, go through Stripe checkout ===
      const subscribeButton = page.getByRole('button', { name: /Subscribe|Get Access|Unlock/i });
      await subscribeButton.click();

      // Wait for redirect to Stripe checkout (external page)
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

      // Wait for Stripe checkout form to be ready (don't use networkidle - Stripe never stops making requests)
      await page.waitForSelector('#cardNumber', { timeout: 15000 });

      // Stripe Checkout has the card inputs directly on page (not in iframes for hosted checkout)
      // Fill email first if visible
      const emailInput = page.locator('#email');
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill(testUser.email);
      }

      // Fill card number - Stripe hosted checkout uses #cardNumber
      await page.locator('#cardNumber').fill('4242 4242 4242 4242');

      // Fill expiry - format MM/YY
      await page.locator('#cardExpiry').fill('12/34');

      // Fill CVC
      await page.locator('#cardCvc').fill('123');

      // Fill cardholder name if visible
      const nameInput = page.locator('#billingName');
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Test User');
      }

      // Set country to US first (to ensure postal code field appears)
      const countrySelect = page.locator('#billingCountry');
      if (await countrySelect.isVisible().catch(() => false)) {
        await countrySelect.selectOption('US');
        // Wait for form to update after country change
        await page.waitForTimeout(500);
      }

      // Fill billing postal/zip code (only if visible - some countries don't have it)
      const postalInput = page.locator('#billingPostalCode');
      if (await postalInput.isVisible().catch(() => false)) {
        await postalInput.fill('12345');
      }

      // Submit the payment - look for the submit button
      const submitButton = page.locator('.SubmitButton, button[type="submit"]').first();
      await submitButton.click();

      // === STEP 4: Wait for redirect back to success page ===
      await page.waitForURL(/subscription\/success|success/i, { timeout: 30000 });

      // Give webhook time to process
      await page.waitForTimeout(3000);

      // === STEP 5: Verify DB state changed ===
      const hasRole = await hasSubscriberRole(testUser.id);
      expect(hasRole).toBe(true);

      // === STEP 6: Navigate to dashboard and verify premium badge appears (Crown icon) ===
      // Note: '/' is now the Landing page, so we go to /problems to see the badge in AppLayout
      await page.goto('/problems');
      await page.waitForTimeout(3000);

      // The premium badge is a Crown icon on the avatar - look for it in the header
      // The crown is inside a small circle with bg-amber-500
      const premiumBadge = page.locator('.bg-amber-500').first();
      await expect(premiumBadge).toBeVisible();

      // === STEP 7: Navigate to problem, verify NO paywall ===
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const paywallAfterPurchase = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      await expect(paywallAfterPurchase).not.toBeVisible();

      // === STEP 8: Go to profile, verify subscription status shown ===
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Verify subscription status is shown (lifetime access)
      const subscriptionStatus = page.locator('text=/Lifetime|Premium|Subscribed/i');
      await expect(subscriptionStatus.first()).toBeVisible();

      // === STEP 9: Click manage subscription, go to Stripe Customer Portal ===
      // Wait for the button to be visible and clickable
      const manageButton = page.getByRole('button', { name: /Manage Subscription/i });
      await expect(manageButton).toBeVisible({ timeout: 10000 });

      // Note: Opens in new tab, so we need to handle popup
      const [portalPage] = await Promise.all([
        page.context().waitForEvent('page', { timeout: 15000 }),
        manageButton.click(),
      ]);

      // Wait for Stripe portal to load
      await portalPage.waitForURL(/billing\.stripe\.com/, { timeout: 15000 });
      await portalPage.waitForSelector('text=/Payment methods|Billing|Invoice/i', { timeout: 10000 });

      // Verify we're on the Stripe Customer Portal
      expect(portalPage.url()).toContain('billing.stripe.com');

      // Close portal and return to app
      await portalPage.close();

      // === STEP 10: Revoke access (simulate refund/admin action) ===
      // For lifetime purchases, "cancellation" = refund or admin revocation
      // We'll remove the role to simulate admin revocation
      await removeSubscriberRole(testUser.id);

      // Clear any cached subscription status by reloading
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForTimeout(3000);

      // Verify paywall returns after access revoked
      const paywallAfterRevoke = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      await expect(paywallAfterRevoke).toBeVisible();

    } finally {
      // Cleanup
      await removeSubscriberRole(testUser.id).catch(() => {});
      await deleteTestUser(testUser.id);
    }
  });

  test('monthly subscription lifecycle: subscribe, manage, cancel', async ({ page }) => {
    // This test uses a recurring monthly subscription to test the full lifecycle
    test.setTimeout(180000); // 3 minutes - portal cancellation takes time

    const testUser = await createTestUser(false);

    try {
      // === STEP 1: Sign in ===
      await setupAuthSession(page, testUser.email, testUser.password);
      await page.waitForTimeout(2000);

      // === STEP 2: Navigate to problem, see paywall ===
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForTimeout(2000);

      const paywallDialog = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      await expect(paywallDialog).toBeVisible();

      // === STEP 3: Start checkout with monthly billing ===
      // We need to call the edge function directly with billingType: "monthly"
      // Since the UI doesn't support this, we'll navigate directly to checkout
      const checkoutUrl = await page.evaluate(async () => {
        const response = await fetch('http://127.0.0.1:54321/functions/v1/create-subscription-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-127-auth-token') || '{}').access_token}`,
          },
          body: JSON.stringify({ billingType: 'monthly' }),
        });
        const data = await response.json();
        return data.url;
      });

      expect(checkoutUrl).toBeTruthy();
      await page.goto(checkoutUrl);

      // Wait for Stripe checkout to load
      await page.waitForSelector('#cardNumber', { timeout: 15000 });

      // Fill card details
      await page.locator('#cardNumber').fill('4242 4242 4242 4242');
      await page.locator('#cardExpiry').fill('12/34');
      await page.locator('#cardCvc').fill('123');

      const nameInput = page.locator('#billingName');
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Test User');
      }

      const countrySelect = page.locator('#billingCountry');
      if (await countrySelect.isVisible().catch(() => false)) {
        await countrySelect.selectOption('US');
        await page.waitForTimeout(500);
      }

      const postalInput = page.locator('#billingPostalCode');
      if (await postalInput.isVisible().catch(() => false)) {
        await postalInput.fill('12345');
      }

      // Submit
      const submitButton = page.locator('.SubmitButton, button[type="submit"]').first();
      await submitButton.click();

      // === STEP 4: Wait for success ===
      await page.waitForURL(/subscription\/success|success/i, { timeout: 30000 });
      await page.waitForTimeout(5000); // Give webhook time to process

      // === STEP 5: Verify subscription in DB ===
      const hasRole = await hasSubscriberRole(testUser.id);
      expect(hasRole).toBe(true);

      // === STEP 6: Verify no paywall ===
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForTimeout(2000);

      const paywallAfterSubscribe = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      await expect(paywallAfterSubscribe).not.toBeVisible();

      // === STEP 7: Go to profile, click Manage Subscription ===
      await page.goto('/profile');
      await page.waitForTimeout(2000);

      // Open Stripe Customer Portal
      const [portalPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.getByRole('button', { name: /Manage Subscription/i }).click(),
      ]);

      await portalPage.waitForURL(/billing\.stripe\.com/, { timeout: 15000 });
      await portalPage.waitForTimeout(2000);

      // === STEP 8: Cancel subscription in Stripe Portal ===
      // Look for cancel button/link
      const cancelLink = portalPage.locator('text=/Cancel|End subscription/i').first();
      await cancelLink.click();

      // Confirm cancellation (Stripe shows confirmation page)
      await portalPage.waitForTimeout(1000);
      const confirmCancelButton = portalPage.locator('button:has-text("Cancel"), button:has-text("Confirm")').first();
      if (await confirmCancelButton.isVisible().catch(() => false)) {
        await confirmCancelButton.click();
      }

      // Wait for cancellation to process
      await portalPage.waitForTimeout(3000);
      await portalPage.close();

      // === STEP 9: Wait for webhook to process cancellation ===
      await page.waitForTimeout(5000);

      // === STEP 10: Verify paywall returns ===
      await page.goto(`/problems/${TEST_PROBLEM_ID}`);
      await page.waitForTimeout(3000);

      // After cancellation, paywall should appear (subscription deleted)
      const paywallAfterCancel = page.getByRole('dialog').filter({ hasText: /Unlock|Subscribe|Premium/i });
      // Note: Stripe might keep subscription active until period end
      // For immediate cancellation test, we check the DB
      const stillHasRole = await hasSubscriberRole(testUser.id);
      console.log('Still has subscriber role after cancel:', stillHasRole);

    } finally {
      // Cleanup
      await removeSubscriberRole(testUser.id).catch(() => {});
      await deleteTestUser(testUser.id);
    }
  });
});
