export type AuthMode = 'JwtOnly' | 'ApiKeyOnly' | 'Both' | number;

export interface Tenant {
  tenantId: string;
  services: string[];
  apiKey?: string;
  authMode?: AuthMode;
}

export interface User {
  id: number;
  loginId: string;
  tenantId: string;
  createdAt: string;
}

export interface SystemMessage {
  text: string;
  type: any; // MessageBarType
}