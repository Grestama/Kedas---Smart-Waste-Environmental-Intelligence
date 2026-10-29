/**
 * WasteLink Bali - Pratinjau Data (Mode Pengujian)
 * Data tiruan untuk rendering shell UI sebelum sambungan live backend API.
 * Seluruh data diberi label eksplisit agar mudah diaudit.
 */

export const IS_PREVIEW_MODE = true;
export const PREVIEW_BANNER_TEXT = "Pratinjau Data (Mode Pengujian)";

export const mockUsers = {
  warga: {
    id: "usr_warga_01",
    name: "Wayan Sudarsana",
    email: "wayan.sudarsana@example.com",
    role: "user",
    phone: "081234567890",
    banjar: "Banjar Kaja, Desa Sukawati",
    pointsBalance: 1250,
    totalKgDeposited: 48.5,
  },
  petugas: {
    id: "usr_petugas_01",
    name: "I Made Artawan",
    email: "made.collector@wastelink.bali.id",
    role: "collector",
    assignedBanjar: "Banjar Kaja & Banjar Tengah",
    baseStation: "Pos TPU Sukawati",
    activeShift: "07:00 - 15:00 WITA",
  },
  admin: {
    id: "usr_admin_01",
    name: "Ni Ketut Suarni",
    email: "admin.operasional@wastelink.bali.id",
    role: "admin",
    jurisdiction: "Kecamatan Sukawati, Gianyar",
  },
};

export const mockCategories = [
  {
    id: "cat_organik",
    name: "Organik (Kompos Banjar)",
    code: "ORGANIK",
    description: "Sisa makanan, dedaunan, kulit buah yang tidak berminyak/berplastik",
    pointRate: 10, // poin per kg
    contaminationThreshold: "Maksimal 5%",
  },
  {
    id: "cat_anorganik_pet",
    name: "Plastik PET Bersih",
    code: "PET_CLEAN",
    description: "Botol air mineral, botol minuman bening tanpa tutup dan label",
    pointRate: 30, // poin per kg
    contaminationThreshold: "Kering dan bersih dari minyak",
  },
  {
    id: "cat_anorganik_kardus",
    name: "Kardus & Kertas",
    code: "PAPER_BOX",
    description: "Kardus tebal, duplex, kertas HVS kering dan diikat rapi",
    pointRate: 20, // poin per kg
    contaminationThreshold: "Kering dan tidak berjamur",
  },
  {
    id: "cat_anorganik_kaca",
    name: "Kaca & Botol Beling",
    code: "GLASS",
    description: "Botol sirup, botol saus, toples beling tanpa retak",
    pointRate: 15,
    contaminationThreshold: "Dibilas bersih",
  },
];

export const mockRequests = [
  {
    id: "REQ-2026-0012",
    user_name: "Wayan Sudarsana",
    category_name: "Plastik PET Bersih",
    pickup_type: "pickup",
    address: "Banjar Kaja, Jl. Kenanga No. 14, Sukawati",
    scheduled_at: "2026-10-30T09:00:00+08:00",
    status: "diajukan",
    estimated_weight: 4.5,
    actual_weight: null,
    points_earned: null,
    created_at: "2026-10-29T14:30:00+08:00",
  },
  {
    id: "REQ-2026-0009",
    user_name: "Wayan Sudarsana",
    category_name: "Organik (Kompos Banjar)",
    pickup_type: "dropoff",
    address: "Pos Pengolahan Organik Banjar Kaja",
    scheduled_at: "2026-10-28T08:00:00+08:00",
    status: "selesai",
    estimated_weight: 8.0,
    actual_weight: 8.2,
    points_earned: 82,
    created_at: "2026-10-27T16:00:00+08:00",
  },
  {
    id: "REQ-2026-0006",
    user_name: "Ni Putu Lestari",
    category_name: "Kardus & Kertas",
    pickup_type: "pickup",
    address: "Banjar Tengah, Jl. Melati Gang 2",
    scheduled_at: "2026-10-29T11:00:00+08:00",
    status: "dijemput",
    estimated_weight: 12.0,
    actual_weight: null,
    points_earned: null,
    created_at: "2026-10-28T19:00:00+08:00",
  },
  {
    id: "REQ-2026-0004",
    user_name: "Ketut Wijaya",
    category_name: "Plastik Campur",
    pickup_type: "pickup",
    address: "Banjar Kaja No. 3",
    scheduled_at: "2026-10-26T10:00:00+08:00",
    status: "dibatalkan",
    estimated_weight: 3.0,
    actual_weight: null,
    points_earned: 0,
    created_at: "2026-10-25T11:00:00+08:00",
  },
];

export const mockStaffTasks = [
  {
    id: "TSK-084",
    requestId: "REQ-2026-0012",
    citizenName: "Wayan Sudarsana",
    phone: "081234567890",
    address: "Banjar Kaja, Jl. Kenanga No. 14, Sukawati",
    category: "Plastik PET Bersih",
    estimatedWeight: "4.5 kg",
    scheduledSlot: "30 Okt 2026, 09:00 - 10:30 WITA",
    status: "tersedia",
    notes: "Tolong jemput di pagar depan dekat bale dangin",
  },
  {
    id: "TSK-083",
    requestId: "REQ-2026-0006",
    citizenName: "Ni Putu Lestari",
    phone: "081987654321",
    address: "Banjar Tengah, Jl. Melati Gang 2",
    category: "Kardus & Kertas",
    estimatedWeight: "12.0 kg",
    scheduledSlot: "29 Okt 2026, 11:00 - 12:00 WITA",
    status: "dalam_tugas",
    notes: "Sudah diikat 3 bundel rapat",
  },
];

export const mockAdminStats = {
  activeRequestsToday: 18,
  totalWeightThisMonthKg: 1420.5,
  activeCollectors: 6,
  verifiedBatches: 24,
  divertedFromLandfillPct: "78.4%",
};
