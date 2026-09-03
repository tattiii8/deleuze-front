export type AuthMode = 'JwtOnly' | 'ApiKeyOnly' | 'Both' | number;

export interface Tenant {
  tenantId: string;
  tenantName?: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  subjectId: string;
  tenantId: string;
  loginId: string;
  userName?: string;
  email?: string;
  createdAt?: string;
}

export interface SystemMessage {
  text: string;
  type: any; // MessageBarType
}

/* ==========================================
 * OpenAPI Schemas
 * ========================================== */

// deleuze-auth API Schemas
export interface AdminCreateApiKeyRequest {
  tenantId?: string | null;
  loginId?: string | null;
  name?: string | null;
  expiresAt?: string | null;
}

export interface CreateApiKeyRequest {
  name?: string | null;
  expiresAt?: string | null;
}

export interface RegisterAuthTenantRequest {
  tenantId?: string | null;
}

export interface RegisterAuthUserRequest {
  subjectId?: string | null;
  tenantId?: string | null;
  loginId?: string | null;
  password?: string | null;
}

// deleuze-mng API Schemas
export interface CreateTenantRequest {
  tenantId?: string | null;
  displayName?: string | null;
}

export interface CreateUserRequest {
  loginId?: string | null;
  password?: string | null;
  userName?: string | null;
  email?: string | null;
}

// Generic API Key Response Item
export interface ApiKeyItem {
  id?: string;
  apiKeyId?: string;
  keyId?: string;
  name?: string;
  tenantId?: string;
  loginId?: string;
  createdAt?: string;
  expiresAt?: string;
  secretKey?: string;
  apiKey?: string;
  token?: string;
  [key: string]: any;
}

// OIDC Schemas
export interface OpenIdConfiguration {
  issuer?: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  jwks_uri?: string;
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
  response_types_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  scopes_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  claims_supported?: string[];
  [key: string]: any;
}

export interface JwksKey {
  kty?: string;
  use?: string;
  kid?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: any;
}

export interface JwksResponse {
  keys?: JwksKey[];
  [key: string]: any;
}