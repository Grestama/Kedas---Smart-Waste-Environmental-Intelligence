import { apiClient } from "../lib/api-client";
import { CitationItem } from "../components/ai/AICitationCard";
import { MaterialSuggestion } from "../components/ai/AISuggestionReview";
import { OperationRecommendation } from "../components/ai/OperationRecommendationCard";

export interface EcoGuideQueryPayload {
  question: string;
  destination_id?: string;
  user_language?: "id" | "en";
  session_id?: string;
}

export interface EcoGuideResponseData {
  answer: string;
  status: "SUCCESS" | "INSUFFICIENT_CONTEXT" | "CONFLICTING_SOURCES" | "BLOCKED_BY_SAFETY_FILTER" | "DEGRADED_FALLBACK";
  destination_name?: string;
  cdoa_version?: string;
  citations: CitationItem[];
  abstain_reason?: string;
  suggested_action?: string;
  contact_channel?: string;
  confidence_level: "HIGH" | "MEDIUM" | "LOW";
  provider: string;
  fallback_used: boolean;
  detected_intent?: string;
  language_used?: string;
  log_id?: string;
  disclaimer: string;
}

export interface VisionAnalyzeResponseData {
  candidates: MaterialSuggestion[];
  top_candidate: MaterialSuggestion;
  detected_material_description: string;
  ambiguity_flag: boolean;
  human_review_required: boolean;
  provider: string;
  fallback_used: boolean;
  disclaimer: string;
}

export interface CopilotQueryPayload {
  intent: "PRIORITIZE_TASKS" | "FIND_ELIGIBLE_FACILITY" | "ANOMALY_SUMMARY" | "METRIC_NARRATIVE";
  destination_id?: string;
  category_id?: string;
  estimated_weight_kg?: number;
  query_text?: string;
}

export interface CopilotResponseData {
  summary: string;
  recommendations: OperationRecommendation[];
  data_snapshot?: Record<string, number | string>;
  provenance: "VERIFIED" | "ESTIMATED" | "SIMULATED";
  provider: string;
  fallback_used: boolean;
  disclaimer: string;
}

export interface ActionProposalPayload {
  action_type: "ADJUST_SERVICE_SLOT" | "CREATE_STAFF_TASK" | "PROPOSE_ALTERNATE_FACILITY" | string;
  title: string;
  description: string;
  target_id?: string | null;
  service_area_id?: string | null;
  parameters: Record<string, any>;
}

export interface ActionProposalExecuteRequest {
  proposal: ActionProposalPayload;
  user_notes?: string;
}

export interface ActionProposalExecuteResponse {
  success: boolean;
  action_type: string;
  audit_id: string;
  message: string;
  target_id?: string | null;
  before_state: Record<string, any>;
  after_state: Record<string, any>;
  executed_at: string;
}

export interface AIHealthData {
  provider_name: string;
  is_active: boolean;
  status: "OPERATIONAL" | "DEGRADED" | "OFFLINE";
  fallback_available: boolean;
  total_requests_logged: number;
  fallback_count: number;
  average_latency_ms: number;
}

export type KnowledgeSourceType = "REGULATION" | "SOP" | "CDOA" | "EDUCATIONAL";
export type KnowledgeDocumentStatus = "DRAFT" | "PUBLISHED" | "RETIRED";

export interface KnowledgeDocument {
  id: string;
  title: string;
  source_type: KnowledgeSourceType;
  destination_id?: string | null;
  organization_id?: string | null;
  cdoa_id?: string | null;
  is_public: boolean;
  version: string;
  status: KnowledgeDocumentStatus;
  checksum: string;
  total_chunks: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  section_title?: string | null;
  content: string;
  token_count: number;
}

export interface KnowledgeDocumentDetail extends KnowledgeDocument {
  chunks: KnowledgeChunk[];
}

export interface KnowledgeDocumentCreate {
  title: string;
  source_type: KnowledgeSourceType;
  destination_id?: string;
  organization_id?: string;
  cdoa_id?: string;
  is_public?: boolean;
  version?: string;
  content_raw: string;
}

export const aiService = {
  async askEcoGuide(payload: EcoGuideQueryPayload): Promise<EcoGuideResponseData> {
    return apiClient.post<EcoGuideResponseData>("/api/v1/ai/ecoguide", payload);
  },

  async analyzeVision(formData: FormData): Promise<VisionAnalyzeResponseData> {
    return apiClient.post<VisionAnalyzeResponseData>("/api/v1/ai/vision/analyze", formData);
  },

  async queryCopilot(payload: CopilotQueryPayload): Promise<CopilotResponseData> {
    return apiClient.post<CopilotResponseData>("/api/v1/ai/copilot", payload);
  },

  async getHealth(): Promise<AIHealthData> {
    return apiClient.get<AIHealthData>("/api/v1/ai/health");
  },

  async listKnowledge(params?: {
    destination_id?: string;
    source_type?: string;
    status?: string;
  }): Promise<KnowledgeDocument[]> {
    const query = new URLSearchParams();
    if (params?.destination_id) query.set("destination_id", params.destination_id);
    if (params?.source_type) query.set("source_type", params.source_type);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return apiClient.get<KnowledgeDocument[]>(`/ai/knowledge${qs ? `?${qs}` : ""}`);
  },

  async getKnowledgeDetail(id: string): Promise<KnowledgeDocumentDetail> {
    return apiClient.get<KnowledgeDocumentDetail>(`/ai/knowledge/${id}`);
  },

  async createKnowledgeDocument(payload: KnowledgeDocumentCreate): Promise<KnowledgeDocument> {
    return apiClient.post<KnowledgeDocument>("/ai/knowledge", payload);
  },

  async updateKnowledgeStatus(
    id: string,
    status: KnowledgeDocumentStatus
  ): Promise<KnowledgeDocument> {
    return apiClient.patch<KnowledgeDocument>(`/ai/knowledge/${id}/status`, { status });
  },

  async deleteKnowledgeDocument(id: string): Promise<void> {
    return apiClient.delete<void>(`/ai/knowledge/${id}`);
  },

  async submitFeedback(
    logId: string,
    rating: "THUMBS_UP" | "THUMBS_DOWN",
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>("/ai/feedback", {
      log_id: logId,
      rating,
      comment,
    });
  },

  async executeProposal(
    payload: ActionProposalExecuteRequest
  ): Promise<ActionProposalExecuteResponse> {
    return apiClient.post<ActionProposalExecuteResponse>("/ai/copilot/execute", payload);
  },
};
