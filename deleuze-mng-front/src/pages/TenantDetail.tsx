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
      await onRefresh();
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
      await onRefresh();
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
      padding: '16px',
      maxWidth: '900px',
      margin: '16px auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e1dfdd',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#1b1b1b'
    }}>
      <button 
        onClick={onBack} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#0078d4', 
          cursor: 'pointer', 
          padding: 0, 
          marginBottom: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        &larr; テナント一覧に戻る
      </button>

      <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        テナント詳細: <span style={{ fontFamily: 'monospace', color: '#0078d4' }}>{tenant.tenantId}</span>
      </h2>

      {/* タブ切り替えバー */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e1dfdd', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
            color: activeTab === 'overview' ? '#0078d4' : '#605e5c',
            borderBottom: activeTab === 'overview' ? '2px solid #0078d4' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: '-1px'
          }}
        >
          概要
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            fontSize: '12px',
            fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
            color: activeTab === 'settings' ? '#0078d4' : '#605e5c',
            borderBottom: activeTab === 'settings' ? '2px solid #0078d4' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: '-1px'
          }}
        >
          構成・操作
        </button>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', fontSize: '12px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '8px 12px', backgroundColor: '#dff6dd', border: '1px solid #c3e6cb', color: '#107c41', fontSize: '12px', marginBottom: '16px' }}>
          {successMessage}
        </div>
      )}

      {/* タブ 1: 概要（閲覧専用） */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ border: '1px solid #e1dfdd', padding: '16px', backgroundColor: '#faf9f8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '13px', fontWeight: 'bold', color: '#323130' }}>現在のステータス</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #edebe9' }}>
                  <th style={{ padding: '6px 0', width: '160px', color: '#605e5c', fontWeight: 'bold' }}>現在の認証方式</th>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>{AUTH_MODE_LABELS[authMode] || '不明'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #edebe9' }}>
                  <th style={{ padding: '6px 0', color: '#605e5c', fontWeight: 'bold' }}>API Key</th>
                  <td style={{ padding: '6px 0' }}>
                    {apiKey ? (
                      <span style={{ color: '#107c41', fontWeight: 'bold' }}>● 発行済み (末尾: ...{apiKey.slice(-6)})</span>
                    ) : (
                      <span style={{ color: '#a19f9d' }}>未発行</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ padding: '6px 0', color: '#605e5c', fontWeight: 'bold' }}>有効化済みサービス</th>
                  <td style={{ padding: '6px 0' }}>
                    {tenant.services && tenant.services.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {tenant.services.map((s) => (
                          <span key={s} style={{ backgroundColor: '#f3f2f1', border: '1px solid #e1dfdd', padding: '1px 6px', fontSize: '11px', color: '#323130' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#a19f9d' }}>なし</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. 認証方式の変更 */}
          <div style={{ border: '1px solid #e1dfdd', padding: '16px', backgroundColor: '#faf9f8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' }}>認証方式の変更</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
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
          <div style={{ border: '1px solid #e1dfdd', padding: '16px', backgroundColor: '#faf9f8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' }}>API Key の管理</h3>
            <button 
              onClick={handleGenerateApiKey} 
              disabled={actionLoading}
              style={{
                padding: '4px 12px',
                backgroundColor: '#0078d4',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {apiKey ? 'API Key を再発行' : 'API Key を新規発行'}
            </button>

            {apiKey && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  style={{ 
                    flex: 1, 
                    fontFamily: 'monospace', 
                    padding: '4px 8px', 
                    border: '1px solid #8a8886',
                    backgroundColor: '#ffffff',
                    fontSize: '12px'
                  }}
                />
                <button 
                  onClick={handleCopyApiKey}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #8a8886',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {isCopied ? 'コピー完了' : 'コピー'}
                </button>
              </div>
            )}
          </div>

          {/* 3. 追加サービス有効化 */}
          <div style={{ border: '1px solid #e1dfdd', padding: '16px', backgroundColor: '#faf9f8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' }}>追加サービス有効化</h3>
            {unenabledServices.length > 0 ? (
              <form onSubmit={handleEnableService} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  disabled={actionLoading}
                  style={{ padding: '4px 8px', border: '1px solid #8a8886', minWidth: '220px', fontSize: '12px' }}
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
                    padding: '4px 12px',
                    backgroundColor: '#107c41',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  有効化
                </button>
              </form>
            ) : (
              <p style={{ margin: 0, color: '#605e5c', fontSize: '12px' }}>追加可能なサービスはすべて有効化されています。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};