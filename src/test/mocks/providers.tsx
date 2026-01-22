import { ReactNode } from "react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock auth context
export const mockAuthContext = {
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue({ error: null }),
  updateProfile: vi.fn().mockResolvedValue({ error: null }),
};

export const mockAuthenticatedContext = {
  ...mockAuthContext,
  user: { id: "test-user-id", email: "test@example.com" },
  session: { access_token: "test-token" },
  profile: { 
    id: "test-user-id", 
    name: "Test User", 
    email: "test@example.com",
    avatar_url: null,
    bio: null,
    location: null,
    website: null,
    twitter: null,
    github: null,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  isAuthenticated: true,
};

// Mock subscription context
export const mockSubscriptionContext = {
  subscribed: false,
  isAdmin: false,
  role: "user" as const,
  isLoading: false,
  hasPremiumAccess: false,
  checkSubscription: vi.fn(),
  createCheckout: vi.fn(),
  openCustomerPortal: vi.fn(),
};

export const mockPremiumSubscriptionContext = {
  ...mockSubscriptionContext,
  subscribed: true,
  hasPremiumAccess: true,
};

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface TestProviderProps {
  children: ReactNode;
}

export function TestProviders({ children }: TestProviderProps) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
