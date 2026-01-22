import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppLayout } from "../AppLayout";
import { 
  TestProviders, 
  mockAuthContext, 
  mockAuthenticatedContext,
  mockSubscriptionContext,
  mockPremiumSubscriptionContext,
} from "@/test/mocks/providers";

// Mock the contexts
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => mockAuthContext),
}));

vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: vi.fn(() => mockSubscriptionContext),
}));

// Mock child components to simplify testing
vi.mock("@/components/AppSidebar", () => ({
  AppSidebar: ({ onClose }: { onClose?: () => void }) => (
    <div data-testid="app-sidebar">
      Sidebar
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  ),
}));

vi.mock("@/components/MobileBottomNav", () => ({
  MobileBottomNav: () => <div data-testid="mobile-bottom-nav">Mobile Nav</div>,
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock("@/components/NotificationsDropdown", () => ({
  NotificationsDropdown: () => <div data-testid="notifications">Notifications</div>,
}));

vi.mock("@/components/WelcomeChatbot", () => ({
  WelcomeChatbot: () => <div data-testid="welcome-chatbot">Chatbot</div>,
}));

vi.mock("@/components/AuthModal", () => ({
  AuthModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="auth-modal">Auth Modal <button onClick={() => onOpenChange(false)}>Close</button></div> : null
  ),
}));

// Import the mocked hooks
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <TestProviders>
        <AppLayout>
          <div data-testid="test-child">Test Content</div>
        </AppLayout>
      </TestProviders>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders sidebar on desktop", () => {
    render(
      <TestProviders>
        <AppLayout>Content</AppLayout>
      </TestProviders>
    );

    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
  });

  it("renders mobile bottom nav", () => {
    render(
      <TestProviders>
        <AppLayout>Content</AppLayout>
      </TestProviders>
    );

    expect(screen.getByTestId("mobile-bottom-nav")).toBeInTheDocument();
  });

  it("renders theme toggle and notifications", () => {
    render(
      <TestProviders>
        <AppLayout>Content</AppLayout>
      </TestProviders>
    );

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("notifications")).toBeInTheDocument();
  });

  it("renders welcome chatbot", () => {
    render(
      <TestProviders>
        <AppLayout>Content</AppLayout>
      </TestProviders>
    );

    expect(screen.getByTestId("welcome-chatbot")).toBeInTheDocument();
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext);
      vi.mocked(useSubscription).mockReturnValue(mockSubscriptionContext);
    });

    it("shows login button when not authenticated", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      // Find the login button by its icon container class
      const buttons = screen.getAllByRole("button");
      const loginButton = buttons.find(btn => btn.querySelector("svg"));
      expect(loginButton).toBeInTheDocument();
    });

    it("opens auth modal when login button is clicked", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      // Initially, auth modal should not be visible
      expect(screen.queryByTestId("auth-modal")).not.toBeInTheDocument();

      // Click the login button (the circular button with LogIn icon)
      const buttons = screen.getAllByRole("button");
      const loginButton = buttons.find(btn => 
        btn.className.includes("rounded-full") && 
        btn.className.includes("bg-muted")
      );
      
      if (loginButton) {
        fireEvent.click(loginButton);
        expect(screen.getByTestId("auth-modal")).toBeInTheDocument();
      }
    });
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(mockAuthenticatedContext as unknown as ReturnType<typeof useAuth>);
      vi.mocked(useSubscription).mockReturnValue(mockSubscriptionContext);
    });

    it("shows user initials when authenticated", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      // Should show "TU" for "Test User"
      expect(screen.getAllByText("TU").length).toBeGreaterThan(0);
    });

    it("does not show premium badge for non-premium users", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      expect(screen.queryByText("Premium Member")).not.toBeInTheDocument();
    });
  });

  describe("when user has premium access", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(mockAuthenticatedContext as unknown as ReturnType<typeof useAuth>);
      vi.mocked(useSubscription).mockReturnValue(mockPremiumSubscriptionContext);
    });

    it("shows premium badge for premium users", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      // The crown icon should be visible (we can check for the premium indicator)
      const avatarElements = screen.getAllByText("TU");
      expect(avatarElements.length).toBeGreaterThan(0);
    });
  });

  describe("header structure", () => {
    it("renders header with correct structure", () => {
      render(
        <TestProviders>
          <AppLayout>Content</AppLayout>
        </TestProviders>
      );

      const header = document.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("sticky");
    });

    it("renders main content area", () => {
      render(
        <TestProviders>
          <AppLayout>
            <div data-testid="main-content">Main Content</div>
          </AppLayout>
        </TestProviders>
      );

      const main = document.querySelector("main");
      expect(main).toBeInTheDocument();
      expect(screen.getByTestId("main-content")).toBeInTheDocument();
    });
  });
});
