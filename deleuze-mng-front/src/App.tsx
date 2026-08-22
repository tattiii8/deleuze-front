// src/App.tsx
import React, { useEffect, useState } from 'react';
// 名前付きエクスポート { Header } に修正
import { Header } from './components/Header';
// 名前付きエクスポート { TenantManagement } に修正
import { TenantManagement } from './pages/TenantManagement';
// 名前付きエクスポート { UserManagement } に修正
import { UserManagement } from './pages/UserManagement';
import { TenantDetail } from './pages/TenantDetail';
import { fetchTenants, enableService } from './api';
import { Tenant } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'tenants' | 'users'>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
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

  useEffect(() => {
    loadTenants();
  }, []);

  // サービス追加ハンドラー
  const handleAddService = async (tenantId: string, serviceKey: string) => {
    await enableService(tenantId, serviceKey);
    await loadTenants();
  };

  // 現在選択されているテナントの最新オブジェクトを取得
  const selectedTenant = tenants.find((t) => t.tenantId === selectedTenantId) || null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main style={{ padding: '20px' }}>
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
              />
            )}
          </>
        )}

        {currentTab === 'users' && <UserManagement />}
      </main>
    </div>
  );
};

export default App;