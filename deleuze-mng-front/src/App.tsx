import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TenantManagement } from './pages/TenantManagement';
import { UserManagement } from './pages/UserManagement';
import { TenantDetail } from './pages/TenantDetail';
import { 
  fetchTenants, 
  enableService, 
  createTenant, 
  deleteTenant,
  fetchUsers,
  registerUser,
  deleteUser
} from './api';
import { Tenant, User } from './types';

// URLのハッシュ（例: #tenants/flaubert や #users）を解析するヘルパー
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  const tab = parts[0] === 'users' ? 'users' : 'tenants';
  const tenantId = parts[0] === 'tenants' && parts[1] ? decodeURIComponent(parts[1]) : null;
  return { tab, tenantId };
};

export const App: React.FC = () => {
  // 💡 1. 初期表示時に URL ハッシュから復元
  const initialRoute = parseHash();
  const [currentTab, setCurrentTab] = useState<'tenants' | 'users'>(initialRoute.tab as 'tenants' | 'users');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(initialRoute.tenantId);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 💡 2. 状態（currentTab / selectedTenantId）が変わったら URL ハッシュを更新
  useEffect(() => {
    if (currentTab === 'users') {
      window.location.hash = '#/users';
    } else if (selectedTenantId) {
      window.location.hash = `#/tenants/${encodeURIComponent(selectedTenantId)}`;
    } else {
      window.location.hash = '#/tenants';
    }
  }, [currentTab, selectedTenantId]);

  // 💡 3. ブラウザの「戻る・進む」ボタンや手入力されたハッシュ変更の検知
  useEffect(() => {
    const handleHashChange = () => {
      const { tab, tenantId } = parseHash();
      setCurrentTab(tab as 'tenants' | 'users');
      setSelectedTenantId(tenantId);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // データ取得ロジック
  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await fetchTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'テナント一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'ユーザー一覧の取得に失敗しました。 Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'tenants') {
      loadTenants();
    } else if (currentTab === 'users') {
      loadUsers();
    }
  }, [currentTab]);

  // ハンドラー関係
  const handleCreateTenant = async (payload: { tenantId: string; name?: string; services?: string[] }) => {
    await createTenant(payload);
    await loadTenants();
  };

  const handleDeleteTenant = async (tenantId: string) => {
    await deleteTenant(tenantId);
    if (selectedTenantId === tenantId) {
      setSelectedTenantId(null);
    }
    await loadTenants();
  };

  const handleAddService = async (tenantId: string, serviceKey: string) => {
    await enableService(tenantId, serviceKey);
    await loadTenants();
  };

  const handleRegisterUser = async (payload: { loginId: string; password: string; tenantId: string }) => {
    await registerUser(payload);
    await loadUsers();
  };

  const handleDeleteUser = async (id: string | number) => {
    await deleteUser(id);
    await loadUsers();
  };

  const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId) || null;

  return (
    <div style={{ 
      height: '100vh', 
      overflowY: 'auto', 
      backgroundColor: '#f4f6f8',
      boxSizing: 'border-box' 
    }}>
      <Header 
        currentTab={currentTab} 
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'users') setSelectedTenantId(null);
        }} 
      />

      <main style={{ padding: '20px', paddingBottom: '80px' }}>
        {currentTab === 'tenants' && (
          <>
            {selectedTenantId ? (
              // APIレスポンス待ちで selectedTenant がまだ見つからない間もIDを維持
              selectedTenant ? (
                <TenantDetail
                  tenant={selectedTenant}
                  onBack={() => setSelectedTenantId(null)}
                  onAddService={handleAddService}
                  onRefresh={loadTenants}
                />
              ) : (
                <div style={{ padding: '20px', fontSize: '13px', color: '#605e5c' }}>
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
            )}
          </>
        )}

        {currentTab === 'users' && (
          <UserManagement
            users={users}
            tenants={tenants}
            loading={loading}
            error={error}
            onRefresh={loadUsers}
            onRegisterUser={handleRegisterUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>
    </div>
  );
};

export default App;