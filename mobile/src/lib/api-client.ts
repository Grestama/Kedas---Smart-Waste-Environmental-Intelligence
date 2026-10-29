/**
 * WasteLink Bali Mobile — API Client
 */

export class MobileApiError extends Error {
  public status: number;
  public code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "MobileApiError";
    this.status = status;
    this.code = code;
  }
}

export class MobileApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  public checkIsOnline(): boolean {
    return this.isOnline;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.isOnline) {
      throw new MobileApiError(
        0,
        "Perangkat sedang luring (offline). Permohonan dapat disimpan sebagai draf lokal.",
        "NETWORK_OFFLINE"
      );
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      if (!response.ok) {
        let msg = "Terjadi kesalahan server";
        if (data && typeof data === "object") {
          msg = data.message || data.detail || JSON.stringify(data);
        }
        throw new MobileApiError(response.status, msg, data?.code);
      }

      return data as T;
    } catch (err: unknown) {
      if (err instanceof MobileApiError) throw err;
      throw new MobileApiError(
        0,
        "Gagal terhubung ke server backend WasteLink Bali. Periksa koneksi internet Anda.",
        "NETWORK_ERROR"
      );
    }
  }

  public get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }
}

export const mobileApiClient = new MobileApiClient();
