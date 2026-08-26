import React, { useEffect, useState } from 'react';

import { Header } from './components/Header';
import { TenantManagement } from './pages/TenantManagement';
import { UserManagement } from './pages/UserManagement';
import TenantDetail from './pages/TenantDetail';

import {
  fetchTenants,
  createTenant,
  deleteTenant,
  fetchUsers,
  registerUser,
  deleteUser
} from './api';

import { Tenant, User } from './types';

// URLのハッシュ
// 例:
//   #/tenants
//   #/tenants/flaubert
//   #/users
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');

  const tab =
    parts[0] === 'users'
      ? 'users'
      : 'tenants';

  const tenantId =
    parts[0] === 'tenants' && parts[1]
      ? decodeURIComponent(parts[1])
      : null;

  return {
    tab,
    tenantId
  };
};

export const App: React.FC = () => {
  // ==========================================
  // 初期ルート
  // ==========================================

  const initialRoute = parseHash();

  const [currentTab, setCurrentTab] = useState<
    'tenants' | 'users'
  >(
    initialRoute.tab as 'tenants' | 'users'
  );

  const [selectedTenantId, setSelectedTenantId] =
    useState<string | null>(
      initialRoute.tenantId
    );

  const [tenants, setTenants] =
    useState<Tenant[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // URLハッシュ更新
  // ==========================================

  useEffect(() => {
    if (currentTab === 'users') {
      window.location.hash = '#/users';
    } else if (selectedTenantId) {
      window.location.hash =
        `#/tenants/${encodeURIComponent(selectedTenantId)}`;
    } else {
      window.location.hash = '#/tenants';
    }
  }, [
    currentTab,
    selectedTenantId
  ]);

  // ==========================================
  // URLハッシュ変更検知
  // ==========================================

  useEffect(() => {
    const handleHashChange = () => {
      const {
        tab,
        tenantId
      } = parseHash();

      setCurrentTab(
        tab as 'tenants' | 'users'
      );

      setSelectedTenantId(
        tenantId
      );
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

  // ==========================================
  // ユーザー一覧取得
  // ==========================================
  //
  // OpenAPI:
  // GET /api/mng/tenants/{tenantId}/users
  //
  // ユーザーAPIは tenantId が必須。
  // ==========================================

  const loadUsers = async (
    tenantId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const targetTenantId =
        tenantId ||
        selectedTenantId ||
        tenants[0]?.tenantId;

      if (!targetTenantId) {
        setUsers([]);
        return;
      }

      const data =
        await fetchUsers(
          targetTenantId
        );

      setUsers(data);
    } catch (err: any) {
      setError(
        err?.message ||
        'ユーザー一覧の取得に失敗しました。'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // タブ変更時のデータ取得
  // ==========================================

  useEffect(() => {
    if (currentTab === 'tenants') {
      loadTenants();
    }
  }, [currentTab]);

  useEffect(() => {
    if (
      currentTab === 'users' &&
      tenants.length > 0
    ) {
      loadUsers();
    }
  }, [
    currentTab,
    selectedTenantId,
    tenants
  ]);

  // ==========================================
  // テナント作成
  // ==========================================
  //
  // OpenAPI:
  // POST /api/mng/tenants
  //
  // CreateTenantRequest:
  // {
  //   tenantId: string;
  //   tenantName?: string;
  //   displayName?: string;
  // }
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
  // ユーザー登録
  // ==========================================
  //
  // OpenAPI:
  // POST /api/mng/tenants/{tenantId}/users
  //
  // CreateUserRequest:
  // {
  //   loginId: string;
  //   password: string;
  //   userName?: string;
  //   email?: string;
  // }
  // ==========================================

  const handleRegisterUser = async (
    tenantId: string,
    payload: {
      loginId: string;
      password: string;
      userName?: string;
      email?: string;
    }
  ) => {
    await registerUser(
      tenantId,
      payload
    );

    await loadUsers(
      tenantId
    );
  };

  // ==========================================
  // ユーザー削除
  // ==========================================
  //
  // OpenAPI:
  // DELETE /api/mng/tenants/{tenantId}/users/{subjectId}
  // ==========================================

  const handleDeleteUser = async (
    tenantId: string,
    subjectId: string
  ) => {
    await deleteUser(
      tenantId,
      subjectId
    );

    await loadUsers(
      tenantId
    );
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
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);

          if (tab === 'users') {
            setSelectedTenantId(null);
          }
        }}
      />

      <main
        style={{
          padding: '20px',
          paddingBottom: '80px'
        }}
      >
        {/* ======================================
            テナント管理
            ====================================== */}

        {currentTab === 'tenants' && (
          <>
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
          </>
        )}

        {/* ======================================
            ユーザー管理
            ====================================== */}

        {currentTab === 'users' && (
          <UserManagement
            users={users}
            tenants={tenants}
            loading={loading}
            error={error}
            onRefresh={() =>
              loadUsers()
            }
            onRegisterUser={
              handleRegisterUser
            }
            onDeleteUser={
              handleDeleteUser
            }
          />
        )}
      </main>
    </div>
  );
};

export default App;