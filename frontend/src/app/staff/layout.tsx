import React from "react";
import { StaffSidebar, StaffHeader } from "@/components/shells/StaffSidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Desktop Staff POS Sidebar */}
      <div className="hidden lg:block shrink-0">
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
  );
}
