// src/components/Header.tsx
import React from 'react';

// Propsが不要になったため空にするか、インターフェース自体を削除します
export const Header: React.FC = () => {
  return (
    <header style={{
      backgroundColor: '#0066cc',
      color: '#ffffff',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
        Deleuze Management Console
      </h1>
      <nav style={{ display: 'flex', gap: '8px' }}>
        {/*
          タブ切り替えが不要になったため、ナビゲーションボタンを削除またはコメントアウト
          必要であれば「テナント管理」のラベルだけ残すことも可能です
        */}
        <div
          style={{
            color: '#ffffff',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          テナント管理
        </div>
      </nav>
    </header>
  );
};

export default Header;