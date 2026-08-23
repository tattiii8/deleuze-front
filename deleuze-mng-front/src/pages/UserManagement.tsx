import React, { useState } from 'react';
import { User, Tenant } from '../types';

interface UserManagementProps {
  users: User[];
  tenants?: Tenant[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void>;
  onRegisterUser?: (payload: { loginId: string; password: string; tenantId: string }) => Promise<void>;
  onDeleteUser?: (id: string | number) => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users = [],
  tenants = [],
  loading = false,
  error = null,
  onRefresh,
  onRegisterUser,
  onDeleteUser
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // モーダルおよびフォームのステート
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.loginId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tenantId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) return;

    setActionLoading(true);
    setActionError(null);

    try {
      if (onRegisterUser) {
        await onRegisterUser({
          loginId: loginId.trim(),
          password: password.trim(),
          tenantId: selectedTenantId || (tenants[0]?.tenantId || '')
        });
      }
      setIsModalOpen(false);
      setLoginId('');
      setPassword('');
      setSelectedTenantId('');
    } catch (err: any) {
      setActionError(err.message || 'ユーザーの登録に失敗しました。');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string | number, userLoginId: string) => {
    if (!window.confirm(`ユーザー '${userLoginId}' を削除してもよろしいですか？`)) {
      return;
    }

    setActionLoading(true);
    try {
      if (onDeleteUser) {
        await onDeleteUser(id);
      }
    } catch (err: any) {
      alert(err.message || 'ユーザーの削除に失敗しました。');
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
    description: {
      color: '#605e5c',
      fontSize: '13px',
      margin: 0
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
    primaryButton: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#0078d4',
      color: '#ffffff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    },
    secondaryButton: {
      height: '32px',
      padding: '0 12px',
      backgroundColor: '#ffffff',
      border: '1px solid #8a8886',
      borderRadius: '2px',
      color: '#323130',
      fontSize: '13px',
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
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 8px',
      backgroundColor: '#f3f2f1',
      border: '1px solid #8a8886',
      borderRadius: '2px',
      fontSize: '11px',
      color: '#323130',
      fontFamily: 'monospace'
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
      maxWidth: '440px',
      border: '1px solid #8a8886',
      boxShadow: '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)'
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
        <div style={{ padding: '16px', color: '#605e5c' }}>ユーザー一覧を読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '12px 16px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', borderRadius: '2px' }}>
          <p style={{ margin: '0 0 8px 0' }}>{error}</p>
          {onRefresh && <button onClick={onRefresh} style={styles.secondaryButton}>再試行</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>ユーザー管理</h2>
        <p style={styles.description}>
          システムに登録されている全ユーザーアカウントおよび所属テナントを管理します。
        </p>
      </div>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="ログイン ID またはテナントで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsModalOpen(true)} style={styles.primaryButton}>
            ＋ ユーザーを追加
          </button>
          {onRefresh && (
            <button onClick={onRefresh} style={styles.secondaryButton}>
              ↻ 更新
            </button>
          )}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ padding: '32px 0', color: '#605e5c', textAlign: 'center', backgroundColor: '#faf9f8', border: '1px solid #e1dfdd', borderRadius: '2px' }}>
          {searchQuery ? '該当するユーザーが見つかりませんでした。' : '登録されているユーザーはありません。'}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>ログイン ID</th>
              <th style={styles.th}>所属テナント ID</th>
              <th style={styles.th}>作成日時</th>
              <th style={{ ...styles.th, textAlign: 'center', width: '90px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ backgroundColor: '#ffffff' }}>
                <td style={{ ...styles.td, fontFamily: 'monospace', color: '#605e5c', fontSize: '12px' }}>
                  {user.id}
                </td>
                <td style={{ ...styles.td, fontWeight: 600, color: '#0078d4' }}>
                  {user.loginId}
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{user.tenantId}</span>
                </td>
                <td style={{ ...styles.td, color: '#605e5c', fontSize: '12px' }}>
                  {user.createdAt}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(user.id, user.loginId)}
                    disabled={actionLoading}
                    style={styles.deleteButton}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ユーザー追加モーダル */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>新規ユーザー登録</h3>

            {actionError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#fde7e9', border: '1px solid #f8d7da', color: '#a80000', fontSize: '12px', marginBottom: '16px' }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>
                  ログイン ID <span style={{ color: '#a80000' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: user01@example.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>
                  パスワード <span style={{ color: '#a80000' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: '12px' }}>所属テナント</label>
                {tenants.length > 0 ? (
                  <select
                    value={selectedTenantId || tenants[0]?.tenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    style={styles.inputField}
                  >
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.tenantId}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="テナント ID"
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    style={styles.inputField}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  style={styles.secondaryButton}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !loginId.trim() || !password.trim()}
                  style={styles.primaryButton}
                >
                  {actionLoading ? '登録中...' : '登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;