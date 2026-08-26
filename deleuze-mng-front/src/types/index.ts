export type AuthMode = 'JwtOnly' | 'ApiKeyOnly' | 'Both' | number;

export interface Tenant {
  tenantId: string;
  tenantName: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  subjectId: string;
  tenantId: string;
  loginId: string;
  userName: string;
  email: string;
  createdAt: string;
}

export interface SystemMessage {
  text: string;
  type: any; // MessageBarType
}