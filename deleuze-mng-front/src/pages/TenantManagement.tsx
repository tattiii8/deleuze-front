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
    return <div style={{ padding: '16px', fontSize: '13px' }}>テナント一覧を読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#a80000', fontSize: '13px' }}>
        <p>{error}</p>
        <button onClick={onRefresh}>再試行</button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      maxWidth: '1000px',
      margin: '16px auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e1dfdd',
      borderRadius: '0px',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #edebe9', paddingBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>テナント管理一覧</h2>
        <button 
          onClick={onRefresh}
          style={{
            padding: '4px 10px',
            backgroundColor: '#ffffff',
            border: '1px solid #8a8886',
            borderRadius: '0px',
            color: '#0078d4',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          更新
        </button>
      </div>

      {tenants.length === 0 ? (
        <p style={{ color: '#605e5c', fontSize: '13px' }}>登録されているテナントはありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f2f1', borderBottom: '1px solid #e1dfdd' }}>
              <th style={{ padding: '8px' }}>テナント ID</th>
              <th style={{ padding: '8px' }}>認証方式</th>
              <th style={{ padding: '8px' }}>API Key</th>
              <th style={{ padding: '8px' }}>有効サービス</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>操作</th>
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
                <tr key={tenant.tenantId} style={{ borderBottom: '1px solid #edebe9' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#0078d4' }}>{tenant.tenantId}</td>
                  <td style={{ padding: '8px' }}>{modeLabel}</td>
                  <td style={{ padding: '8px' }}>
                    {apiKey ? (
                      <span style={{ color: '#107c41', fontSize: '12px' }}>● 発行済み</span>
                    ) : (
                      <span style={{ color: '#a19f9d', fontSize: '12px' }}>未発行</span>
                    )}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {tenant.services && tenant.services.length > 0 ? (
                      tenant.services.map((s) => (
                        <span key={s} style={{ backgroundColor: '#f3f2f1', border: '1px solid #e1dfdd', padding: '2px 6px', borderRadius: '0px', fontSize: '11px', marginRight: '4px' }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#a19f9d', fontSize: '12px' }}>なし</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectTenant(tenant)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#0078d4',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '12px',
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