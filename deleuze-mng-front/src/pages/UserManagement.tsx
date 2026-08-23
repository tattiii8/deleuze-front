import React, { useState } from 'react';
import { User } from '../types';

export const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([]);
  const [loading] = useState<boolean>(false);

  if (loading) {
    return <div style={{ padding: '16px', fontSize: '12px' }}>ユーザー一覧を読み込み中...</div>;
  }

  return (
    <div style={{
      padding: '16px',
      maxWidth: '1000px',
      margin: '16px auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e1dfdd',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#1b1b1b'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px', 
        borderBottom: '1px solid #edebe9', 
        paddingBottom: '8px' 
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>ユーザー管理</h2>
      </div>

      {users.length === 0 ? (
        <p style={{ color: '#605e5c', fontSize: '12px' }}>登録されているユーザーはありません。</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f2f1', borderBottom: '1px solid #e1dfdd' }}>
              <th style={{ padding: '8px', fontWeight: 'bold' }}>ID</th>
              <th style={{ padding: '8px', fontWeight: 'bold' }}>ログイン ID</th>
              <th style={{ padding: '8px', fontWeight: 'bold' }}>所属テナント</th>
              <th style={{ padding: '8px', fontWeight: 'bold' }}>作成日時</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #edebe9' }}>
                <td style={{ padding: '8px', fontFamily: 'monospace', color: '#605e5c' }}>{user.id}</td>
                <td style={{ padding: '8px', fontWeight: 'bold', color: '#0078d4' }}>{user.loginId}</td>
                <td style={{ padding: '8px' }}>{user.tenantId}</td>
                <td style={{ padding: '8px', color: '#605e5c' }}>{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;