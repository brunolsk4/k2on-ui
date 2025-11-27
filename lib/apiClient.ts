type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type LoginPayload = { email: string; password: string };
export type SignupPayload = {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  password: string;
  telefone: string; // DDD + número (10 ou 11 dígitos) ou +55...
};
export type OtpPayload = { email: string; otp: string };

export type User = {
  id: string;
  name: string;
  email: string;
  empresaId?: number | null;
  agenciaId?: number | null;
  // Extend as backend returns
  [key: string]: unknown;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

// Resolve base da API em runtime: usa NEXT_PUBLIC_API_URL quando existir,
// senão cai para window.location.origin (mesmo host do app Next).
const BUILD_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
function getApiBase(forPath: string): string {
  if (BUILD_API_URL) {
    // Se o caminho é de App Route (/api/ai/...), garantimos base com /app
    if (forPath.startsWith("/api/ai/")) {
      return BUILD_API_URL.endsWith("/app") ? BUILD_API_URL : `${BUILD_API_URL}/app`;
    }
    return BUILD_API_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    // Rotas Next (app router) vivem sob /app/api/...; rotas Express permanecem em /api/...
    const isAppRoute = forPath.startsWith("/api/ai/");
    return isAppRoute ? `${origin}/app` : origin;
  }
  return "";
}

function invariant(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

const TOKEN_STORAGE_KEY = "k2on.auth.token";
const REFRESH_TOKEN_STORAGE_KEY = "k2on.auth.refresh";

type StorageMode = "local" | "session";
let storageMode: StorageMode = "local";

function getStore(mode: StorageMode) {
  if (typeof window === "undefined") return null;
  return mode === "local" ? window.localStorage : window.sessionStorage;
}

function setRemember(remember: boolean) {
  storageMode = remember ? "local" : "session";
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  // Prefer localStorage, then sessionStorage
  return (
    window.localStorage.getItem(TOKEN_STORAGE_KEY) ||
    window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
}

function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  const target = getStore(storageMode);
  const other = getStore(storageMode === "local" ? "session" : "local");
  if (!target || !other) return;
  if (token) {
    target.setItem(TOKEN_STORAGE_KEY, token);
    other.removeItem(TOKEN_STORAGE_KEY);
  } else {
    target.removeItem(TOKEN_STORAGE_KEY);
    other.removeItem(TOKEN_STORAGE_KEY);
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ||
    window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  );
}

function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  const target = getStore(storageMode);
  const other = getStore(storageMode === "local" ? "session" : "local");
  if (!target || !other) return;
  if (token) {
    target.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    other.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } else {
    target.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    other.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

async function request<T>(
  path: string,
  opts: {
    method?: HttpMethod;
    body?: unknown;
    withAuth?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const base = getApiBase(path.startsWith("/") ? path : `/${path}`);
  invariant(base, "API base não configurada");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (opts.withAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    // Credentials are not needed for pure JWT, keep default
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : (undefined as unknown);

  if (!res.ok) {
    const message = (data as any)?.message || (data as any)?.error || res.statusText;
    const err = new Error(String(message || "Erro na requisição")) as Error & {
      status?: number;
      data?: unknown;
    };
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

async function refreshTokens(): Promise<void> {
  // Backend atual não expõe /api/auth/refresh; noop por enquanto
  return;
}

// Public API
export const apiClient = {
  // Low-level
  request,

  // Token helpers
  setRemember,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  refreshTokens,

  // Password recovery
  async forgotPassword(email: string): Promise<{ ok: true; message?: string }> {
    const res = await request<{ ok: true; message?: string }>("/api/auth/forgot", {
      method: "POST",
      body: { email },
    });
    return res;
  },

  async resetPassword(token: string, novaSenha: string): Promise<{ ok?: boolean; token?: string }> {
    const res = await request<{ ok?: boolean; token?: string }>("/api/auth/reset", {
      method: "POST",
      body: { token, novaSenha },
    });
    if ((res as any)?.token) setAccessToken((res as any).token);
    return res;
  },

  // Auth endpoints
  async login(payload: LoginPayload & { rememberMe?: boolean }): Promise<AuthTokens | { token: string }> {
    const body = { ...payload, rememberMe: payload.rememberMe ?? (storageMode === "local") };
    // Backend expõe POST /api/login e retorna { token }
    const res = await request<AuthTokens | { token: string }>("/api/login", {
      method: "POST",
      body,
    });
    const token = (res as any)?.accessToken || (res as any)?.token;
    if (token) setAccessToken(token);
    const refresh = (res as any)?.refreshToken || null;
    if (refresh) setRefreshToken(refresh);

    // Espehlo seguro em cookie httpOnly via servidor Express
    try {
      const base = getApiBase("/api/login");
      if (typeof window !== "undefined" && base) {
        await fetch(`${base}/auth/token-cookie`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, remember: storageMode === "local" }),
        }).catch(() => {});
      }
    } catch {}
    return res;
  },

  async signup(payload: SignupPayload): Promise<{ verification_sent: boolean }> {
    // Backend espera estes campos e retorna 201 { verification_sent: true }
    const res = await request<{ verification_sent: boolean }>("/api/signup", {
      method: "POST",
      body: payload,
    });
    return res;
  },

  async verifyOtp(payload: OtpPayload): Promise<AuthTokens | { success: true }> {
    const res = await request<AuthTokens | { success: true }>("/api/auth/otp", {
      method: "POST",
      body: payload,
    });
    if ((res as AuthTokens)?.accessToken) {
      const tokens = res as AuthTokens;
      setAccessToken(tokens.accessToken);
      if (tokens.refreshToken) setRefreshToken(tokens.refreshToken);
    }
    return res;
  },

  async me(): Promise<User> {
    try {
      return await request<User>("/api/me", { withAuth: true });
    } catch (err: any) {
      if (err?.status === 401) {
        await refreshTokens();
        // Se ainda 401, propaga erro
        return await request<User>("/api/me", { withAuth: true });
      }
      throw err;
    }
  },

  logout() {
    setAccessToken(null);
    setRefreshToken(null);
    try {
      const base = getApiBase("/auth/clear-cookie");
      if (typeof window !== "undefined" && base) {
        fetch(`${base}/auth/clear-cookie`, { method: "POST", credentials: "include" }).catch(() => {});
      }
    } catch {}
  },
};

export default apiClient;
