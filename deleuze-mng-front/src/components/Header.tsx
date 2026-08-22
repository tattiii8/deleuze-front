// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  currentTab: 'tenants' | 'users';
  onSelectTab: (tab: 'tenants' | 'users') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
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
        <button
          onClick={() => onSelectTab('tenants')}
          style={{
            backgroundColor: currentTab === 'tenants' ? '#004080' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentTab === 'tenants' ? 'bold' : 'normal'
          }}
        >
          テナント管理
        </button>
        <button
          onClick={() => onSelectTab('users')}
          style={{
            backgroundColor: currentTab === 'users' ? '#004080' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentTab === 'users' ? 'bold' : 'normal'
          }}
        >
          ユーザー管理
        </button>
      </nav>
    </header>
  );
};

export default Header;