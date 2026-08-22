// src/pages/UserManagement.tsx
import React, { useState } from 'react';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([]);
  const [loading] = useState<boolean>(false);

  if (loading) {
    return <div style={{ padding: '20px' }}>ユーザー一覧を読み込み中...</div>;
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
        <h2 style={{ margin: 0 }}>ユーザー管理</h2>
      </div>

      {users.length === 0 ? (
        <p style={{ color: '#666' }}>登録されているユーザーはありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>ログイン ID</th>
              <th style={{ padding: '12px' }}>所属テナント</th>
              <th style={{ padding: '12px' }}>作成日時</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '12px' }}>{user.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.loginId}</td>
                <td style={{ padding: '12px' }}>{user.tenantId}</td>
                <td style={{ padding: '12px' }}>{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;