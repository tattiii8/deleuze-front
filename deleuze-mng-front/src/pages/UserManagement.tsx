import React, { useState } from 'react';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([]);
  const [loading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUsers = users.filter(
    (user) =>
      user.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tenantId.toLowerCase().includes(searchQuery.toLowerCase())
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
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
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
    userLink: {
      color: '#0078d4',
      fontWeight: 600,
      textDecoration: 'none',
      cursor: 'pointer'
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
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '16px', color: '#605e5c' }}>ユーザー一覧を読み込み中...</div>
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

      {/* Azure コマンドバー/ツールバー風エリア */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="ログイン ID またはテナントで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.primaryButton}>
            ＋ ユーザーを追加
          </button>
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
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ backgroundColor: '#ffffff' }}>
                <td style={{ ...styles.td, fontFamily: 'monospace', color: '#605e5c', fontSize: '12px' }}>
                  {user.id}
                </td>
                <td style={styles.td}>
                  <span style={styles.userLink}>{user.loginId}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{user.tenantId}</span>
                </td>
                <td style={{ ...styles.td, color: '#605e5c', fontSize: '12px' }}>
                  {user.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;