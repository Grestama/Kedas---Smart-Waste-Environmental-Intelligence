import React from "react";
import { StaffSidebar, StaffHeader } from "@/components/shells/StaffSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["COLLECTOR", "ADMIN"]} workspaceName="Petugas POS">
      <div className="min-h-[calc(100vh-var(--workspace-bar-height))] flex bg-canvas">
        {/* Desktop Staff POS Sidebar - Sticky anchored so it never scrolls off or gets clipped */}
        <div className="hidden lg:block shrink-0 sticky top-[var(--workspace-bar-height)] h-[calc(100vh-var(--workspace-bar-height))] z-20">
          <StaffSidebar />
        </div>

        {/* Main POS Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <StaffHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
