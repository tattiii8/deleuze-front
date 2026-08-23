import React, { useState } from 'react';
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
  const [searchFilter, setSearchFilter] = useState('');

  // フィルタリング処理
  const filteredTenants = tenants.filter((tenant) =>
    tenant.tenantId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
      color: '#323130',
      fontSize: '13px',
      lineHeight: '1.6'
    },
    header: {
      marginBottom: '16px'
    },
    title: {
      margin: '0 0 4px 0',
      fontSize: '20px',
      fontWeight: 600,
      color: '#1b1b1b'
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e1dfdd',
      marginBottom: '16px',
      gap: '12px'
    },
    searchInput: {
      height: '32px',
      padding: '0 8px',
      border: '1px solid #605e5c',
      borderRadius: '2px',
      fontSize: '13px',
      width: '260px',
      outline: 'none'
    },
    refreshButton: {
      height: '32px',
      padding: '0 12px',
      backgroundColor: '#ffffff',
      border: '1px solid #8a8886',
      borderRadius: '2px',
      color: '#0078d4',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      textAlign: 'left' as const,
      fontSize: '13px',
      border: '1px solid #e1dfdd'
    },
    th: {
      backgroundColor: '#faf9f8',
      padding: '10px 12px',
      fontWeight: 600,
      color: '#323130',
      borderBottom: '1px solid #e1dfdd',
      fontSize: '12px'
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #edebe9',
      verticalAlign: 'middle'
    },
    tenantLink: {
      background: 'none',
      border: 'none',
      color: '#0078d4',
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0,
      fontFamily: 'monospace',
      fontSize: '13px',
      textAlign: 'left' as const
    },
    badge: (bgColor: string, textColor: string, borderColor: string) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 8px',
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '2px',
      fontSize: '11px',
      fontWeight: 600
    }),
    primaryButton: {
      height: '28px',
      padding: '0 12px',
      backgroundColor: '#0078d4',
      color: '#ffffff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '16px', color: '#605e5c' }}>テナント一覧を読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '12px 16px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', borderRadius: '2px' }}>
          <p style={{ margin: '0 0 8px 0' }}>{error}</p>
          <button onClick={onRefresh} style={styles.refreshButton}>再試行</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>テナント管理一覧</h2>
        <span style={{ color: '#605e5c', fontSize: '13px' }}>
          登録済みの全テナントと認証設定、有効化サービスの一覧を表示します。
        </span>
      </div>

      {/* Azure ツールバー風エリア */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="テナント ID で検索..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={onRefresh} style={styles.refreshButton}>
          ↻ 更新
        </button>
      </div>

      {filteredTenants.length === 0 ? (
        <div style={{ padding: '24px 0', color: '#605e5c', textAlign: 'center' }}>
          {searchFilter ? '該当するテナントが見つかりませんでした。' : '登録されているテナントはありません。'}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>テナント ID</th>
              <th style={styles.th}>認証方式</th>
              <th style={styles.th}>API Key</th>
              <th style={styles.th}>有効化済みサービス</th>
              <th style={{ ...styles.th, textAlign: 'center', width: '100px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => {
              const authMode = (tenant as any).authMode ?? (tenant as any).AuthMode ?? 0;
              const apiKey = (tenant as any).apiKey ?? (tenant as any).ApiKey;

              const modeLabel =
                authMode === 2 ? 'Hybrid' :
                authMode === 1 ? 'API Key のみ' : 'JWT のみ';

              return (
                <tr key={tenant.tenantId} style={{ backgroundColor: '#ffffff' }}>
                  <td style={styles.td}>
                    <button
                      onClick={() => onSelectTenant(tenant)}
                      style={styles.tenantLink}
                    >
                      {tenant.tenantId}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600 }}>{modeLabel}</span>
                  </td>
                  <td style={styles.td}>
                    {apiKey ? (
                      <span style={styles.badge('#dff6dd', '#107c41', '#c3e6cb')}>
                        ● 発行済み
                      </span>
                    ) : (
                      <span style={styles.badge('#f3f2f1', '#605e5c', '#e1dfdd')}>
                        未発行
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {tenant.services && tenant.services.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {tenant.services.map((s) => (
                          <span
                            key={s}
                            style={{
                              backgroundColor: '#faf9f8',
                              border: '1px solid #8a8886',
                              padding: '1px 6px',
                              borderRadius: '2px',
                              fontSize: '11px',
                              color: '#323130'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#a19f9d' }}>なし</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectTenant(tenant)}
                      style={styles.primaryButton}
                    >
                      詳細
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