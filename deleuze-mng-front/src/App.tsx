import React, { useEffect, useState } from 'react';

import { Header } from './components/Header';
import { TenantManagement } from './pages/TenantManagement';
import TenantDetail from './pages/TenantDetail';

import {
  fetchTenants,
  createTenant,
  deleteTenant,
} from './api';

import { Tenant } from './types';

// URLのハッシュ
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');

  const tenantId =
    parts[0] === 'tenants' && parts[1]
      ? decodeURIComponent(parts[1])
      : null;

  return {
    tenantId
  };
};

export const App: React.FC = () => {
  // ==========================================
  // 初期ルート（テナント管理固定）
  // ==========================================

  const initialRoute = parseHash();

  const [selectedTenantId, setSelectedTenantId] =
    useState<string | null>(
      initialRoute.tenantId
    );

  const [tenants, setTenants] =
    useState<Tenant[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // URLハッシュ更新
  // ==========================================

  useEffect(() => {
    if (selectedTenantId) {
      window.location.hash =
        `#/tenants/${encodeURIComponent(selectedTenantId)}`;
    } else {
      window.location.hash = '#/tenants';
    }
  }, [
    selectedTenantId
  ]);

  // ==========================================
  // URLハッシュ変更検知
  // ==========================================

  useEffect(() => {
    const handleHashChange = () => {
      const { tenantId } = parseHash();
      setSelectedTenantId(tenantId);
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, []);

  // ==========================================
  // テナント一覧取得
  // ==========================================

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTenants();

      setTenants(data);
    } catch (err: any) {
      setError(
        err?.message ||
        'テナント一覧の取得に失敗しました。'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // ==========================================
  // テナント作成
  // ==========================================

  const handleCreateTenant = async (
    payload: {
      tenantId: string;
      tenantName?: string;
      displayName?: string;
    }
  ) => {
    await createTenant(payload);
    await loadTenants();
  };

  // ==========================================
  // テナント削除
  // ==========================================

  const handleDeleteTenant = async (
    tenantId: string
  ) => {
    await deleteTenant(
      tenantId
    );

    if (
      selectedTenantId === tenantId
    ) {
      setSelectedTenantId(null);
    }

    await loadTenants();
  };

  // ==========================================
  // 選択中のテナント
  // ==========================================

  const selectedTenant =
    tenants.find(
      (tenant) =>
        tenant.tenantId ===
        selectedTenantId
    ) || null;

  // ==========================================
  // Render
  // ==========================================

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#f4f6f8',
        boxSizing: 'border-box',
        fontFamily:
          '"Segoe UI", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Meiryo", sans-serif',
        fontSize: '12px',
        color: '#323130'
      }}
    >
      {/* Headerのタブ選択用props（currentTab, onSelectTabなど）を取り除くか、'tenants'固定で渡します */}
      <Header />

      <main
        style={{
          padding: '20px',
          paddingBottom: '80px'
        }}
      >
        {/* テナント管理のみを描画 */}
        {selectedTenantId ? (
          selectedTenant ? (
            <TenantDetail
              tenant={selectedTenant}
              onBack={() =>
                setSelectedTenantId(null)
              }
              onRefresh={loadTenants}
            />
          ) : (
            <div
              style={{
                padding: '20px',
                fontSize: '12px',
                color: '#605e5c'
              }}
            >
              テナント情報を読み込み中...
            </div>
          )
        ) : (
          <TenantManagement
            tenants={tenants}
            loading={loading}
            error={error}
            onSelectTenant={(tenant) =>
              setSelectedTenantId(
                tenant.tenantId
              )
            }
            onRefresh={loadTenants}
            onCreateTenant={
              handleCreateTenant
            }
            onDeleteTenant={
              handleDeleteTenant
            }
          />
        )}
      </main>
    </div>
  );
};

export default App;