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
});
