// src/pages/TenantDetail.tsx
import React, { useState } from 'react';
import { generateApiKey, updateAuthMode } from '../api';
import { Tenant } from '../types';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
}

export const TenantDetail: React.FC<TenantDetailProps> = ({ tenant, onBack, onAddService }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 追加サービス入力用
  const [serviceKey, setServiceKey] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // API Key & AuthMode 用ステート
  const [apiKey, setApiKey] = useState<string | null>(tenant.apiKey || null);
  const [authMode, setAuthMode] = useState<number>(
    typeof tenant.authMode === 'number' ? tenant.authMode : 0
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // サービス有効化ハンドラー
  const handleEnableService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceKey.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onAddService(tenant.tenantId, serviceKey.trim());
      setSuccessMessage(`サービス '${serviceKey}' を有効化しました。`);
      setServiceKey('');
    } catch (err: any) {
      setError(err.message || 'サービスの有効化に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  // API Key 発行ハンドラー
  const handleGenerateApiKey = async () => {
    if (apiKey && !window.confirm('API Key を再発行すると既存のキーは無効になります。よろしいですか？')) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await generateApiKey(tenant.tenantId);
      setApiKey(res.apiKey);
      setSuccessMessage('新しい API Key を発行しました。');
    } catch (err: any) {
      setError(err.message || 'API Key の発行に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  // 認証モード更新ハンドラー
  const handleAuthModeChange = async (newMode: number) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateAuthMode(tenant.tenantId, newMode);
      setAuthMode(newMode);
      setSuccessMessage('認証モードを更新しました。');
    } catch (err: any) {
      setError(err.message || '認証モードの更新に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', padding: 0, marginBottom: '15px' }}
      >
        &larr; テナント一覧に戻る
      </button>

      <h2>テナント詳細: {tenant.tenantId}</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</div>}

      {/* 1. 認証 & セキュリティ設定 */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>認証 & セキュリティ設定</h3>
        
        {/* 認証モード選択 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>許可する認証方式</label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {[
              { label: 'JWT (Bearer) のみ', value: 0 },
              { label: 'API Key のみ', value: 1 },
              { label: '両方許可 (Hybrid)', value: 2 },
            ].map((mode) => (
              <label key={mode.value} style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="authMode"
                  value={mode.value}
                  checked={authMode === mode.value}
                  onChange={() => handleAuthModeChange(mode.value)}
                  disabled={actionLoading}
                />{' '}
                {mode.label}
              </label>
            ))}
          </div>
        </div>

        <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />

        {/* API Key 管理 */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>API Key</label>
          <button onClick={handleGenerateApiKey} disabled={actionLoading}>
            {apiKey ? 'API Key を再発行' : 'API Key を新規発行'}
          </button>

          {apiKey && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                readOnly
                value={apiKey}
                style={{ width: '100%', fontFamily: 'monospace', padding: '5px' }}
              />
              <button onClick={handleCopyApiKey}>
                {isCopied ? 'コピー完了!' : 'コピー'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 有効化済みサービス一覧 */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>有効化サービス一覧</h3>
        <ul>
          {tenant.services && tenant.services.length > 0 ? (
            tenant.services.map((s) => <li key={s}>{s}</li>)
          ) : (
            <li>有効化された追加サービスはありません。</li>
          )}
        </ul>
      </div>

      {/* 3. サービス追加有効化フォーム */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
        <h3>追加サービス有効化</h3>
        <form onSubmit={handleEnableService}>
          <div style={{ marginBottom: '10px' }}>
            <label>サービスキー (例: drive): </label>
            <input
              type="text"
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              placeholder="drive"
              disabled={actionLoading}
            />
          </div>
          <button type="submit" disabled={actionLoading || !serviceKey.trim()}>
            サービスを有効化
          </button>
        </form>
      </div>
    </div>
  );
};