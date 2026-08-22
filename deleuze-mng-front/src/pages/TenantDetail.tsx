// src/pages/TenantDetail.tsx
import React, { useState } from 'react';
import { generateApiKey, updateAuthMode } from '../api';
import { Tenant } from '../types';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
}

// 選択可能なサービスリスト
const AVAILABLE_SERVICES = [
  { key: 'drive', label: 'Drive (ファイルストレージ)' },
  // 今後サービスが増えた場合はここに追加
];

export const TenantDetail: React.FC<TenantDetailProps> = ({ tenant, onBack, onAddService }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 未有効化のサービス一覧を抽出
  const unenabledServices = AVAILABLE_SERVICES.filter(
    (s) => !tenant.services?.includes(s.key)
  );

  // 追加サービス選択用 (初期値は未有効化サービスの先頭)
  const [selectedService, setSelectedService] = useState<string>(
    unenabledServices[0]?.key || ''
  );
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
    if (!selectedService) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onAddService(tenant.tenantId, selectedService);
      setSuccessMessage(`サービス '${selectedService}' を有効化しました。`);
      
      // 有効化後に選択肢を更新
      const updatedUnenabled = unenabledServices.filter((s) => s.key !== selectedService);
      setSelectedService(updatedUnenabled[0]?.key || '');
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
    <div style={{
      padding: '24px',
      maxWidth: '800px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <button 
        onClick={onBack} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#0066cc', 
          cursor: 'pointer', 
          padding: 0, 
          marginBottom: '16px',
          fontSize: '14px' 
        }}
      >
        &larr; テナント一覧に戻る
      </button>

      <h2 style={{ marginTop: 0, borderBottom: '2px solid #eaeaea', paddingBottom: '10px' }}>
        テナント詳細: {tenant.tenantId}
      </h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '10px', backgroundColor: '#e6ffe6', color: '#008000', borderRadius: '4px', marginBottom: '16px' }}>
          {successMessage}
        </div>
      )}

      {/* 1. 認証 & セキュリティ設定 */}
      <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
        <h3 style={{ marginTop: 0 }}>認証 & セキュリティ設定</h3>
        
        {/* 認証モード選択 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>許可する認証方式</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'JWT (Bearer) のみ', value: 0 },
              { label: 'API Key のみ', value: 1 },
              { label: '両方許可 (Hybrid)', value: 2 },
            ].map((mode) => (
              <label key={mode.value} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="radio"
                  name="authMode"
                  value={mode.value}
                  checked={authMode === mode.value}
                  onChange={() => handleAuthModeChange(mode.value)}
                  disabled={actionLoading}
                />
                {mode.label}
              </label>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '16px 0' }} />

        {/* API Key 管理 */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>API Key</label>
          <button 
            onClick={handleGenerateApiKey} 
            disabled={actionLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {apiKey ? 'API Key を再発行' : 'API Key を新規発行'}
          </button>

          {apiKey && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                readOnly
                value={apiKey}
                style={{ 
                  flex: 1, 
                  fontFamily: 'monospace', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  backgroundColor: '#ffffff'
                }}
              />
              <button 
                onClick={handleCopyApiKey}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isCopied ? 'コピー完了!' : 'コピー'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 有効化済みサービス一覧 */}
      <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
        <h3 style={{ marginTop: 0 }}>有効化サービス一覧</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {tenant.services && tenant.services.length > 0 ? (
            tenant.services.map((s) => <li key={s} style={{ marginBottom: '4px' }}>{s}</li>)
          ) : (
            <li style={{ color: '#666' }}>有効化された追加サービスはありません。</li>
          )}
        </ul>
      </div>

      {/* 3. サービス追加有効化フォーム (ドロップダウン選択) */}
      <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
        <h3 style={{ marginTop: 0 }}>追加サービス有効化</h3>
        {unenabledServices.length > 0 ? (
          <form onSubmit={handleEnableService} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              disabled={actionLoading}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '220px' }}
            >
              {unenabledServices.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              disabled={actionLoading || !selectedService}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              サービスを有効化
            </button>
          </form>
        ) : (
          <p style={{ margin: 0, color: '#666' }}>追加できるサービスはすべて有効化されています。</p>
        )}
      </div>
    </div>
  );
};