# KEDAS — ROUTE & COMPONENT INVENTORY

**Authority:** `docs/design/design_web.md`  
**Generated:** Stage 1 Baseline Audit (30 October 2026)  

---

## 1. Web Route Inventory (44 Routes)

### A. Public Routes (No Authentication Required)
| Path | Page Component | Target Audience | Data Dependencies | Status / Notes |
|---|---|---|---|---|
| `/` | `src/app/(public)/page.tsx` | All visitors, residents, partners | API Categories, Metrics (honest/demo labeled) | Needs visual redesign to editorial photo-led format |
| `/area-layanan` | `src/app/(public)/area-layanan/page.tsx` | General public, community | `/api/v1/service-areas`, slots | Fully functional, verified against API |
| `/daftar` | `src/app/(public)/daftar/page.tsx` | New users | `/api/v1/auth/register` | Multi-role registration flow |
| `/masuk` | `src/app/(public)/masuk/page.tsx` | Returning users | `/api/v1/auth/login` | Secure Argon2id session auth |
| `/lupa-password` | `src/app/(public)/lupa-password/page.tsx` | Account recovery | Static / Help support | Password reset request |
| `/panduan` | `src/app/(public)/panduan/page.tsx` | Residents / Visitors | `/api/v1/waste-categories` | Waste sorting guidelines |
| `/faq` | `src/app/(public)/faq/page.tsx` | General public | Static / Accordion | FAQ and help |
| `/guest` | `src/app/(public)/guest/page.tsx` | Tourists, short-term visitors | `/api/v1/ai/ecoguide`, categories | No-login Guest Green Companion |

### B. Resident Workspace (`/app`)
| Path | Page Component | Target Role | Key Capabilities |
|---|---|---|---|
| `/app` | `src/app/app/page.tsx` | RESIDENT (`USER`) | Request overview, next slot, points, recent activity |
| `/app/setoran` | `src/app/app/setoran/page.tsx` | RESIDENT | Deposit/pickup request history & filters |
| `/app/setoran/baru` | `src/app/app/setoran/baru/page.tsx` | RESIDENT | New pickup request with category selection & slots |
| `/app/setoran/[id]` | `src/app/app/setoran/[id]/page.tsx` | RESIDENT | Waste Passport detail, timeline, verification proof |
| `/app/waste-points` | `src/app/app/waste-points/page.tsx` | RESIDENT | Points balance & ledger history |
| `/app/dampak` | `src/app/app/dampak/page.tsx` | RESIDENT | Personal diversion metrics & verified impact |
| `/app/panduan` | `src/app/app/panduan/page.tsx` | RESIDENT | Contextual sorting rules & safety notes |
| `/app/profil` | `src/app/app/profil/page.tsx` | RESIDENT | Profile, address & phone management |
| `/app/bantuan` | `src/app/app/bantuan/page.tsx` | RESIDENT | Contact support / TPS3R coordinator |
| `/app/notifikasi` | `src/app/app/notifikasi/page.tsx` | RESIDENT | Transactional status updates |

### C. Field Staff / POS Workspace (`/staff`)
| Path | Page Component | Target Role | Key Capabilities |
|---|---|---|---|
| `/staff` | `src/app/staff/page.tsx` | COLLECTOR | Today's tasks, assigned pickups, quick weighing |
| `/staff/tugas/tersedia` | `src/app/staff/tugas/tersedia/page.tsx` | COLLECTOR | Unclaimed pickup requests pool |
| `/staff/tugas/saya` | `src/app/staff/tugas/saya/page.tsx` | COLLECTOR | Active claimed tasks & route |
| `/staff/tugas/[id]` | `src/app/staff/tugas/[id]/page.tsx` | COLLECTOR | Step-by-step weighing, inspection checklist, photo evidence |
| `/staff/riwayat` | `src/app/staff/riwayat/page.tsx` | COLLECTOR | Completed tasks log |
| `/staff/panduan-keselamatan` | `src/app/staff/panduan-keselamatan/page.tsx` | COLLECTOR | PPE & hazardous material handling SOP |
| `/staff/profil` | `src/app/staff/profil/page.tsx` | COLLECTOR | Collector credentials & assigned vehicle |

### D. Admin Console (`/admin`)
| Path | Page Component | Target Role | Key Capabilities |
|---|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | ADMIN | Operational overview, anomaly alerts, Copilot cards |
| `/admin/permintaan` | `src/app/admin/permintaan/page.tsx` | ADMIN | All pickup requests, manual assignment override |
| `/admin/pengajuan-petugas` | `src/app/admin/pengajuan-petugas/page.tsx` | ADMIN | Collector applications review & approval |
| `/admin/kategori` | `src/app/admin/kategori/page.tsx` | ADMIN | Waste taxonomy & acceptance rules editor |
| `/admin/area-jadwal` | `src/app/admin/area-jadwal/page.tsx` | ADMIN | Service areas & collection slots quota |
| `/admin/pengetahuan` | `src/app/admin/pengetahuan/page.tsx` | ADMIN | AI Knowledge Base ingest, publish, & versioning |
| `/admin/laporan` | `src/app/admin/laporan/page.tsx` | ADMIN | DCLI analytics & destination reports |
| `/admin/pengguna` | `src/app/admin/pengguna/page.tsx` | ADMIN | User management & role assignment |
| `/admin/mitra` | `src/app/admin/mitra/page.tsx` | ADMIN | B2B recycling partners & facilities |
| `/admin/pendanaan` | `src/app/admin/pendanaan/page.tsx` | ADMIN | Community funding pool |
| `/admin/waste-points/rules` | `src/app/admin/waste-points/rules/page.tsx` | ADMIN | Points multiplier & reward catalog rules |
| `/admin/audit-log` | `src/app/admin/audit-log/page.tsx` | ADMIN | Tamper-evident system activity log |

### E. Hospitality & Green Tourism (`/hospitality`)
| Path | Page Component | Target Role | Key Capabilities |
|---|---|---|---|
| `/hospitality` | `src/app/hospitality/page.tsx` | B2B_PARTNER / ADMIN | Hotel/villa waste summary & daily intake |
| `/hospitality/setoran` | `src/app/hospitality/setoran/page.tsx` | B2B_PARTNER | Bulk commercial waste scheduling |
| `/hospitality/lapor` | `src/app/hospitality/lapor/page.tsx` | B2B_PARTNER | Self-managed organic composting logging |
| `/hospitality/esg` | `src/app/hospitality/esg/page.tsx` | B2B_PARTNER | Green Hospitality Ledger & verification certificate |
| `/hospitality/guest-companion` | `src/app/hospitality/guest-companion/page.tsx` | B2B / Public | In-room QR code destination guide |

### F. Legacy / Demo Routes
| Path | Page Component | Notes |
|---|---|---|
| `/mobile` | `src/app/mobile/page.tsx` | Mobile Phone Frame preview. Preserved as demo sandbox. |

---

## 2. Component Inventory & Reuse Map

### A. Navigation & Layout Shells
- `PublicHeader.tsx`: Needs 2-tier structure (utility evergreen bar + white main nav).
- `WorkspaceSwitchBar.tsx`: Switcher for rapid demo preview between roles.
- `UserSidebar.tsx`, `StaffSidebar.tsx`, `AdminSidebar.tsx`: Persistent workspace navigations.
- `PageHeader.tsx`: Breadcrumb, title, and action bar.

### B. Primitives & Forms
- `Button.tsx`: Primary, secondary, soft, outline, danger variants.
- `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`: Form fields.
- `DataTable.tsx`: Paginated, responsive data list.
- `StatusBadge.tsx`: Strict mapping to domain states (`SUBMITTED`, `PENDING_ASSIGNMENT`, `ACCEPTED`, `EN_ROUTE`, `INSPECTION`, `WEIGHED`, `COLLECTED`, `COMPLETED`, `CANCELLED`, `REJECTED`).
- `Modal.tsx`: Accessible dialog with focus trap.
- `Toast.tsx`: Transient user notifications.
- `LoadingSkeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`: Operational states.

### C. AI Experience Components
- `EcoGuideWidget.tsx`: Grounded Q&A assistant with citation pills.
- `AICitationCard.tsx`: Granular provenance cards with document title and excerpt.
- `VisionUploadModal.tsx`: Waste categorization image classifier with confidence notice and human confirmation step.
- `ActionProposalModal.tsx`: Operations Copilot action proposal review modal.
- `OperationRecommendationCard.tsx`: Operational insights card with severity badge.
- `AIConfidenceIndicator.tsx`: Calibrated score presentation.
