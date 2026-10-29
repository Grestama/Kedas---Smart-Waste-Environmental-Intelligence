import { apiClient, ApiError } from "@/lib/api-client";
import {
  WasteCategory,
  ServiceArea,
  CollectionSlot,
  PickupRequest,
  CreatePickupPayload,
  CancelPickupPayload,
} from "@/types/collection";
import { Address } from "@/types/auth";
import { mockCategories, mockRequests } from "@/mocks/previewData";

// Initial mock fallback state
const defaultMockCategories: WasteCategory[] = [
  {
    id: "cat_organik",
    code: "ORGANIC_FOOD",
    name: "Organik (Kompos Banjar)",
    category_type: "ORGANIC",
    description: "Sisa makanan, dedaunan, kulit buah yang tidak berminyak atau berplastik",
    preparation_guide: "Tiriskan kuah dan minyak sebelum dimasukkan ke wadah kompos.",
    safety_notes: "Jangan mencampur bangkai hewan atau kotoran hewan peliharaan.",
    is_active: true,
    display_order: 1,
    pointRate: 10,
  },
  {
    id: "cat_anorganik_pet",
    code: "RECYCLABLE_PET",
    name: "Plastik PET Bening Bersih",
    category_type: "RECYCLABLE",
    description: "Botol air mineral, botol minuman bening tanpa tutup dan label",
    preparation_guide: "Bilas dengan air bersih, remas/pipihkan untuk menghemat ruang.",
    safety_notes: "Pastikan bebas dari sisa pestisida atau cairan kimia berbahaya.",
    is_active: true,
    display_order: 2,
    pointRate: 30,
  },
  {
    id: "cat_anorganik_kardus",
    code: "RECYCLABLE_PAPER",
    name: "Kardus & Kertas Duplex",
    category_type: "RECYCLABLE",
    description: "Kardus tebal, duplex, kertas HVS kering dan diikat rapi",
    preparation_guide: "Lipat rapi dan ikat dengan tali rami atau rafia.",
    safety_notes: "Kertas tidak boleh basah, berjamur, atau terkena tumpahan minyak.",
    is_active: true,
    display_order: 3,
    pointRate: 20,
  },
  {
    id: "cat_anorganik_kaca",
    code: "RECYCLABLE_GLASS",
    name: "Kaca & Botol Beling",
    category_type: "RECYCLABLE",
    description: "Botol sirup, botol kecap, toples beling tanpa retak berbahaya",
    preparation_guide: "Bilas bersih dan masukkan dalam kotak kardus bertutup.",
    safety_notes: "Beri tanda 'Pecah Belah' agar petugas dapat menangani dengan hati-hati.",
    is_active: true,
    display_order: 4,
    pointRate: 15,
  },
  {
    id: "cat_b3_khusus",
    code: "SPECIAL_HAZARDOUS",
    name: "B3 & Residu Berbahaya (Safety Gating)",
    category_type: "SPECIAL",
    description: "Baterai, lampu neon, kemasan pestisida, limbah medis rumah tangga",
    preparation_guide: "Dilarang disetor mandiri via penjemputan reguler warga.",
    safety_notes: "Wajib diserahkan ke pos TPS3R khusus pada jadwal pengolahan B3 desa.",
    is_active: true,
    display_order: 5,
    pointRate: 0,
  },
];

const defaultMockServiceAreas: ServiceArea[] = [
  {
    id: "area_sukawati_kaja",
    code: "BALI_GIANYAR_SUKAWATI_KAJA",
    name: "Banjar Kaja, Desa Sukawati",
    administrative_area: "Desa Sukawati, Gianyar",
    is_active: true,
  },
  {
    id: "area_sukawati_tengah",
    code: "BALI_GIANYAR_SUKAWATI_TENGAH",
    name: "Banjar Tengah, Desa Sukawati",
    administrative_area: "Desa Sukawati, Gianyar",
    is_active: true,
  },
];

export const collectionService = {
  /**
   * Mengambil kategori sampah aktif
   */
  async getCategories(): Promise<WasteCategory[]> {
    try {
      const data = await apiClient.get<WasteCategory[]>("/waste-categories?active_only=true");
      if (data && data.length > 0) return data;
      return defaultMockCategories;
    } catch {
      return defaultMockCategories;
    }
  },

  /**
   * Mengambil area layanan aktif
   */
  async getServiceAreas(): Promise<ServiceArea[]> {
    try {
      const data = await apiClient.get<ServiceArea[]>("/service-areas?active_only=true");
      if (data && data.length > 0) return data;
      return defaultMockServiceAreas;
    } catch {
      return defaultMockServiceAreas;
    }
  },

  /**
   * Mengambil slot jadwal penjemputan untuk suatu area
   */
  async getAreaSlots(areaId: string): Promise<CollectionSlot[]> {
    try {
      const data = await apiClient.get<CollectionSlot[]>(
        `/service-areas/${areaId}/slots?available_only=true`
      );
      if (data && data.length > 0) return data;
      throw new Error("No live slots");
    } catch {
      // Mock generated slots with remaining capacity
      const now = new Date();
      const slots: CollectionSlot[] = [];

      for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const slotDate = new Date(now);
        slotDate.setDate(now.getDate() + dayOffset);
        slotDate.setHours(8, 30, 0, 0);

        const endSlotDate = new Date(slotDate);
        endSlotDate.setHours(10, 30, 0, 0);

        slots.push({
          id: `slot_${areaId}_${dayOffset}`,
          service_area_id: areaId,
          start_time: slotDate.toISOString(),
          end_time: endSlotDate.toISOString(),
          max_capacity: 10,
          booked_capacity: dayOffset === 1 ? 9 : 3, // slot 1 almost full, slot 2 has 7 left
          remaining_capacity: dayOffset === 1 ? 1 : 7,
          is_active: true,
        });
      }
      return slots;
    }
  },

  /**
   * Mengambil daftar alamat pengguna
   */
  async getMyAddresses(): Promise<Address[]> {
    try {
      const data = await apiClient.get<Address[]>("/me/addresses");
      if (data && data.length > 0) return data;
      throw new Error("No addresses");
    } catch {
      return [
        {
          id: "addr_default_01",
          user_id: "usr_warga_01",
          label: "Rumah Utama",
          address_text: "Banjar Kaja, Jl. Kenanga No. 14, Desa Sukawati, Gianyar",
          service_area_id: "area_sukawati_kaja",
          notes: "Pagar samping bale dangin",
          is_default: true,
          created_at: new Date().toISOString(),
        },
      ];
    }
  },

  /**
   * Membuat permohonan setoran sampah baru
   */
  async createPickupRequest(payload: CreatePickupPayload): Promise<PickupRequest> {
    // Safety Gating: Check category type
    const categories = await this.getCategories();
    const selectedCat = categories.find((c) => c.id === payload.category_id);

    if (selectedCat && selectedCat.category_type === "SPECIAL") {
      throw new ApiError(
        422,
        "Safety Gating: Kategori sampah B3 / Residu Khusus dilarang disetor mandiri. Harap hubungi pos TPS3R banjar untuk penanganan khusus.",
        "SPECIAL_CATEGORY_BLOCKED"
      );
    }

    try {
      const res = await apiClient.post<PickupRequest>("/pickup-requests", payload);
      return res;
    } catch (err) {
      if (err instanceof ApiError && err.code === "SPECIAL_CATEGORY_BLOCKED") {
        throw err;
      }
      // If offline/preview mode, create simulated request
      const newMockRequest: PickupRequest = {
        id: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        public_code: `WL-${Math.floor(100000 + Math.random() * 900000)}`,
        reporter_user_id: "usr_current",
        service_area_id: "area_sukawati_kaja",
        category_id: payload.category_id,
        address_id: payload.address_id,
        slot_id: payload.slot_id,
        status: "PENDING_ASSIGNMENT",
        assigned_collector_id: null,
        estimated_weight_kg: payload.estimated_weight_kg || 3.0,
        notes: payload.notes || null,
        created_at: new Date().toISOString(),
        category: selectedCat,
      };

      return newMockRequest;
    }
  },

  /**
   * Mengambil daftar setoran milik pengguna
   */
  async getMyPickupRequests(statusFilter?: string): Promise<PickupRequest[]> {
    try {
      const endpoint = statusFilter && statusFilter !== "all"
        ? `/pickup-requests/mine?status=${statusFilter}`
        : "/pickup-requests/mine";
      const data = await apiClient.get<PickupRequest[]>(endpoint);
      if (data && data.length > 0) return data;
      throw new Error("No live requests");
    } catch {
      // Map mock data into PickupRequest shape
      return mockRequests.map((r) => {
        let mappedStatus: string = "PENDING_ASSIGNMENT";
        if (r.status === "selesai") mappedStatus = "COMPLETED";
        else if (r.status === "dijemput") mappedStatus = "EN_ROUTE";
        else if (r.status === "dibatalkan") mappedStatus = "CANCELLED";

        return {
          id: r.id,
          public_code: `WL-${r.id.replace(/\D/g, "")}`,
          reporter_user_id: "usr_warga_01",
          service_area_id: "area_sukawati_kaja",
          category_id: "cat_anorganik_pet",
          address_id: "addr_default_01",
          slot_id: "slot_01",
          status: mappedStatus as any,
          assigned_collector_id: mappedStatus === "EN_ROUTE" ? "col_01" : null,
          estimated_weight_kg: r.estimated_weight,
          notes: null,
          created_at: r.created_at,
          actual_weight_kg: r.actual_weight,
          points_earned: r.points_earned,
          category: {
            id: "cat_anorganik_pet",
            code: "RECYCLABLE_PET",
            name: r.category_name,
            category_type: "RECYCLABLE",
            description: null,
            preparation_guide: null,
            safety_notes: null,
            is_active: true,
            display_order: 1,
          },
        };
      });
    }
  },

  /**
   * Mengambil detail setoran beserta status events
   */
  async getPickupRequestDetail(id: string): Promise<PickupRequest> {
    try {
      const data = await apiClient.get<PickupRequest>(`/pickup-requests/${id}`);
      if (data) return data;
      throw new Error("No live detail");
    } catch {
      const list = await this.getMyPickupRequests();
      const found = list.find((item) => item.id === id) || list[0];

      // Add realistic events if missing
      if (!found.events || found.events.length === 0) {
        found.events = [
          {
            id: `evt_1`,
            from_status: "DRAFT",
            to_status: "PENDING_ASSIGNMENT",
            actor_user_id: "usr_warga_01",
            reason: "Permohonan diajukan oleh warga",
            created_at: found.created_at,
          },
        ];

        if (found.status === "EN_ROUTE" || found.status === "COMPLETED") {
          found.events.push({
            id: `evt_2`,
            from_status: "PENDING_ASSIGNMENT",
            to_status: "ACCEPTED",
            actor_user_id: "col_made_01",
            reason: "Tugas diambil oleh kolektor TPS3R",
            created_at: new Date(Date.parse(found.created_at) + 3600000).toISOString(),
          });
          found.events.push({
            id: `evt_3`,
            from_status: "ACCEPTED",
            to_status: "EN_ROUTE",
            actor_user_id: "col_made_01",
            reason: "Kolektor meluncur menuju lokasi",
            created_at: new Date(Date.parse(found.created_at) + 7200000).toISOString(),
          });
        }

        if (found.status === "COMPLETED") {
          found.events.push({
            id: `evt_4`,
            from_status: "EN_ROUTE",
            to_status: "COMPLETED",
            actor_user_id: "col_made_01",
            reason: "Penimbangan diverifikasi (8.2 kg), WastePoints diterbitkan",
            created_at: new Date(Date.parse(found.created_at) + 10800000).toISOString(),
          });
        }
      }

      return found;
    }
  },

  /**
   * Membatalkan permohonan setoran
   */
  async cancelPickupRequest(id: string, reason: string): Promise<PickupRequest> {
    try {
      const res = await apiClient.post<PickupRequest>(`/pickup-requests/${id}/cancel`, {
        reason,
      });
      return res;
    } catch {
      // Mock cancellation
      const detail = await this.getPickupRequestDetail(id);
      detail.status = "CANCELLED";
      if (!detail.events) detail.events = [];
      detail.events.push({
        id: `evt_cancel_${Date.now()}`,
        from_status: detail.status,
        to_status: "CANCELLED",
        actor_user_id: "usr_current",
        reason: reason || "Dibatalkan oleh warga",
        created_at: new Date().toISOString(),
      });
      return detail;
    }
  },

  getSlotsForArea(areaId: string): Promise<CollectionSlot[]> {
    return this.getAreaSlots(areaId);
  },

  getPickupRequestById(id: string): Promise<PickupRequest> {
    return this.getPickupRequestDetail(id);
  },

  async getPointsBalance(): Promise<{ current_balance: number }> {
    try {
      return await apiClient.get<{ current_balance: number }>("/points/balance");
    } catch {
      return { current_balance: 1450 };
    }
  },

  async getPointsLedger(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>("/points/ledger");
    } catch {
      return [
        {
          id: "led_01",
          entry_type: "REWARD",
          points_delta: 410,
          balance_after: 1450,
          reason: "Setoran Plastik PET Bening (8.2 kg)",
          created_at: new Date().toISOString(),
        },
      ];
    }
  },
};

export const fetchCategories = () => collectionService.getCategories();
export const fetchServiceAreas = () => collectionService.getServiceAreas();
export const fetchSlotsForArea = (areaId: string) => collectionService.getAreaSlots(areaId);
export const fetchUserAddresses = () => collectionService.getMyAddresses();
export const createPickupRequest = (payload: any) => collectionService.createPickupRequest(payload);
export const fetchMyPickupRequests = (status?: string) => collectionService.getMyPickupRequests(status);
export const getPickupRequestDetail = (id: string) => collectionService.getPickupRequestDetail(id);
export const cancelPickupRequest = (id: string, reason: string) => collectionService.cancelPickupRequest(id, reason);

