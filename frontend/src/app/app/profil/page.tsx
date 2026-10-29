"use client";

import React, { useState } from "react";
import { User, MapPin, Phone, Mail, ShieldCheck, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { mockUsers } from "@/mocks/previewData";

export default function UserProfilePage() {
  const toast = useToast();
  const user = mockUsers.warga;

  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(
    "Banjar Kaja, Jl. Kenanga No. 14, Desa Sukawati, Gianyar, Bali"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Profil Disimpan (Pratinjau)",
        "Perubahan informasi profil dan alamat penjemputan berhasil diperbarui."
      );
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Profil & Pengaturan Akun Warga"
        description="Kelola informasi pribadi dan alamat penjemputan resmi sampah banjar."
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Profil Warga" },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Panel title="Identitas Krama Banjar">
          <div className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Alamat Email (Akun)"
                value={email}
                disabled
                helperText="Email digunakan sebagai identitas akun utama"
              />
              <Input
                label="Nomor WhatsApp / HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Wilayah Banjar & Alamat Tetap"
          subtitle="Petugas TPS3R menggunakan alamat ini untuk rute penjemputan berkala."
        >
          <div className="space-y-4">
            <Input
              label="Banjar Terdaftar"
              value={user.banjar}
              disabled
              helperText="Perubahan wilayah banjar membutuhkan persetujuan prajuru/admin."
            />
            <Input
              label="Alamat Lengkap / Patokan Rumah"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        </Panel>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
