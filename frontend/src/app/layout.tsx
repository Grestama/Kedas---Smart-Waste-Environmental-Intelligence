import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { WorkspaceSwitchBar } from "@/components/shells/WorkspaceSwitchBar";

export const metadata: Metadata = {
  title: "WasteLink Bali — Pengelolaan Sampah Komunitas & Ekonomi Sirkular Desa",
  description:
    "Platform pengelolaan sampah berbasis banjar di Bali. Menghubungkan warga desa, petugas TPS3R, dan mitra daur ulang dengan sistem WastePoints.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
        <WorkspaceSwitchBar />
        <ToastProvider>
          <div className="flex-1 flex flex-col">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
