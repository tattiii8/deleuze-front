import axios, { InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';
import { Tenant, User } from './types';

// 環境変数または設定された SECRET KEY
const SECRET_KEY = import.meta.env.VITE_MANAGEMENT_API_SECRET || "";

function generateDynamicToken(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2, 10);
  const payloadRaw = `${timestamp}|${nonce}`;

  const payloadBase64 = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(payloadRaw)
  );

  const hmac = CryptoJS.HmacSHA256(payloadBase64, SECRET_KEY);
  const signatureBase64 = CryptoJS.enc.Base64.stringify(hmac);

  return `${payloadBase64}:${signatureBase64}`;
}

const api = axios.create({
  baseURL: '/api/mng'
});

// リクエストインターセプターで HMAC トークンを自動設定
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = generateDynamicToken();

  config.headers['Authorization'] = `Bearer ${token}`;

  return config;
});


/* ==========================================
 *  テナント管理 (Tenants)
 * ========================================== */

/**
 * 全テナント一覧を取得します
 */
export async function fetchTenants(): Promise<Tenant[]> {
  const response = await api.get<Tenant[]>('/tenants');
  return response.data;
}

/**
 * ID 指定でテナント詳細を取得します
 */
export async function fetchTenantById(tenantId: string): Promise<Tenant> {
  const response = await api.get<Tenant>(`/tenants/${tenantId}`);
  return response.data;
}

/**
 * 新規テナントを作成します
 */
export async function createTenant(payload: {
  tenantId: string;
  name?: string;
  services?: string[];
}): Promise<void> {
  await api.post('/tenants', payload);
}

/**
 * テナントを削除します
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  await api.delete(`/tenants/${tenantId}`);
}


/* ==========================================
 *  テナントサービス管理
 * ========================================== */

/**
 * テナントに対して追加サービスを有効化します
 */
export async function enableService(
  tenantId: string,
  serviceKey: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    `/tenants/${tenantId}/services`,
    {
      serviceKey
    }
  );

  return response.data;
}

/**
 * テナントのサービスを無効化します
 */
export async function disableService(
  tenantId: string,
  serviceKey: string
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/tenants/${tenantId}/services`,
    {
      data: {
        serviceKey
      }
    }
  );

  return response.data;
}


/* ==========================================
 *  テナント API Key 管理
 * ========================================== */

/**
 * テナントの API Key を発行（または再発行）します
 */
export async function generateApiKey(
  tenantId: string
): Promise<{ apiKey: string }> {
  const response = await api.post<{ apiKey: string }>(
    `/tenants/${tenantId}/apikey`
  );

  return response.data;
}


/* ==========================================
 *  テナント認証モード管理
 * ========================================== */

/**
 * テナントの認証モードを変更します
 *
 * 0: JwtOnly
 * 1: ApiKeyOnly
 * 2: Hybrid
 */
export async function updateAuthMode(
  tenantId: string,
  authMode: number
): Promise<{ message: string; authMode: string }> {
  const response = await api.patch<{
    message: string;
    authMode: string;
  }>(
    `/tenants/${tenantId}/authmode`,
    {
      authMode
    }
  );

  return response.data;
}


/* ==========================================
 *  テナントステータス管理
 * ========================================== */

/**
 * テナントステータスのレスポンス
 *
 * status:
 *   active
 *   suspended
 *
 * isActive:
 *   true  = 稼働中
 *   false = 一時停止中
 */
export interface TenantStatusResponse {
  tenantId: string;
  status: 'active' | 'suspended';
  isActive: boolean;
}

/**
 * テナントの現在のステータスを取得します
 *
 * GET /api/mng/tenants/{tenantId}/status
 */
export async function fetchTenantStatus(
  tenantId: string
): Promise<TenantStatusResponse> {
  const response = await api.get<TenantStatusResponse>(
    `/tenants/${tenantId}/status`
  );

  return response.data;
}

/**
 * テナントのステータスを更新します
 *
 * PATCH /api/mng/tenants/{tenantId}/status
 */
export async function updateTenantStatus(
  tenantId: string,
  status: 'active' | 'suspended'
): Promise<{ message: string }> {
  const response = await api.patch<{ message: string }>(
    `/tenants/${tenantId}/status`,
    {
      status
    }
  );

  return response.data;
}


/* ==========================================
 *  テナント DB 管理
 * ========================================== */

/**
 * テナントのマイグレーション適用履歴を取得します
 */
export async function fetchTenantMigrations(
  tenantId: string
): Promise<
  {
    migrationName: string;
    appliedAt: string;
    serviceKey?: string;
  }[]
> {
  const response = await api.get<
    {
      migrationName: string;
      appliedAt: string;
      serviceKey?: string;
    }[]
  >(
    `/tenants/${tenantId}/migrations`
  );

  return response.data;
}

/**
 * 指定したテナントのデータベースマイグレーションを実行します
 */
export async function migrateTenant(
  tenantId: string,
  serviceKey: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    `/tenants/${tenantId}/migrate/${serviceKey}`
  );

  return response.data;
}


/* ==========================================
 *  テナント Health Check
 * ========================================== */

/**
 * テナントの接続・ヘルスチェック（DB・S3）を実行します
 */
export async function checkTenantHealth(
  tenantId: string
): Promise<{
  dbStatus: string;
  storageStatus: string;
  message: string;
}> {
  const response = await api.get<{
    dbStatus: string;
    storageStatus: string;
    message: string;
  }>(
    `/tenants/${tenantId}/health`
  );

  return response.data;
}


/* ==========================================
 *  ユーザー管理 (Users)
 * ========================================== */

/**
 * 全ユーザー一覧を取得します
 */
export async function fetchUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

/**
 * 新規ユーザーを登録します
 */
export async function registerUser(payload: {
  loginId: string;
  password: string;
  tenantId: string;
}): Promise<void> {
  await api.post('/users', payload);
}

/**
 * ユーザーを削除します
 */
export async function deleteUser(
  id: string | number
): Promise<void> {
  await api.delete(`/users/${id}`);
}


export default api;