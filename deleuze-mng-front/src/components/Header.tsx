import React from 'react';

export type MainTabType = 'tenants' | 'users' | 'apikeys' | 'system';

interface HeaderProps {
  activeTab?: MainTabType;
  onSelectTab?: (tab: MainTabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'tenants',
  onSelectTab
}) => {
  const tabs: { id: MainTabType; label: string; icon: string }[] = [
    { id: 'tenants', label: 'テナント管理', icon: '🏢' },
    { id: 'users', label: 'ユーザー管理', icon: '👤' },
    { id: 'apikeys', label: 'API Key 管理', icon: '🔑' },
    { id: 'system', label: 'システム・Auth管理', icon: '⚙️' }
  ];

  return (
    <header
      style={{
        backgroundColor: '#0066cc',
        color: '#ffffff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: '52px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '0.5px' }}>
          Deleuze Operator Console
        </h1>
        <span
          style={{
            fontSize: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 600
          }}
        >
          Internal Admin
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '4px', height: '100%' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              style={{
                color: '#ffffff',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #ffffff' : '3px solid transparent',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;