import { env } from "@/config/env";

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface BackendErrorResponse {
  detail?: string | ApiErrorDetail[] | Record<string, unknown>;
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || env.apiBaseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("wastelink_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = new Headers(options.headers || {});

    // Set JSON content type if payload is provided and not already set
    if (options.body && !(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    // Attach Bearer token if available
    const token = this.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Include HttpOnly cookies (wastelink_session)
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal terhubung ke server backend WasteLink";
      throw new ApiError(0, `Jaringan Error: ${errorMsg}`, "NETWORK_ERROR");
    }

    if (response.status === 204) {
      return null as T;
    }

    let responseData: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorData = responseData as BackendErrorResponse | null;
      let errorMessage = "Terjadi kesalahan pada permintaan server";
      let errorCode = errorData?.code;

      if (errorData?.detail) {
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Pydantic 422 validation errors
          errorMessage = errorData.detail
            .map((d) => (d.msg ? `${d.loc?.slice(-1)[0]}: ${d.msg}` : JSON.stringify(d)))
            .join("; ");
          errorCode = errorCode || "VALIDATION_ERROR";
        } else if (typeof errorData.detail === "object") {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (response.statusText) {
        errorMessage = `${response.status} ${response.statusText}`;
      }

      // Handle 401 Unauthorized: emit session expiry event
      if (response.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("wastelink:unauthorized", {
            detail: { message: errorMessage, endpoint },
          })
        );
      }

      throw new ApiError(response.status, errorMessage, errorCode, errorData);
    }

    return responseData as T;
  }

  public get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
