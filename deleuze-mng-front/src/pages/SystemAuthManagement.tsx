import React, { useState } from 'react';
import {
  postInternalMngInit,
  postInternalAuthInit,
  registerAuthTenant,
  deleteAuthTenant,
  registerAuthUser,
  deleteAuthUser,
  fetchOpenIdConfig,
  fetchJwks,
  postConnectToken
} from '../api';
import { OpenIdConfiguration, JwksResponse } from '../types';

export const SystemAuthManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'init' | 'direct' | 'oidc'>('init');

  // --- 初期化 状態 ---
  const [initLoading, setInitLoading] = useState<boolean>(false);
  const [initMessage, setInitMessage] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // --- Auth 直接制御 状態 ---
  const [authTenantId, setAuthTenantId] = useState('');
  const [authSubjectId, setAuthSubjectId] = useState('');
  const [authUserTenantId, setAuthUserTenantId] = useState('');
  const [authUserLoginId, setAuthUserLoginId] = useState('');
  const [authUserPassword, setAuthUserPassword] = useState('');
  const [directLoading, setDirectLoading] = useState(false);
  const [directResult, setDirectResult] = useState<unknown>(null);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  // --- OIDC & Token 状態 ---
  const [oidcConfig, setOidcConfig] = useState<OpenIdConfiguration | null>(null);
  const [jwksData, setJwksData] = useState<JwksResponse | null>(null);
  const [oidcLoading, setOidcLoading] = useState(false);

  // Connect Token Form
  const [grantType, setGrantType] = useState('password');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tokenUsername, setTokenUsername] = useState('');
  const [tokenPassword, setTokenPassword] = useState('');
  const [scope, setScope] = useState('');
  const [tokenResult, setTokenResult] = useState<unknown>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // 初期化実行
  const handleInitMng = async () => {
    if (!window.confirm('deleuze-mng の内部初期化 (POST /api/mng/internal/init) を実行しますか？')) return;
    setInitLoading(true);
    setInitError(null);
    setInitMessage(null);
    try {
      const res = await postInternalMngInit();
      setInitMessage(`mng 初期化成功: ${JSON.stringify(res || 'OK')}`);
    } catch (err: any) {
      setInitError(err?.response?.data || err?.message || 'mng 初期化に失敗しました。');
    } finally {
      setInitLoading(false);
    }
  };

  const handleInitAuth = async () => {
    if (!window.confirm('deleuze-auth の内部初期化 (POST /api/auth/internal/init) を実行しますか？')) return;
    setInitLoading(true);
    setInitError(null);
    setInitMessage(null);
    try {
      const res = await postInternalAuthInit();
      setInitMessage(`auth 初期化成功: ${JSON.stringify(res || 'OK')}`);
    } catch (err: any) {
      setInitError(err?.response?.data || err?.message || 'auth 初期化に失敗しました。');
    } finally {
      setInitLoading(false);
    }
  };

  // Auth 直接 テナント登録
  const handleRegisterAuthTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authTenantId.trim()) return;
    setDirectLoading(true);
    setDirectError(null);
    setDirectSuccess(null);
    setDirectResult(null);
    try {
      const res = await registerAuthTenant({ tenantId: authTenantId.trim() });
      setDirectResult(res);
      setDirectSuccess(`Auth テナント '${authTenantId.trim()}' を登録しました。`);
    } catch (err: any) {
      setDirectError(err?.response?.data || err?.message || 'Auth テナント登録に失敗しました。');
    } finally {
      setDirectLoading(false);
    }
  };

  // Auth 直接 テナント削除
  const handleDeleteAuthTenant = async () => {
    if (!authTenantId.trim()) {
      setDirectError('削除対象の tenantId を入力してください。');
      return;
    }
    if (!window.confirm(`Auth テナント '${authTenantId.trim()}' を削除しますか？`)) return;
    setDirectLoading(true);
    setDirectError(null);
    setDirectSuccess(null);
    try {
      await deleteAuthTenant(authTenantId.trim());
      setDirectSuccess(`Auth テナント '${authTenantId.trim()}' を削除しました。`);
    } catch (err: any) {
      setDirectError(err?.response?.data || err?.message || 'Auth テナント削除に失敗しました。');
    } finally {
      setDirectLoading(false);
    }
  };

  // Auth 直接 ユーザー登録
  const handleRegisterAuthUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectLoading(true);
    setDirectError(null);
    setDirectSuccess(null);
    setDirectResult(null);
    try {
      const res = await registerAuthUser({
        subjectId: authSubjectId.trim() || undefined,
        tenantId: authUserTenantId.trim() || undefined,
        loginId: authUserLoginId.trim() || undefined,
        password: authUserPassword || undefined
      });
      setDirectResult(res);
      setDirectSuccess(`Auth ユーザー '${authUserLoginId || authSubjectId}' を登録しました。`);
    } catch (err: any) {
      setDirectError(err?.response?.data || err?.message || 'Auth ユーザー登録に失敗しました。');
    } finally {
      setDirectLoading(false);
    }
  };

  // Auth 直接 ユーザー削除
  const handleDeleteAuthUser = async () => {
    if (!authSubjectId.trim()) {
      setDirectError('削除対象の subjectId を入力してください。');
      return;
    }
    if (!window.confirm(`Auth ユーザー (subjectId: '${authSubjectId.trim()}') を削除しますか？`)) return;
    setDirectLoading(true);
    setDirectError(null);
    setDirectSuccess(null);
    try {
      await deleteAuthUser(authSubjectId.trim());
      setDirectSuccess(`Auth ユーザー '${authSubjectId.trim()}' を削除しました。`);
    } catch (err: any) {
      setDirectError(err?.response?.data || err?.message || 'Auth ユーザー削除に失敗しました。');
    } finally {
      setDirectLoading(false);
    }
  };

  // OIDC 設定取得
  const handleLoadOidcConfig = async () => {
    setOidcLoading(true);
    try {
      const conf = await fetchOpenIdConfig();
      setOidcConfig(conf);
    } catch (err: any) {
      alert(err?.response?.data || err?.message || 'OpenID Configuration の取得に失敗しました。');
    } finally {
      setOidcLoading(false);
    }
  };

  const handleLoadJwks = async () => {
    setOidcLoading(true);
    try {
      const data = await fetchJwks();
      setJwksData(data);
    } catch (err: any) {
      alert(err?.response?.data || err?.message || 'JWKS の取得に失敗しました。');
    } finally {
      setOidcLoading(false);
    }
  };

  // Token 発行テスト
  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenLoading(true);
    setTokenError(null);
    setTokenResult(null);
    try {
      const payload: Record<string, string> = { grant_type: grantType };
      if (clientId) payload.client_id = clientId;
      if (clientSecret) payload.client_secret = clientSecret;
      if (tokenUsername) payload.username = tokenUsername;
      if (tokenPassword) payload.password = tokenPassword;
      if (scope) payload.scope = scope;

      const res = await postConnectToken(payload);
      setTokenResult(res);
    } catch (err: any) {
      setTokenError(err?.response?.data || err?.message || 'Token 発行リクエストに失敗しました。');
    } finally {
      setTokenLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '13px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 600,
      margin: '0 0 4px 0'
    },
    subtitle: {
      color: '#605e5c',
      margin: '0 0 16px 0'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      borderBottom: '1px solid #e1dfdd',
      marginBottom: '20px'
    },
    tabButton: (isActive: boolean) => ({
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      borderBottom: isActive ? '2px solid #0078d4' : '2px solid transparent',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#0078d4' : '#605e5c',
      cursor: 'pointer'
    }),
    card: {
      border: '1px solid #e1dfdd',
      borderRadius: '4px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#faf9f8'
    },
    input: {
      height: '32px',
      padding: '0 8px',
      border: '1px solid #605e5c',
      borderRadius: '2px',
      fontSize: '13px',
      width: '100%',
      boxSizing: 'border-box' as const
    },
    primaryBtn: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#0078d4',
      color: '#fff',
      border: 'none',
      borderRadius: '2px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    secondaryBtn: {
      height: '32px',
      padding: '0 12px',
      backgroundColor: '#fff',
      border: '1px solid #8a8886',
      borderRadius: '2px',
      color: '#323130',
      cursor: 'pointer'
    },
    dangerBtn: {
      height: '32px',
      padding: '0 12px',
      backgroundColor: '#fff',
      color: '#a80000',
      border: '1px solid #f8d7da',
      borderRadius: '2px',
      cursor: 'pointer'
    },
    codeBox: {
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      overflowX: 'auto' as const,
      maxHeight: '300px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>システム・Auth 管理</h2>
      <p style={styles.subtitle}>
        システムの内部初期化、`deleuze-auth` への直接テナント/ユーザー登録・削除、および OIDC・Token 検証を行います。
      </p>

      <div style={styles.tabs}>
        <button
          style={styles.tabButton(subTab === 'init')}
          onClick={() => setSubTab('init')}
        >
          システム初期化 (Internal Init)
        </button>
        <button
          style={styles.tabButton(subTab === 'direct')}
          onClick={() => setSubTab('direct')}
        >
          Auth 直接制御 (Tenants / Users)
        </button>
        <button
          style={styles.tabButton(subTab === 'oidc')}
          onClick={() => setSubTab('oidc')}
        >
          OpenID Connect & Token 検証
        </button>
      </div>

      {/* サブタブ 1: システム初期化 */}
      {subTab === 'init' && (
        <div>
          {initError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', marginBottom: '16px' }}>
              {initError}
            </div>
          )}
          {initMessage && (
            <div style={{ padding: '10px 14px', backgroundColor: '#dff6dd', border: '1px solid #c3e6cb', color: '#107c41', marginBottom: '16px' }}>
              {initMessage}
            </div>
          )}

          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>deleuze-mng システム初期化</h3>
            <p style={{ margin: '0 0 12px 0', color: '#605e5c', fontSize: '12px' }}>
              POST /api/mng/internal/init を呼び出し、管理サービスのDBスキーマや初期データを初期化します。
            </p>
            <button
              onClick={handleInitMng}
              disabled={initLoading}
              style={styles.primaryBtn}
            >
              {initLoading ? '初期化中...' : 'deleuze-mng を初期化'}
            </button>
          </div>

          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>deleuze-auth システム初期化</h3>
            <p style={{ margin: '0 0 12px 0', color: '#605e5c', fontSize: '12px' }}>
              POST /api/auth/internal/init を呼び出し、認証サービスの初期設定やキーペア・テーブルを初期化します。
            </p>
            <button
              onClick={handleInitAuth}
              disabled={initLoading}
              style={styles.primaryBtn}
            >
              {initLoading ? '初期化中...' : 'deleuze-auth を初期化'}
            </button>
          </div>
        </div>
      )}

      {/* サブタブ 2: Auth 直接制御 */}
      {subTab === 'direct' && (
        <div>
          {directError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', marginBottom: '16px' }}>
              {directError}
            </div>
          )}
          {directSuccess && (
            <div style={{ padding: '10px 14px', backgroundColor: '#dff6dd', border: '1px solid #c3e6cb', color: '#107c41', marginBottom: '16px' }}>
              {directSuccess}
            </div>
          )}

          {/* Auth テナント直接操作 */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Auth テナント直接登録 / 削除</h3>
            <p style={{ margin: '0 0 16px 0', color: '#605e5c', fontSize: '12px' }}>
              `deleuze-auth` の内部API (POST /api/auth/internal/tenants, DELETE /api/auth/internal/tenants/{'{tenantId}'}) を直接操作します。
            </p>

            <form onSubmit={handleRegisterAuthTenant} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', maxWidth: '500px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>テナント ID *</label>
                <input
                  type="text"
                  required
                  placeholder="例: auth-tenant-01"
                  value={authTenantId}
                  onChange={(e) => setAuthTenantId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={directLoading}
                style={styles.primaryBtn}
              >
                登録
              </button>

              <button
                type="button"
                onClick={handleDeleteAuthTenant}
                disabled={directLoading || !authTenantId.trim()}
                style={styles.dangerBtn}
              >
                削除
              </button>
            </form>
          </div>

          {/* Auth ユーザー直接操作 */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Auth ユーザー直接登録 / 削除</h3>
            <p style={{ margin: '0 0 16px 0', color: '#605e5c', fontSize: '12px' }}>
              `deleuze-auth` の内部API (POST /api/auth/internal/users, DELETE /api/auth/internal/users/{'{subjectId}'}) を直接操作します。
            </p>

            <form onSubmit={handleRegisterAuthUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '600px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>Subject ID (省略可)</label>
                <input
                  type="text"
                  placeholder="例: sub-1234"
                  value={authSubjectId}
                  onChange={(e) => setAuthSubjectId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>所属テナント ID</label>
                <input
                  type="text"
                  placeholder="例: auth-tenant-01"
                  value={authUserTenantId}
                  onChange={(e) => setAuthUserTenantId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>ログイン ID</label>
                <input
                  type="text"
                  placeholder="例: auth_user_01"
                  value={authUserLoginId}
                  onChange={(e) => setAuthUserLoginId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>パスワード</label>
                <input
                  type="password"
                  placeholder="パスワード"
                  value={authUserPassword}
                  onChange={(e) => setAuthUserPassword(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={directLoading}
                  style={styles.primaryBtn}
                >
                  Auth ユーザーとして登録
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAuthUser}
                  disabled={directLoading || !authSubjectId.trim()}
                  style={styles.dangerBtn}
                >
                  Subject ID で削除
                </button>
              </div>
            </form>
          </div>

          {Boolean(directResult) && (
            <div style={styles.card}>
              <h4 style={{ margin: '0 0 8px 0' }}>API 実行レスポンス</h4>
              <pre style={styles.codeBox}>{JSON.stringify(directResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* サブタブ 3: OIDC & Token 検証 */}
      {subTab === 'oidc' && (
        <div>
          {/* OIDC Config & JWKS ボタン */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>OpenID Connect ディスカバリ & JWKS 情報</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={handleLoadOidcConfig}
                disabled={oidcLoading}
                style={styles.primaryBtn}
              >
                GET /.well-known/openid-configuration を取得
              </button>

              <button
                onClick={handleLoadJwks}
                disabled={oidcLoading}
                style={styles.secondaryBtn}
              >
                GET /.well-known/jwks を取得
              </button>
            </div>

            {oidcConfig && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0' }}>OpenID Configuration</h4>
                <pre style={styles.codeBox}>{JSON.stringify(oidcConfig, null, 2)}</pre>
              </div>
            )}

            {jwksData && (
              <div>
                <h4 style={{ margin: '0 0 6px 0' }}>JWKS (JSON Web Key Set)</h4>
                <pre style={styles.codeBox}>{JSON.stringify(jwksData, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Connect Token テスト */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Token 発行テスト (POST /connect/token)</h3>
            <p style={{ margin: '0 0 16px 0', color: '#605e5c', fontSize: '12px' }}>
              OAuth 2.0 / OpenID Connect のトークンエンドポイントにリクエストを送信します (form-urlencoded)。
            </p>

            {tokenError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', marginBottom: '16px' }}>
                {tokenError}
              </div>
            )}

            <form onSubmit={handleConnectToken} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '600px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>grant_type *</label>
                <input
                  type="text"
                  required
                  placeholder="例: password, client_credentials"
                  value={grantType}
                  onChange={(e) => setGrantType(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>client_id</label>
                <input
                  type="text"
                  placeholder="クライアント ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>username</label>
                <input
                  type="text"
                  placeholder="ユーザー名 / ログインID"
                  value={tokenUsername}
                  onChange={(e) => setTokenUsername(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>password</label>
                <input
                  type="password"
                  placeholder="パスワード"
                  value={tokenPassword}
                  onChange={(e) => setTokenPassword(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>client_secret</label>
                <input
                  type="password"
                  placeholder="クライアントシークレット"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>scope</label>
                <input
                  type="text"
                  placeholder="例: openid profile"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={tokenLoading}
                  style={styles.primaryBtn}
                >
                  {tokenLoading ? '送信中...' : 'Token リクエスト送信'}
                </button>
              </div>
            </form>

            {Boolean(tokenResult) && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0' }}>Token レスポンス</h4>
                <pre style={styles.codeBox}>{JSON.stringify(tokenResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAuthManagement;
