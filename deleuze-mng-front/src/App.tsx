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

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'tenants' | 'users'>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // テナント一覧の取得 & 選択中テナントのデータ同期
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

  // ユーザー一覧の取得
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'ユーザー一覧の取得に失敗しました。');
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

  // テナント作成ハンドラー
  const handleCreateTenant = async (payload: { tenantId: string; name?: string; services?: string[] }) => {
    await createTenant(payload);
    await loadTenants();
  };

  // テナント削除ハンドラー
  const handleDeleteTenant = async (tenantId: string) => {
    await deleteTenant(tenantId);
    if (selectedTenantId === tenantId) {
      setSelectedTenantId(null);
    }
    await loadTenants();
  };

  // サービス追加ハンドラー
  const handleAddService = async (tenantId: string, serviceKey: string) => {
    await enableService(tenantId, serviceKey);
    await loadTenants();
  };

  // ユーザー作成ハンドラー
  const handleRegisterUser = async (payload: { loginId: string; password: string; tenantId: string }) => {
    await registerUser(payload);
    await loadUsers();
  };

  // ユーザー削除ハンドラー
  const handleDeleteUser = async (id: string | number) => {
    await deleteUser(id);
    await loadUsers();
  };

  // 現在選択されているテナントの最新オブジェクトを取得
  const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId) || null;

  return (
    <div style={{ 
      height: '100vh', 
      overflowY: 'auto', // 👈 ここで全体をスクロール可能にする
      backgroundColor: '#f4f6f8',
      boxSizing: 'border-box' 
    }}>
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main style={{ padding: '20px', paddingBottom: '80px' }}> {/* 👈 下部に見切れ防止の余白を確保 */}
        {currentTab === 'tenants' && (
          <>
            {selectedTenant ? (
              <TenantDetail
                tenant={selectedTenant}
                onBack={() => setSelectedTenantId(null)}
                onAddService={handleAddService}
                onRefresh={loadTenants}
              />
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