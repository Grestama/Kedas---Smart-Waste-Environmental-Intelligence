import React from "react";
import { AdminSidebar, AdminHeader } from "@/components/shells/AdminSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]} workspaceName="Admin Operator">
      <div className="min-h-screen flex bg-canvas">
        {/* Desktop Admin Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar />
        </div>

        {/* Main Admin Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
