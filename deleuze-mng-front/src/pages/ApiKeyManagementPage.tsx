import React, { useState, useEffect } from 'react';
import { ApiKeyItem, Tenant } from '../types';
import {
  issueApiKey,
  fetchApiKeys,
  deleteApiKey,
  createSelfApiKey,
  fetchSelfApiKeys,
  deleteSelfApiKey,
  deleteInternalAuthItem
} from '../api';

interface ApiKeyManagementPageProps {
  tenants: Tenant[];
}

export const ApiKeyManagementPage: React.FC<ApiKeyManagementPageProps> = ({ tenants }) => {
  const [subTab, setSubTab] = useState<'admin' | 'self'>('admin');

  // --- 管理者 API Key 状態 ---
  const [adminTenantId, setAdminTenantId] = useState<string>('');
  const [adminLoginId, setAdminLoginId] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [adminExpiresAt, setAdminExpiresAt] = useState<string>('');
  const [adminKeys, setAdminKeys] = useState<ApiKeyItem[]>([]);
  const [adminKeysLoading, setAdminKeysLoading] = useState<boolean>(false);
  const [adminIssueLoading, setAdminIssueLoading] = useState<boolean>(false);
  const [adminResult, setAdminResult] = useState<unknown>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // --- オペレーター (Self) API Key 状態 ---
  const [selfName, setSelfName] = useState<string>('');
  const [selfExpiresAt, setSelfExpiresAt] = useState<string>('');
  const [selfKeys, setSelfKeys] = useState<ApiKeyItem[]>([]);
  const [selfKeysLoading, setSelfKeysLoading] = useState<boolean>(false);
  const [selfIssueLoading, setSelfIssueLoading] = useState<boolean>(false);
  const [selfResult, setSelfResult] = useState<unknown>(null);
  const [selfError, setSelfError] = useState<string | null>(null);
  const [selfSuccess, setSelfSuccess] = useState<string | null>(null);

  // クリップボードコピー完了状態
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (tenants.length > 0 && !adminTenantId) {
      setAdminTenantId(tenants[0].tenantId);
    }
  }, [tenants]);

  // 管理者 API Key 一覧取得
  const handleFetchAdminKeys = async () => {
    if (!adminLoginId.trim()) {
      setAdminError('検索対象のログインIDを入力してください。');
      return;
    }

    setAdminKeysLoading(true);
    setAdminError(null);
    try {
      const data = await fetchApiKeys(adminTenantId, adminLoginId.trim());
      setAdminKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setAdminError(err?.response?.data || err?.message || 'API Key 一覧の取得に失敗しました。');
    } finally {
      setAdminKeysLoading(false);
    }
  };

  // 管理者 API Key 発行
  const handleIssueAdminKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLoginId.trim() || !adminName.trim() || !adminExpiresAt) {
      setAdminError('すべての必須項目を入力してください。');
      return;
    }

    setAdminIssueLoading(true);
    setAdminError(null);
    setAdminSuccess(null);
    setAdminResult(null);

    try {
      const expiresAtIso = new Date(adminExpiresAt).toISOString();
      const res = await issueApiKey({
        tenantId: adminTenantId || undefined,
        loginId: adminLoginId.trim(),
        name: adminName.trim(),
        expiresAt: expiresAtIso
      });

      setAdminResult(res);
      setAdminSuccess(`ユーザー '${adminLoginId}' の API Key を発行しました。`);
      handleFetchAdminKeys();
    } catch (err: any) {
      setAdminError(err?.response?.data || err?.message || 'API Key の発行に失敗しました。');
    } finally {
      setAdminIssueLoading(false);
    }
  };

  // 管理者 API Key 削除
  const handleDeleteAdminKey = async (keyId: string, name?: string) => {
    if (!window.confirm(`API Key '${name || keyId}' を削除しますか？`)) return;

    setAdminKeysLoading(true);
    try {
      await deleteApiKey(keyId);
      setAdminSuccess('API Key を削除しました。');
      handleFetchAdminKeys();
    } catch (err: any) {
      setAdminError(err?.response?.data || err?.message || 'API Key の削除に失敗しました。');
    } finally {
      setAdminKeysLoading(false);
    }
  };

  // オペレーター (Self) API Key 一覧取得
  const handleFetchSelfKeys = async () => {
    setSelfKeysLoading(true);
    setSelfError(null);
    try {
      const data = await fetchSelfApiKeys();
      setSelfKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setSelfError(err?.response?.data || err?.message || 'オペレーター API Key 一覧の取得に失敗しました。');
    } finally {
      setSelfKeysLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'self') {
      handleFetchSelfKeys();
    }
  }, [subTab]);

  // オペレーター (Self) API Key 発行
  const handleIssueSelfKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfName.trim()) {
      setSelfError('API Key 名を入力してください。');
      return;
    }

    setSelfIssueLoading(true);
    setSelfError(null);
    setSelfSuccess(null);
    setSelfResult(null);

    try {
      const expiresAtIso = selfExpiresAt ? new Date(selfExpiresAt).toISOString() : undefined;
      const res = await createSelfApiKey({
        name: selfName.trim(),
        expiresAt: expiresAtIso
      });

      setSelfResult(res);
      setSelfSuccess('オペレーター用 API Key を発行しました。');
      handleFetchSelfKeys();
    } catch (err: any) {
      setSelfError(err?.response?.data || err?.message || 'API Key の発行に失敗しました。');
    } finally {
      setSelfIssueLoading(false);
    }
  };

  // オペレーター API Key 削除
  const handleDeleteSelfKey = async (keyId: string, name?: string) => {
    if (!window.confirm(`API Key '${name || keyId}' を削除しますか？`)) return;

    setSelfKeysLoading(true);
    try {
      await deleteSelfApiKey(keyId);
      setSelfSuccess('API Key を削除しました。');
      handleFetchSelfKeys();
    } catch (err: any) {
      // フォールバック: /api/auth/internal/{id} を試行
      try {
        await deleteInternalAuthItem(keyId);
        setSelfSuccess('API Key を削除しました。');
        handleFetchSelfKeys();
      } catch (err2: any) {
        setSelfError(err?.response?.data || err?.message || 'API Key の削除に失敗しました。');
      }
    } finally {
      setSelfKeysLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const renderKeyDisplay = (result: unknown) => {
    if (!result) return null;
    let str = '';
    if (typeof result === 'string') str = result;
    else if (typeof result === 'object') {
      const obj = result as Record<string, any>;
      str = obj.apiKey || obj.key || obj.token || obj.secretKey || JSON.stringify(obj, null, 2);
    } else str = String(result);

    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#eef6fc', border: '1px solid #70a6ff', borderRadius: '4px' }}>
        <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', color: '#004578' }}>
          発行された Key 情報 (保存してください):
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <textarea
            readOnly
            value={str}
            rows={str.includes('\n') ? 4 : 1}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '6px',
              border: '1px solid #c8c6c4',
              borderRadius: '2px'
            }}
          />
          <button
            type="button"
            onClick={() => copyToClipboard(str)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0078d4',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {copiedText === str ? 'コピー完了' : 'コピー'}
          </button>
        </div>
      </div>
    );
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
      height: '26px',
      padding: '0 10px',
      backgroundColor: '#fff',
      color: '#a80000',
      border: '1px solid #f8d7da',
      borderRadius: '2px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '1px solid #e1dfdd',
      marginTop: '12px'
    },
    th: {
      backgroundColor: '#faf9f8',
      padding: '8px 12px',
      fontWeight: 600,
      borderBottom: '1px solid #e1dfdd',
      textAlign: 'left' as const
    },
    td: {
      padding: '8px 12px',
      borderBottom: '1px solid #edebe9'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>API Key 管理</h2>
      <p style={styles.subtitle}>
        ユーザー向けの管理者 API Key 発行およびオペレーター自身の API Key の管理を行います。
      </p>

      {/* サブタブ切替 */}
      <div style={styles.tabs}>
        <button
          style={styles.tabButton(subTab === 'admin')}
          onClick={() => setSubTab('admin')}
        >
          管理者 API Key (ユーザー指定)
        </button>
        <button
          style={styles.tabButton(subTab === 'self')}
          onClick={() => setSubTab('self')}
        >
          オペレーター API Key (自己用)
        </button>
      </div>

      {/* タブ 1: 管理者 API Key */}
      {subTab === 'admin' && (
        <div>
          {/* エラー / 成功通知 */}
          {adminError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', marginBottom: '16px' }}>
              {adminError}
            </div>
          )}
          {adminSuccess && (
            <div style={{ padding: '10px 14px', backgroundColor: '#dff6dd', border: '1px solid #c3e6cb', color: '#107c41', marginBottom: '16px' }}>
              {adminSuccess}
            </div>
          )}

          {/* 新規発行フォーム */}
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>新規 API Key の発行 (管理者権限)</h3>
            <p style={{ margin: '0 0 16px 0', color: '#605e5c', fontSize: '12px' }}>
              指定したテナントおよびユーザー (loginId) に対する API Key を発行します (POST /api/auth/internal/admin/apikey)。
            </p>

            <form onSubmit={handleIssueAdminKey} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '700px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>テナント ID</label>
                {tenants.length > 0 ? (
                  <select
                    value={adminTenantId}
                    onChange={(e) => setAdminTenantId(e.target.value)}
                    style={styles.input}
                  >
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.tenantId} ({t.displayName || t.tenantName || 'No Name'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="テナント ID"
                    value={adminTenantId}
                    onChange={(e) => setAdminTenantId(e.target.value)}
                    style={styles.input}
                  />
                )}
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>ログイン ID *</label>
                <input
                  type="text"
                  required
                  placeholder="例: user01"
                  value={adminLoginId}
                  onChange={(e) => setAdminLoginId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>API Key 名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: SDK Integration Key"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>有効期限 *</label>
                <input
                  type="datetime-local"
                  required
                  value={adminExpiresAt}
                  onChange={(e) => setAdminExpiresAt(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={adminIssueLoading}
                  style={styles.primaryBtn}
                >
                  {adminIssueLoading ? '発行中...' : 'API Key を発行'}
                </button>
              </div>
            </form>

            {renderKeyDisplay(adminResult)}
          </div>

          {/* 一覧取得セクション */}
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>既存 API Key 一覧の検索</h3>
              <button
                type="button"
                onClick={handleFetchAdminKeys}
                disabled={adminKeysLoading || !adminLoginId.trim()}
                style={styles.secondaryBtn}
              >
                {adminKeysLoading ? '取得中...' : 'Key 一覧を取得'}
              </button>
            </div>
            <p style={{ margin: '0 0 12px 0', color: '#605e5c', fontSize: '12px' }}>
              GET /api/auth/internal/admin/apikey/{'{loginId}'}?tenantId={'{tenantId}'}
            </p>

            {adminKeys.length === 0 ? (
              <div style={{ padding: '16px', backgroundColor: '#faf9f8', border: '1px solid #e1dfdd', color: '#605e5c' }}>
                {adminLoginId ? '一致する API Key は存在しないか、検索を実行してください。' : 'ログイン ID を入力して「Key 一覧を取得」を押してください。'}
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Key ID</th>
                    <th style={styles.th}>Key 名</th>
                    <th style={styles.th}>作成日時</th>
                    <th style={styles.th}>有効期限</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '90px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {adminKeys.map((k, idx) => {
                    const keyId = k.id || k.apiKeyId || k.keyId || String(idx);
                    return (
                      <tr key={keyId}>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{keyId}</td>
                        <td style={styles.td}>{k.name || '-'}</td>
                        <td style={styles.td}>{k.createdAt ? new Date(k.createdAt).toLocaleString('ja-JP') : '-'}</td>
                        <td style={styles.td}>{k.expiresAt ? new Date(k.expiresAt).toLocaleString('ja-JP') : '-'}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdminKey(keyId, k.name)}
                            style={styles.dangerBtn}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* タブ 2: オペレーター API Key */}
      {subTab === 'self' && (
        <div>
          {selfError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', marginBottom: '16px' }}>
              {selfError}
            </div>
          )}
          {selfSuccess && (
            <div style={{ padding: '10px 14px', backgroundColor: '#dff6dd', border: '1px solid #c3e6cb', color: '#107c41', marginBottom: '16px' }}>
              {selfSuccess}
            </div>
          )}

          <div style={styles.card}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>オペレーター用 API Key 発行 (POST /api/auth/internal/apikey)</h3>

            <form onSubmit={handleIssueSelfKey} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '600px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>API Key 名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: Operator CLI Key"
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>有効期限</label>
                <input
                  type="datetime-local"
                  value={selfExpiresAt}
                  onChange={(e) => setSelfExpiresAt(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={selfIssueLoading}
                  style={styles.primaryBtn}
                >
                  {selfIssueLoading ? '発行中...' : 'Key を発行'}
                </button>
              </div>
            </form>

            {renderKeyDisplay(selfResult)}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>自己 API Key 一覧 (GET /api/auth/internal/apikey)</h3>
              <button
                type="button"
                onClick={handleFetchSelfKeys}
                disabled={selfKeysLoading}
                style={styles.secondaryBtn}
              >
                {selfKeysLoading ? '更新中...' : '↻ 更新'}
              </button>
            </div>

            {selfKeys.length === 0 ? (
              <div style={{ padding: '16px', backgroundColor: '#faf9f8', border: '1px solid #e1dfdd', color: '#605e5c' }}>
                登録されている API Key はありません。
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Key ID</th>
                    <th style={styles.th}>Key 名</th>
                    <th style={styles.th}>作成日時</th>
                    <th style={styles.th}>有効期限</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '90px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selfKeys.map((k, idx) => {
                    const keyId = k.id || k.apiKeyId || k.keyId || String(idx);
                    return (
                      <tr key={keyId}>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{keyId}</td>
                        <td style={styles.td}>{k.name || '-'}</td>
                        <td style={styles.td}>{k.createdAt ? new Date(k.createdAt).toLocaleString('ja-JP') : '-'}</td>
                        <td style={styles.td}>{k.expiresAt ? new Date(k.expiresAt).toLocaleString('ja-JP') : '-'}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteSelfKey(keyId, k.name)}
                            style={styles.dangerBtn}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagementPage;
