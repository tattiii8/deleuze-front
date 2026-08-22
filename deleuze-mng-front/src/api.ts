import axios, { InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';
import { Tenant } from './types';

// 環境変数または設定された SECRET KEY
const SECRET_KEY = import.meta.env.VITE_MANAGEMENT_API_SECRET || "";

function generateDynamicToken(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2, 10);
  const payloadRaw = `${timestamp}|${nonce}`;
  
  const payloadBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(payloadRaw));
  const hmac = CryptoJS.HmacSHA256(payloadBase64, SECRET_KEY);
  const signatureBase64 = CryptoJS.enc.Base64.stringify(hmac);

  return `${payloadBase64}:${signatureBase64}`;
}

// 👈 baseURL に修正
const api = axios.create({
  baseURL: '/api/mng'
});

// リクエストインターセプターで HMAC トークンを自動設定
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = generateDynamicToken();
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

/**
 * テナントの API Key を発行（または再発行）します
 */
export async function generateApiKey(tenantId: string): Promise<{ apiKey: string }> {
  // 👈 axios インスタンス (api) を使用
  const response = await api.post<{ apiKey: string }>(`/tenants/${tenantId}/api-key`);
  return response.data;
}

/**
 * テナントの認証モードを変更します (0: JwtOnly, 1: ApiKeyOnly, 2: Both)
 */
export async function updateAuthMode(tenantId: string, authMode: number): Promise<{ message: string; authMode: string }> {
  // 👈 axios インスタンス (api) を使用
  const response = await api.patch<{ message: string; authMode: string }>(`/tenants/${tenantId}/auth-mode`, {
    authMode
  });
  return response.data;
}

export async function fetchTenants(): Promise<Tenant[]> {
  const response = await api.get<Tenant[]>('/tenants');
  return response.data;
}

/**
 * テナントに対して追加サービスを有効化します
 */
export async function enableService(tenantId: string, serviceKey: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(`/tenants/${tenantId}/services`, {
    serviceKey
  });
  return response.data;
}

export default api;