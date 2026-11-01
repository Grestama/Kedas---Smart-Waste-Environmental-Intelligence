import React from "react";
import { PublicHeader, PublicFooter } from "@/components/shells/PublicHeader";
import { EcoGuideWidget } from "@/components/ai/EcoGuideWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      {/* Global AI Chatbot Widget across entire Public Web */}
      <EcoGuideWidget
        destinationName="Kawasan Destinasi & Desa Adat Bali"
      />
    </div>
  );
}
