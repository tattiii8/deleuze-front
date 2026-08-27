import axios from 'axios';
import { Tenant, User } from './types';

/* ==========================================
 * Management API
 * ========================================== */

const api = axios.create({
  baseURL: '/api/mng'
});

/* ==========================================
 * Auth Internal API
 * ========================================== */

const authApi = axios.create({
  baseURL: 'http://192.168.8.112:5001/api/auth/internal'
});


/* ==========================================
 * テナント管理 (Tenants)
 * ========================================== */

/**
 * 全テナント一覧を取得
 *
 * GET /api/mng/tenants
 */
export async function fetchTenants(): Promise<Tenant[]> {
  const response = await api.get<Tenant[]>('/tenants');
  return response.data;
}

/**
 * ID指定でテナント詳細を取得
 *
 * GET /api/mng/tenants/{tenantId}
 */
export async function fetchTenantById(
  tenantId: string
): Promise<Tenant> {
  const response = await api.get<Tenant>(
    `/tenants/${tenantId}`
  );

  return response.data;
}

/**
 * 新規テナントを作成
 *
 * POST /api/mng/tenants
 */
export async function createTenant(payload: {
  tenantId: string;
  tenantName?: string;
  displayName?: string;
}): Promise<void> {
  await api.post('/tenants', payload);
}

/**
 * テナントを削除
 *
 * DELETE /api/mng/tenants/{tenantId}
 */
export async function deleteTenant(
  tenantId: string
): Promise<void> {
  await api.delete(`/tenants/${tenantId}`);
}


/* ==========================================
 * ユーザー管理 (Users)
 * ========================================== */

/**
 * テナントのユーザー一覧を取得
 *
 * GET /api/mng/tenants/{tenantId}/users
 */
export async function fetchUsers(
  tenantId: string
): Promise<User[]> {
  const response = await api.get<User[]>(
    `/tenants/${tenantId}/users`
  );

  return response.data;
}

/**
 * ユーザーを登録
 *
 * POST /api/mng/tenants/{tenantId}/users
 */
export async function registerUser(
  tenantId: string,
  payload: {
    loginId: string;
    password: string;
    userName?: string;
    email?: string;
  }
): Promise<void> {
  await api.post(
    `/tenants/${tenantId}/users`,
    payload
  );
}

/**
 * ユーザー詳細を取得
 *
 * GET /api/mng/tenants/{tenantId}/users/{subjectId}
 */
export async function fetchUserById(
  tenantId: string,
  subjectId: string
): Promise<User> {
  const response = await api.get<User>(
    `/tenants/${tenantId}/users/${subjectId}`
  );

  return response.data;
}

/**
 * ユーザーを削除
 *
 * DELETE /api/mng/tenants/{tenantId}/users/{subjectId}
 */
export async function deleteUser(
  tenantId: string,
  subjectId: string
): Promise<void> {
  await api.delete(
    `/tenants/${tenantId}/users/${subjectId}`
  );
}


/* ==========================================
 * API Key 管理
 * ========================================== */

/**
 * 管理者APIからユーザー用API Keyを発行
 *
 * POST /api/auth/internal/admin/apikey
 */
export async function issueApiKey(payload: {
  tenantId: string;
  loginId: string;
  name: string;
  expiresAt: string;
}): Promise<unknown> {
  const response = await authApi.post(
    '/admin/apikey',
    payload
  );

  return response.data;
}

/**
 * ユーザーのAPI Key一覧を取得
 *
 * GET /api/auth/internal/admin/apikey/{loginId}?tenantId={tenantId}
 */
export async function fetchApiKeys(
  tenantId: string,
  loginId: string
): Promise<unknown> {
  const response = await authApi.get(
    `/admin/apikey/${encodeURIComponent(loginId)}`,
    {
      params: { tenantId }
    }
  );

  return response.data;
}

/**
 * API Key を削除
 *
 * DELETE /api/auth/internal/admin/apikey/{id}
 */
export async function deleteApiKey(id: string): Promise<void> {
  await authApi.delete(`/admin/apikey/${id}`);
}


/* ==========================================
 * ダミーAPI
 * ========================================== */

/**
 * 現在バックエンド未実装のためダミーデータを返す。
 */
export async function fetchTenantStatus(
  tenantId: string
): Promise<{
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

/**
 * 現在バックエンド未実装のためダミーデータを返す。
 */
export async function checkTenantHealth(
  tenantId: string
): Promise<{
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