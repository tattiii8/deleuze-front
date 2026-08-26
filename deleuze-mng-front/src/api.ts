import axios from 'axios';
import { Tenant, User } from './types';

const api = axios.create({
  baseURL: '/api/mng'
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
 *
 * CreateTenantRequest:
 * {
 *   tenantId: string;
 *   tenantName?: string;
 *   displayName?: string;
 * }
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
 *
 * CreateUserRequest:
 * {
 *   loginId: string;
 *   password: string;
 *   userName?: string;
 *   email?: string;
 * }
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
 * 未実装API
 * ========================================== */

/*
 * 以下は現在の OpenAPI に存在しないため、
 * バックエンド実装後に有効化する。
 *
 * ------------------------------------------
 * テナントサービス管理
 * ------------------------------------------
 *
 * POST   /tenants/{tenantId}/services
 * DELETE /tenants/{tenantId}/services
 *
 * export async function enableService(...)
 * export async function disableService(...)
 *
 *
 * ------------------------------------------
 * テナント API Key 管理
 * ------------------------------------------
 *
 * POST /tenants/{tenantId}/apikey
 *
 * export async function generateApiKey(...)
 *
 *
 * ------------------------------------------
 * テナント認証モード管理
 * ------------------------------------------
 *
 * PATCH /tenants/{tenantId}/authmode
 *
 * export async function updateAuthMode(...)
 *
 *
 * ------------------------------------------
 * テナントステータス管理
 * ------------------------------------------
 *
 * GET   /tenants/{tenantId}/status
 * PATCH /tenants/{tenantId}/status
 *
 * export async function fetchTenantStatus(...)
 * export async function updateTenantStatus(...)
 *
 *
 * ------------------------------------------
 * テナント DB 管理
 * ------------------------------------------
 *
 * GET  /tenants/{tenantId}/migrations
 * POST /tenants/{tenantId}/migrate/{serviceKey}
 *
 * export async function fetchTenantMigrations(...)
 * export async function migrateTenant(...)
 *
 *
 * ------------------------------------------
 * テナント Health Check
 * ------------------------------------------
 *
 * GET /tenants/{tenantId}/health
 *
 * export async function checkTenantHealth(...)
 */


/* ==========================================
 * ダミーAPI
 * ========================================== */

/**
 * 現在バックエンド未実装のためダミーデータを返す。
 *
 * UI開発用。
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
 *
 * UI開発用。
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