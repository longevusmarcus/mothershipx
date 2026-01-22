import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthModal } from "../AuthModal";
import { TestProviders, mockAuthContext } from "@/test/mocks/providers";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => mockAuthContext),
}));

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

describe("AuthModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthContext);
  });

  it("does not render when closed", () => {
    render(
      <TestProviders>
        <AuthModal open={false} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  it("renders sign in form when open", () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows email and password inputs in signin mode", () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it("switches to signup mode when clicking sign up link", async () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    const signUpButton = screen.getByText(/sign up/i);
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText("Create account")).toBeInTheDocument();
    });
  });

  it("shows name field in signup mode", async () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    // Switch to signup
    const signUpButton = screen.getByText(/sign up/i);
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  it("switches to forgot password mode", async () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    const forgotButton = screen.getByText("Forgot?");
    fireEvent.click(forgotButton);

    await waitFor(() => {
      expect(screen.getByText("Reset password")).toBeInTheDocument();
      expect(screen.getByText("We'll send you a reset link")).toBeInTheDocument();
    });
  });

  it("hides password field in forgot mode", async () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    const forgotButton = screen.getByText("Forgot?");
    fireEvent.click(forgotButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("••••••••")).not.toBeInTheDocument();
    });
  });

  it("shows back to sign in button in forgot mode", async () => {
    render(
      <TestProviders>
        <AuthModal open={true} onOpenChange={mockOnOpenChange} />
      </TestProviders>
    );

    const forgotButton = screen.getByText("Forgot?");
    fireEvent.click(forgotButton);

    await waitFor(() => {
      expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls signIn on signin form submit", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signIn: mockSignIn,
      });

      render(
        <TestProviders>
          <AuthModal 
            open={true} 
            onOpenChange={mockOnOpenChange} 
            onSuccess={mockOnSuccess}
          />
        </TestProviders>
      );

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
      });
    });

    it("shows success toast on successful signin", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signIn: mockSignIn,
      });

      render(
        <TestProviders>
          <AuthModal 
            open={true} 
            onOpenChange={mockOnOpenChange} 
            onSuccess={mockOnSuccess}
          />
        </TestProviders>
      );

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Welcome back");
      });
    });

    it("calls onSuccess callback after successful signin", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signIn: mockSignIn,
      });

      render(
        <TestProviders>
          <AuthModal 
            open={true} 
            onOpenChange={mockOnOpenChange} 
            onSuccess={mockOnSuccess}
          />
        </TestProviders>
      );

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("shows error toast on signin failure", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ 
        error: { message: "Invalid credentials" } 
      });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signIn: mockSignIn,
      });

      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "wrongpassword");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      });
    });

    it("calls signUp on signup form submit", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signUp: mockSignUp,
      });

      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      // Switch to signup mode
      const signUpLink = screen.getByText(/sign up/i);
      fireEvent.click(signUpLink);

      await waitFor(() => {
        expect(screen.getByText("Create account")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Your name");
      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await userEvent.type(nameInput, "John Doe");
      await userEvent.type(emailInput, "john@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith("John Doe", "john@example.com", "password123");
      });
    });

    it("calls resetPassword on forgot password submit", async () => {
      const mockResetPassword = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        resetPassword: mockResetPassword,
      });

      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      // Switch to forgot mode
      const forgotButton = screen.getByText("Forgot?");
      fireEvent.click(forgotButton);

      await waitFor(() => {
        expect(screen.getByText("Reset password")).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      await userEvent.type(emailInput, "test@example.com");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("shows forgot-sent state after successful password reset", async () => {
      const mockResetPassword = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        resetPassword: mockResetPassword,
      });

      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      // Switch to forgot mode
      const forgotButton = screen.getByText("Forgot?");
      fireEvent.click(forgotButton);

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      await userEvent.type(emailInput, "test@example.com");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Check your email")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("loading states", () => {
    it("shows loading state during signin", async () => {
      const mockSignIn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        signIn: mockSignIn,
      });

      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      const emailInput = screen.getByPlaceholderText("you@example.com");
      const passwordInput = screen.getByPlaceholderText("••••••••");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      fireEvent.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();
    });
  });

  describe("modal close behavior", () => {
    it("calls onOpenChange when modal is closed", () => {
      render(
        <TestProviders>
          <AuthModal open={true} onOpenChange={mockOnOpenChange} />
        </TestProviders>
      );

      // Find and click the close button (the X icon in the dialog)
      const closeButton = screen.getByRole("button", { name: /close/i });
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      }
    });
  });
});
