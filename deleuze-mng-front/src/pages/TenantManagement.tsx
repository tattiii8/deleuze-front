import React, { useState } from 'react';
import { Tenant } from '../types';

interface TenantManagementProps {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  onSelectTenant: (tenant: Tenant) => void;
  onRefresh: () => Promise<void>;
  onCreateTenant: (payload: {
    tenantId: string;
    tenantName?: string;
    displayName?: string;
  }) => Promise<void>;
  onDeleteTenant: (tenantId: string) => Promise<void>;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants = [],
  loading,
  error,
  onSelectTenant,
  onRefresh,
  onCreateTenant,
  onDeleteTenant
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenantId, setNewTenantId] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDisplayName, setNewTenantDisplayName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredTenants = tenants.filter((tenant) =>
    (tenant?.tenantId || '')
      .toLowerCase()
      .includes(searchFilter.toLowerCase())
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setActionError(null);
    setNewTenantId('');
    setNewTenantName('');
    setNewTenantDisplayName('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTenantId.trim()) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await onCreateTenant({
        tenantId: newTenantId.trim(),
        tenantName: newTenantName.trim() || undefined,
        displayName: newTenantDisplayName.trim() || undefined
      });

      closeModal();
      await onRefresh();
    } catch (err: any) {
      setActionError(
        err.message || 'テナントの作成に失敗しました。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (
      !window.confirm(
        `テナント '${tenantId}' を削除してもよろしいですか？この操作は取り消せません。`
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await onDeleteTenant(tenantId);
      await onRefresh();
    } catch (err: any) {
      alert(
        err.message || 'テナントの削除に失敗しました。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      fontFamily:
        '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
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
      color: '#323130',
      fontSize: '13px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },

    createButton: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#0078d4',
      color: '#ffffff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
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
    },

    deleteButton: {
      height: '28px',
      padding: '0 12px',
      backgroundColor: '#ffffff',
      color: '#a80000',
      border: '1px solid #f8d7da',
      borderRadius: '2px',
      fontSize: '12px',
      cursor: 'pointer'
    },

    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },

    modalContainer: {
      backgroundColor: '#ffffff',
      padding: '24px',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid #8a8886',
      boxShadow:
        '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)'
    },

    inputField: {
      width: '100%',
      height: '32px',
      padding: '0 8px',
      border: '1px solid #605e5c',
      borderRadius: '2px',
      fontSize: '13px',
      outline: 'none',
      marginTop: '4px',
      boxSizing: 'border-box' as const
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '16px', color: '#605e5c' }}>
          テナント一覧を読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fde7e9',
            border: '1px solid #f8d7da',
            color: '#a80000',
            borderRadius: '2px'
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            {error}
          </p>

          <button
            onClick={onRefresh}
            style={styles.refreshButton}
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          テナント管理一覧
        </h2>

        <span
          style={{
            color: '#605e5c',
            fontSize: '13px'
          }}
        >
          登録済みの全テナント一覧を表示します。
        </span>
      </div>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="テナント ID で検索..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={styles.searchInput}
        />

        <div
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            style={styles.createButton}
          >
            ＋ テナントを作成
          </button>

          <button
            onClick={onRefresh}
            style={styles.refreshButton}
          >
            ↻ 更新
          </button>
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div
          style={{
            padding: '24px 0',
            color: '#605e5c',
            textAlign: 'center'
          }}
        >
          {searchFilter
            ? '該当するテナントが見つかりませんでした。'
            : '登録されているテナントはありません。'}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                テナント ID
              </th>

              <th style={styles.th}>
                表示名
              </th>

              <th style={styles.th}>
                作成日時
              </th>

              <th style={styles.th}>
                更新日時
              </th>

              <th
                style={{
                  ...styles.th,
                  textAlign: 'center',
                  width: '160px'
                }}
              >
                操作
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTenants.map((tenant) => {
              return (
                <tr
                  key={tenant.tenantId}
                  style={{
                    backgroundColor: '#ffffff'
                  }}
                >
                  <td style={styles.td}>
                    <button
                      onClick={() =>
                        onSelectTenant(tenant)
                      }
                      style={styles.tenantLink}
                    >
                      {tenant.tenantId}
                    </button>
                  </td>

                  <td style={styles.td}>
                    {tenant.displayName}
                  </td>

                  <td style={styles.td}>
                    {new Date(
                      tenant.createdAt
                    ).toLocaleString('ja-JP')}
                  </td>

                  <td style={styles.td}>
                    {new Date(
                      tenant.updatedAt
                    ).toLocaleString('ja-JP')}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                    >
                      <button
                        onClick={() =>
                          onSelectTenant(tenant)
                        }
                        style={styles.primaryButton}
                      >
                        詳細
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            tenant.tenantId
                          )
                        }
                        disabled={actionLoading}
                        style={styles.deleteButton}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={closeModal}
        >
          <div
            style={styles.modalContainer}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: 600
              }}
            >
              新規テナントの作成
            </h3>

            {actionError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fde7e9',
                  border: '1px solid #f8d7da',
                  color: '#a80000',
                  fontSize: '12px',
                  marginBottom: '16px'
                }}
              >
                {actionError}
              </div>
            )}

            <form
              onSubmit={handleCreateSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  テナント ID{' '}
                  <span
                    style={{
                      color: '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="text"
                  required
                  placeholder="例: tenant-org-01"
                  value={newTenantId}
                  onChange={(e) =>
                    setNewTenantId(
                      e.target.value
                    )
                  }
                  style={styles.inputField}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  テナント名
                </label>

                <input
                  type="text"
                  placeholder="例: sample"
                  value={newTenantName}
                  onChange={(e) =>
                    setNewTenantName(
                      e.target.value
                    )
                  }
                  style={styles.inputField}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  表示名
                </label>

                <input
                  type="text"
                  placeholder="例: 株式会社サンプル"
                  value={newTenantDisplayName}
                  onChange={(e) =>
                    setNewTenantDisplayName(
                      e.target.value
                    )
                  }
                  style={styles.inputField}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  style={styles.refreshButton}
                >
                  キャンセル
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading ||
                    !newTenantId.trim()
                  }
                  style={styles.createButton}
                >
                  {actionLoading
                    ? '作成中...'
                    : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};