export interface Tenant {
  tenantId: string;
  enabledServices?: string[];
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