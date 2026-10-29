import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ApiError } from "../lib/api-client";
import { AuthProvider, useAuth } from "../context/auth-context";
import { AuthGuard } from "../components/auth/AuthGuard";

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/app/setoran",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ApiError Unit Tests", () => {
  it("properly constructs an ApiError with status and code", () => {
    const error = new ApiError(401, "Kredensial tidak valid", "INVALID_CREDENTIALS");
    expect(error.status).toBe(401);
    expect(error.message).toBe("Kredensial tidak valid");
    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(error.name).toBe("ApiError");
  });

  it("handles 422 validation errors", () => {
    const error = new ApiError(422, "password: minimal 8 karakter", "VALIDATION_ERROR", {
      detail: [{ loc: ["body", "password"], msg: "minimal 8 karakter" }],
    });
    expect(error.status).toBe(422);
    expect(error.message).toContain("minimal 8 karakter");
  });
});

describe("AuthContext & AuthGuard Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("initializes with unauthenticated status when no token in localStorage", async () => {
    function TestConsumer() {
      const { status, isAuthenticated, user } = useAuth();
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="auth">{String(isAuthenticated)}</span>
          <span data-testid="user">{user ? user.full_name : "none"}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId("status")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("allows mock login and sets active role and user state", async () => {
    function TestConsumer() {
      const { user, activeRole, hasRole, loginAsMockRole, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="auth">{String(isAuthenticated)}</span>
          <span data-testid="user">{user?.full_name}</span>
          <span data-testid="role">{activeRole}</span>
          <span data-testid="is-user">{String(hasRole("USER"))}</span>
          <span data-testid="is-admin">{String(hasRole("ADMIN"))}</span>
          <button onClick={() => loginAsMockRole("collector")}>Login Collector</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const btn = await screen.findByRole("button", { name: "Login Collector" });
    act(() => {
      btn.click();
    });

    expect(await screen.findByTestId("auth")).toHaveTextContent("true");
    expect(screen.getByTestId("role")).toHaveTextContent("COLLECTOR");
    expect(screen.getByTestId("is-user")).toHaveTextContent("false");
    expect(screen.getByTestId("is-admin")).toHaveTextContent("false");
  });

  it("clears user and token when logout is triggered", async () => {
    let logoutFn: (() => Promise<void>) | undefined;
    function TestConsumer() {
      const { loginAsMockRole, logout, isAuthenticated } = useAuth();
      logoutFn = logout;
      return (
        <div>
          <span data-testid="auth">{String(isAuthenticated)}</span>
          <button onClick={() => loginAsMockRole("user")}>Login</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "Login" }).click();
    });
    expect(await screen.findByTestId("auth")).toHaveTextContent("true");

    await act(async () => {
      if (logoutFn) await logoutFn();
    });
    expect(await screen.findByTestId("auth")).toHaveTextContent("false");
    expect(mockPush).toHaveBeenCalledWith("/masuk");
  });

  it("AuthGuard redirects unauthenticated user to /masuk", async () => {
    render(
      <AuthProvider>
        <AuthGuard workspaceName="Warga">
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    expect(await screen.findByText(/autentikasi diperlukan/i)).toBeDefined();
    expect(mockPush).toHaveBeenCalledWith("/masuk?redirect=%2Fapp%2Fsetoran");
  });

  it("AuthGuard renders 403 Forbidden when user does not have required role", async () => {
    function TestApp() {
      const { loginAsMockRole } = useAuth();
      return (
        <div>
          <button onClick={() => loginAsMockRole("user")}>Login As Warga</button>
          <AuthGuard allowedRoles={["ADMIN"]} workspaceName="Admin Banjar">
            <div>Admin Secret Console</div>
          </AuthGuard>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestApp />
      </AuthProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "Login As Warga" }).click();
    });

    expect(await screen.findByText(/akses ditolak \(403 forbidden\)/i)).toBeDefined();
    expect(screen.queryByText("Admin Secret Console")).toBeNull();
  });

  it("AuthGuard renders children when user role matches", async () => {
    function TestApp() {
      const { loginAsMockRole } = useAuth();
      return (
        <div>
          <button onClick={() => loginAsMockRole("collector")}>Login As Collector</button>
          <AuthGuard allowedRoles={["COLLECTOR", "ADMIN"]} workspaceName="Petugas POS">
            <div>Meja Kerja POS Lapangan</div>
          </AuthGuard>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestApp />
      </AuthProvider>
    );

    act(() => {
      screen.getByRole("button", { name: "Login As Collector" }).click();
    });

    expect(await screen.findByText("Meja Kerja POS Lapangan")).toBeDefined();
  });
});
