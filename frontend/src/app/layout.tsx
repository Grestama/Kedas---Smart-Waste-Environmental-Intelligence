import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/auth-context";
import { WorkspaceSwitchBar } from "@/components/shells/WorkspaceSwitchBar";

export const metadata: Metadata = {
  title: "Kedas — Bergerak Bersama untuk Lingkungan yang Lebih Bersih",
  description:
    "Platform digital pengelolaan sampah berbasis komunitas dan ekonomi sirkular di Bali (sebelumnya WasteLink Bali). Menghubungkan warga desa, pos timbang TPS3R, dan mitra daur ulang.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
        <AuthProvider>
          <WorkspaceSwitchBar />
          <ToastProvider>
            <div className="flex-1 flex flex-col">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
