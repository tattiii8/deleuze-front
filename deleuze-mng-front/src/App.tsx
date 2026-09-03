import React, { useEffect, useState } from 'react';

import Header, { MainTabType } from './components/Header';
import { TenantManagement } from './pages/TenantManagement';
import TenantDetail from './pages/TenantDetail';
import UserManagement from './pages/UserManagement';
import ApiKeyManagementPage from './pages/ApiKeyManagementPage';
import SystemAuthManagement from './pages/SystemAuthManagement';

import {
  fetchTenants,
  createTenant,
  deleteTenant,
  fetchUsers,
  registerUser,
  deleteUser
} from './api';

import { Tenant, User } from './types';

// URLのハッシュ解析
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');

  let tab: MainTabType = 'tenants';
  let tenantId: string | null = null;

  if (parts[0] === 'users') {
    tab = 'users';
  } else if (parts[0] === 'apikeys') {
    tab = 'apikeys';
  } else if (parts[0] === 'system') {
    tab = 'system';
  } else if (parts[0] === 'tenants') {
    tab = 'tenants';
    tenantId = parts[1] ? decodeURIComponent(parts[1]) : null;
  }

  return {
    tab,
    tenantId
  };
};

export const App: React.FC = () => {
  const initialRoute = parseHash();

  const [activeTab, setActiveTab] = useState<MainTabType>(initialRoute.tab);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(initialRoute.tenantId);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // URLハッシュの更新
  useEffect(() => {
    if (activeTab === 'tenants') {
      if (selectedTenantId) {
        window.location.hash = `#/tenants/${encodeURIComponent(selectedTenantId)}`;
      } else {
        window.location.hash = '#/tenants';
      }
    } else {
      window.location.hash = `#/${activeTab}`;
    }
  }, [activeTab, selectedTenantId]);

  // URLハッシュ変更検知
  useEffect(() => {
    const handleHashChange = () => {
      const { tab, tenantId } = parseHash();
      setActiveTab(tab);
      setSelectedTenantId(tenantId);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // テナント一覧取得
  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err?.message || 'テナント一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 全ユーザー一覧の横断取得
  const loadGlobalUsers = async (tenantList: Tenant[]) => {
    if (tenantList.length === 0) return;
    setUsersLoading(true);
    try {
      const userPromises = tenantList.map(async (t) => {
        try {
          return await fetchUsers(t.tenantId);
        } catch {
          return [];
        }
      });

      const userLists = await Promise.all(userPromises);
      const allUsers = userLists.flat();
      setGlobalUsers(allUsers);
    } catch (err: any) {
      console.warn('全ユーザー一覧の取得中にエラーが発生しました:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (tenants.length > 0 && activeTab === 'users') {
      loadGlobalUsers(tenants);
    }
  }, [tenants, activeTab]);

  // テナント作成
  const handleCreateTenant = async (payload: {
    tenantId: string;
    tenantName?: string;
    displayName?: string;
  }) => {
    await createTenant(payload);
    await loadTenants();
  };

  // テナント削除
  const handleDeleteTenant = async (tenantId: string) => {
    await deleteTenant(tenantId);
    if (selectedTenantId === tenantId) {
      setSelectedTenantId(null);
    }
    await loadTenants();
  };

  // ユーザー登録
  const handleRegisterUser = async (
    tenantId: string,
    payload: {
      loginId: string;
      password: string;
      userName?: string;
      email?: string;
    }
  ) => {
    await registerUser(tenantId, payload);
    await loadGlobalUsers(tenants);
  };

  // ユーザー削除
  const handleDeleteUser = async (tenantId: string, subjectId: string) => {
    await deleteUser(tenantId, subjectId);
    await loadGlobalUsers(tenants);
  };

  const handleSelectTab = (tab: MainTabType) => {
    setActiveTab(tab);
    if (tab !== 'tenants') {
      setSelectedTenantId(null);
    }
  };

  const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId) || null;

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#f4f6f8',
        boxSizing: 'border-box',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Meiryo", sans-serif',
        fontSize: '12px',
        color: '#323130'
      }}
    >
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />

      <main style={{ padding: '20px', paddingBottom: '80px' }}>
        {/* 1. テナント管理 */}
        {activeTab === 'tenants' && (
          selectedTenantId ? (
            selectedTenant ? (
              <TenantDetail
                tenant={selectedTenant}
                onBack={() => setSelectedTenantId(null)}
                onRefresh={loadTenants}
              />
            ) : (
              <div style={{ padding: '20px', fontSize: '12px', color: '#605e5c' }}>
                テナント情報を読み込み中...
              </div>
            )
          ) : (
            <TenantManagement
              tenants={tenants}
              loading={loading}
              error={error}
              onSelectTenant={(tenant) => setSelectedTenantId(tenant.tenantId)}
              onRefresh={loadTenants}
              onCreateTenant={handleCreateTenant}
              onDeleteTenant={handleDeleteTenant}
            />
          )
        )}

        {/* 2. ユーザー管理 */}
        {activeTab === 'users' && (
          <UserManagement
            users={globalUsers}
            tenants={tenants}
            loading={usersLoading}
            error={error}
            onRefresh={() => loadGlobalUsers(tenants)}
            onRegisterUser={handleRegisterUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* 3. API Key 管理 */}
        {activeTab === 'apikeys' && (
          <ApiKeyManagementPage tenants={tenants} />
        )}

        {/* 4. システム・Auth管理 */}
        {activeTab === 'system' && (
          <SystemAuthManagement />
        )}
      </main>
    </div>
  );
};

export default App;