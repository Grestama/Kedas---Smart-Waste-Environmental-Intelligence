import React from "react";
import { UserSidebar, UserHeader } from "@/components/shells/UserSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function UserAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["USER", "ADMIN"]} workspaceName="Warga">
      <div className="min-h-[calc(100vh-var(--workspace-bar-height))] flex bg-canvas">
        {/* Desktop Sidebar - Sticky anchored */}
        <div className="hidden lg:block shrink-0 sticky top-[var(--workspace-bar-height)] h-[calc(100vh-var(--workspace-bar-height))] z-20">
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <UserHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
