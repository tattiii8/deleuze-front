// src/pages/TenantDetail.tsx
import React, { useState, useEffect } from 'react';
import { generateApiKey, updateAuthMode } from '../api';
import { Tenant } from '../types';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const AVAILABLE_SERVICES = [
  { key: 'drive', label: 'Drive (ファイルストレージ)' },
];

const AUTH_MODE_LABELS: Record<number, string> = {
  0: 'JWT (Bearer) のみ',
  1: 'API Key のみ',
  2: '両方許可 (Hybrid)',
};

export const TenantDetail: React.FC<TenantDetailProps> = ({ 
  tenant, 
  onBack, 
  onAddService,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 未有効化のサービス
  const unenabledServices = AVAILABLE_SERVICES.filter(
    (s) => !tenant.services?.includes(s.key)
  );

  const [selectedService, setSelectedService] = useState<string>(
    unenabledServices[0]?.key || ''
  );
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // ケース違い(authMode / AuthMode)を判定
  const initialAuthMode = (tenant as any).authMode ?? (tenant as any).AuthMode;
  const initialApiKey = (tenant as any).apiKey ?? (tenant as any).ApiKey;

  const [apiKey, setApiKey] = useState<string | null>(initialApiKey || null);
  const [authMode, setAuthMode] = useState<number>(
    typeof initialAuthMode === 'number' ? initialAuthMode : 0
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 親から渡される tenant props の変更を検知してローカルステートを同期
  useEffect(() => {
    const currentAuthMode = (tenant as any).authMode ?? (tenant as any).AuthMode;
    const currentApiKey = (tenant as any).apiKey ?? (tenant as any).ApiKey;

    if (typeof currentAuthMode === 'number') {
      setAuthMode(currentAuthMode);
    }
    setApiKey(currentApiKey || null);
  }, [tenant]);

  // サービス有効化
  const handleEnableService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onAddService(tenant.tenantId, selectedService);
      setSuccessMessage(`サービス '${selectedService}' を有効化しました。`);
      const updatedUnenabled = unenabledServices.filter((s) => s.key !== selectedService);
      setSelectedService(updatedUnenabled[0]?.key || '');
    } catch (err: any) {
      setError(err.message || 'サービスの有効化に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  // API Key 発行
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
      setSuccessMessage('新しい API Key を発行しました。安全な場所に保存してください。');
      await onRefresh(); // 👈 親(App.tsx)のステートを更新
    } catch (err: any) {
      setError(err.message || 'API Key の発行に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  // 認証モード変更
  const handleAuthModeChange = async (newMode: number) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateAuthMode(tenant.tenantId, newMode);
      setAuthMode(newMode);
      setSuccessMessage('認証モードを更新しました。');
      await onRefresh(); // 👈 親(App.tsx)のステートを更新
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

      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>テナント詳細: {tenant.tenantId}</h2>

      {/* タブ切り替えバー */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
            color: activeTab === 'overview' ? '#0066cc' : '#666',
            borderBottom: activeTab === 'overview' ? '3px solid #0066cc' : 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          現在の設定（概要）
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
            color: activeTab === 'settings' ? '#0066cc' : '#666',
            borderBottom: activeTab === 'settings' ? '3px solid #0066cc' : 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          設定変更・操作
        </button>
      </div>

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

      {/* タブ 1: 概要（閲覧専用） */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#333' }}>現在のステータス</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '8px 0', width: '160px', color: '#666' }}>現在の認証方式</th>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{AUTH_MODE_LABELS[authMode] || '不明'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '8px 0', color: '#666' }}>API Key</th>
                  <td style={{ padding: '8px 0' }}>
                    {apiKey ? (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>● 発行済み (末尾: ...{apiKey.slice(-6)})</span>
                    ) : (
                      <span style={{ color: '#999' }}>未発行</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ padding: '8px 0', color: '#666' }}>有効化済みサービス</th>
                  <td style={{ padding: '8px 0' }}>
                    {tenant.services && tenant.services.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {tenant.services.map((s) => (
                          <span key={s} style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>なし</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* タブ 2: 設定変更・操作 */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. 認証方式の変更 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0 }}>認証方式の変更</h3>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
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

          {/* 2. API Key の発行・確認 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0 }}>API Key の発行・再発行</h3>
            <button 
              onClick={handleGenerateApiKey} 
              disabled={actionLoading}
              style={{
                padding: '8px 16px',
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

          {/* 3. 追加サービス有効化 */}
          <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
            <h3 style={{ marginTop: 0 }}>追加サービス有効化</h3>
            {unenabledServices.length > 0 ? (
              <form onSubmit={handleEnableService} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
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
              <p style={{ margin: 0, color: '#666' }}>追加可能なサービスはすべて有効化されています。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};