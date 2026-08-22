import axios, { InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

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

const api = axios.create({
  baseURL: '/api/mng'
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = generateDynamicToken();
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default api;