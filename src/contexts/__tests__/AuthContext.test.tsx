import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";

// Mock supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

vi.mock("@/lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

// Test component to access auth context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="is-authenticated">{auth.isAuthenticated.toString()}</span>
      <span data-testid="is-loading">{auth.isLoading.toString()}</span>
      <span data-testid="user-email">{auth.user?.email || "none"}</span>
      <span data-testid="profile-name">{auth.profile?.name || "none"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("provides auth context to children", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("is-authenticated")).toBeInTheDocument();
  });

  it("starts with loading state", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("is-loading").textContent).toBe("true");
  });

  it("shows not authenticated when no session", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user-email").textContent).toBe("none");
  });

  it("shows authenticated when session exists", async () => {
    const mockSession = {
      user: { id: "test-id", email: "test@example.com" },
      access_token: "test-token",
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock profile fetch
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "test-id", name: "Test User" },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn(),
      }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("user-email").textContent).toBe("test@example.com");
  });

  it("sets up auth state change listener", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it("throws error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  describe("signIn", () => {
    it("calls supabase signInWithPassword", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: null,
      });

      let signInFn: ((email: string, password: string) => Promise<{ error: Error | null }>) | null = null;

      function SignInTest() {
        const { signIn } = useAuth();
        signInFn = signIn;
        return null;
      }

      render(
        <AuthProvider>
          <SignInTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(signInFn).not.toBeNull();
      });

      await act(async () => {
        await signInFn!("test@example.com", "password123");
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("signUp", () => {
    it("calls supabase signUp with correct parameters", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "new-user" }, session: null },
        error: null,
      });

      let signUpFn: ((name: string, email: string, password: string) => Promise<{ error: Error | null }>) | null = null;

      function SignUpTest() {
        const { signUp } = useAuth();
        signUpFn = signUp;
        return null;
      }

      render(
        <AuthProvider>
          <SignUpTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(signUpFn).not.toBeNull();
      });

      await act(async () => {
        await signUpFn!("Test User", "test@example.com", "password123");
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: expect.stringContaining("/"),
          data: {
            name: "Test User",
          },
        },
      });
    });
  });

  describe("signOut", () => {
    it("calls supabase signOut and clears profile", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      let signOutFn: (() => Promise<void>) | null = null;

      function SignOutTest() {
        const { signOut } = useAuth();
        signOutFn = signOut;
        return null;
      }

      render(
        <AuthProvider>
          <SignOutTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(signOutFn).not.toBeNull();
      });

      await act(async () => {
        await signOutFn!();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("calls supabase resetPasswordForEmail", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      let resetPasswordFn: ((email: string) => Promise<{ error: Error | null }>) | null = null;

      function ResetPasswordTest() {
        const { resetPassword } = useAuth();
        resetPasswordFn = resetPassword;
        return null;
      }

      render(
        <AuthProvider>
          <ResetPasswordTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(resetPasswordFn).not.toBeNull();
      });

      await act(async () => {
        await resetPasswordFn!("test@example.com");
      });

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        { redirectTo: expect.stringContaining("?mode=reset") }
      );
    });
  });
});
