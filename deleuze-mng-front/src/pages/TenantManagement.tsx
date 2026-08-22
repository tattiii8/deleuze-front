// src/pages/TenantManagement.tsx
import React from 'react';
import { Tenant } from '../types';

interface TenantManagementProps {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  onSelectTenant: (tenant: Tenant) => void;
  onRefresh: () => Promise<void>;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  loading,
  error,
  onSelectTenant,
  onRefresh
}) => {
  if (loading) {
    return <div style={{ padding: '20px' }}>テナント一覧を読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>{error}</p>
        <button onClick={onRefresh}>再試行</button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '900px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>テナント管理一覧</h2>
        <button 
          onClick={onRefresh}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          更新
        </button>
      </div>

      {tenants.length === 0 ? (
        <p style={{ color: '#666' }}>登録されているテナントはありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>テナント ID</th>
              <th style={{ padding: '12px' }}>認証方式</th>
              <th style={{ padding: '12px' }}>API Key</th>
              <th style={{ padding: '12px' }}>有効サービス</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const authMode = (tenant as any).authMode ?? (tenant as any).AuthMode ?? 0;
              const apiKey = (tenant as any).apiKey ?? (tenant as any).ApiKey;

              const modeLabel =
                authMode === 2 ? 'Hybrid' :
                authMode === 1 ? 'API Key のみ' : 'JWT のみ';

              return (
                <tr key={tenant.tenantId} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{tenant.tenantId}</td>
                  <td style={{ padding: '12px' }}>{modeLabel}</td>
                  <td style={{ padding: '12px' }}>
                    {apiKey ? (
                      <span style={{ color: '#28a745', fontSize: '13px' }}>● 発行済み</span>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>未発行</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {tenant.services && tenant.services.length > 0 ? (
                      tenant.services.map((s) => (
                        <span key={s} style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', marginRight: '4px' }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>なし</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectTenant(tenant)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#0066cc',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      詳細・設定
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};