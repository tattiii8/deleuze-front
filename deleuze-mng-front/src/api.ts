import axios from 'axios';
import {
  Tenant,
  User,
  CreateTenantRequest,
  CreateUserRequest,
  CreateApiKeyRequest,
  AdminCreateApiKeyRequest,
  RegisterAuthTenantRequest,
  RegisterAuthUserRequest,
  ApiKeyItem,
  OpenIdConfiguration,
  JwksResponse
} from './types';

/* ==========================================
 * Axios Clients Setup
 * ========================================== */

// Management API (/api/mng)
const api = axios.create({
  baseURL: import.meta.env.VITE_MNG_API_BASE_URL || '/api/mng'
});

// Auth Internal API (/api/auth/internal)
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_BASE_URL || '/api/auth/internal'
});

// Root API (for /.well-known and /connect/token)
const rootApi = axios.create({
  baseURL: '/'
});

/* ==========================================
 * deleuze-mng API
 * ========================================== */

/**
 * 内部 Management 初期化
 * POST /api/mng/internal/init
 */
export async function postInternalMngInit(): Promise<unknown> {
  const response = await api.post('/internal/init');
  return response.data;
}

/**
 * 全テナント一覧を取得
 * GET /api/mng/tenants
 */
export async function fetchTenants(): Promise<Tenant[]> {
  const response = await api.get<Tenant[]>('/tenants');
  return response.data;
}

/**
 * ID指定でテナント詳細を取得
 * GET /api/mng/tenants/{tenantId}
 */
export async function fetchTenantById(tenantId: string): Promise<Tenant> {
  const response = await api.get<Tenant>(`/tenants/${encodeURIComponent(tenantId)}`);
  return response.data;
}

/**
 * 新規テナントを作成
 * POST /api/mng/tenants
 */
export async function createTenant(payload: CreateTenantRequest & { tenantName?: string }): Promise<void> {
  await api.post('/tenants', payload);
}

/**
 * テナントを削除
 * DELETE /api/mng/tenants/{tenantId}
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  await api.delete(`/tenants/${encodeURIComponent(tenantId)}`);
}

/**
 * テナントのユーザー一覧を取得
 * GET /api/mng/tenants/{tenantId}/users
 */
export async function fetchUsers(tenantId: string): Promise<User[]> {
  const response = await api.get<User[]>(`/tenants/${encodeURIComponent(tenantId)}/users`);
  return response.data;
}

/**
 * ユーザーを登録 (deleuze-mng)
 * POST /api/mng/tenants/{tenantId}/users
 */
export async function registerUser(
  tenantId: string,
  payload: CreateUserRequest
): Promise<void> {
  await api.post(`/tenants/${encodeURIComponent(tenantId)}/users`, payload);
}

/**
 * ユーザー詳細を取得
 * GET /api/mng/tenants/{tenantId}/users/{subjectId}
 */
export async function fetchUserById(
  tenantId: string,
  subjectId: string
): Promise<User> {
  const response = await api.get<User>(
    `/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(subjectId)}`
  );
  return response.data;
}

/**
 * ユーザーを削除 (deleuze-mng)
 * DELETE /api/mng/tenants/{tenantId}/users/{subjectId}
 */
export async function deleteUser(
  tenantId: string,
  subjectId: string
): Promise<void> {
  await api.delete(
    `/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(subjectId)}`
  );
}


/* ==========================================
 * deleuze-auth API
 * ========================================== */

/**
 * 内部 Auth 初期化
 * POST /api/auth/internal/init
 */
export async function postInternalAuthInit(): Promise<unknown> {
  const response = await authApi.post('/init');
  return response.data;
}

/**
 * Auth 直接テナント登録
 * POST /api/auth/internal/tenants
 */
export async function registerAuthTenant(payload: RegisterAuthTenantRequest): Promise<unknown> {
  const response = await authApi.post('/tenants', payload);
  return response.data;
}

/**
 * Auth 直接テナント削除
 * DELETE /api/auth/internal/tenants/{tenantId}
 */
export async function deleteAuthTenant(tenantId: string): Promise<void> {
  await authApi.delete(`/tenants/${encodeURIComponent(tenantId)}`);
}

/**
 * Auth 直接ユーザー登録
 * POST /api/auth/internal/users
 */
export async function registerAuthUser(payload: RegisterAuthUserRequest): Promise<unknown> {
  const response = await authApi.post('/users', payload);
  return response.data;
}

/**
 * Auth 直接ユーザー削除
 * DELETE /api/auth/internal/users/{subjectId}
 */
export async function deleteAuthUser(subjectId: string): Promise<void> {
  await authApi.delete(`/users/${encodeURIComponent(subjectId)}`);
}

/**
 * 管理者APIからユーザー用API Keyを発行
 * POST /api/auth/internal/admin/apikey
 */
export async function issueApiKey(payload: AdminCreateApiKeyRequest): Promise<unknown> {
  const response = await authApi.post('/admin/apikey', payload);
  return response.data;
}

/**
 * ユーザーのAPI Key一覧を取得 (管理者)
 * GET /api/auth/internal/admin/apikey/{loginId}?tenantId={tenantId}
 */
export async function fetchApiKeys(
  tenantId: string,
  loginId: string
): Promise<ApiKeyItem[]> {
  const response = await authApi.get(
    `/admin/apikey/${encodeURIComponent(loginId)}`,
    {
      params: { tenantId }
    }
  );
  return response.data;
}

/**
 * API Key を削除 (管理者)
 * DELETE /api/auth/internal/admin/apikey/{id}
 */
export async function deleteApiKey(id: string): Promise<void> {
  await authApi.delete(`/admin/apikey/${encodeURIComponent(id)}`);
}

/**
 * 自分(オペレーター)用 API Key を発行
 * POST /api/auth/internal/apikey
 */
export async function createSelfApiKey(payload: CreateApiKeyRequest): Promise<unknown> {
  const response = await authApi.post('/apikey', payload);
  return response.data;
}

/**
 * 自分(オペレーター)用 API Key 一覧を取得
 * GET /api/auth/internal/apikey
 */
export async function fetchSelfApiKeys(): Promise<ApiKeyItem[]> {
  const response = await authApi.get('/apikey');
  return response.data;
}

/**
 * 自分(オペレーター)用 API Key を削除
 * DELETE /api/auth/internal/apikey/{id}
 */
export async function deleteSelfApiKey(id: string): Promise<void> {
  await authApi.delete(`/apikey/${encodeURIComponent(id)}`);
}

/**
 * 内部 Auth リソース/Keyを削除
 * DELETE /api/auth/internal/{id}
 */
export async function deleteInternalAuthItem(id: string): Promise<void> {
  await authApi.delete(`/${encodeURIComponent(id)}`);
}


/* ==========================================
 * OIDC & Public Endpoints
 * ========================================== */

/**
 * OpenID Configuration 取得
 * GET /.well-known/openid-configuration
 */
export async function fetchOpenIdConfig(): Promise<OpenIdConfiguration> {
  const response = await rootApi.get<OpenIdConfiguration>('/.well-known/openid-configuration');
  return response.data;
}

/**
 * JWKS 取得
 * GET /.well-known/jwks
 */
export async function fetchJwks(): Promise<JwksResponse> {
  const response = await rootApi.get<JwksResponse>('/.well-known/jwks');
  return response.data;
}

/**
 * Token 発行テスト (OAuth2 / OIDC)
 * POST /connect/token
 */
export async function postConnectToken(payload: Record<string, string>): Promise<unknown> {
  const params = new URLSearchParams(payload);
  const response = await rootApi.post('/connect/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
}


/* ==========================================
 * ダミー/ヘルパー API
 * ========================================== */

export async function fetchTenantStatus(tenantId: string): Promise<{
  tenantId: string;
  status: 'active' | 'suspended';
  isActive: boolean;
}> {
  return {
    tenantId,
    status: 'active',
    isActive: true
  };
}

export async function checkTenantHealth(tenantId: string): Promise<{
  dbStatus: string;
  storageStatus: string;
  message: string;
}> {
  return {
    dbStatus: 'healthy',
    storageStatus: 'healthy',
    message: 'ダミーデータです'
  };
}

export default api;