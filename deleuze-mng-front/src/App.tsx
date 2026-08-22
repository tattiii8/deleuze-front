import React, { useState, useEffect } from 'react';
import { ThemeProvider, Pivot, PivotItem, MessageBar, MessageBarType, initializeIcons } from '@fluentui/react';
import api from './api';
import { Tenant, User, SystemMessage } from './types';
import { Header } from './components/Header';
import { TenantModal } from './components/TenantModal';
import { UserModal } from './components/UserModal';
import { TenantManagement } from './pages/TenantManagement';
import { TenantDetail } from './pages/TenantDetail';
import { UserManagement } from './pages/UserManagement';

initializeIcons();

export const App: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [msg, setMsg] = useState<SystemMessage | null>(null);

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const showMsg = (text: string, type: MessageBarType) => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  const loadData = async () => {
    try {
      const [tRes, uRes] = await Promise.all([api.get('/tenants'), api.get('/users')]);
      const fetchedTenants: Tenant[] = tRes.data;
      setTenants(fetchedTenants);
      setUsers(uRes.data);

      // 詳細画面を開いている最中の場合、最新データに更新
      if (selectedTenant) {
        const updated = fetchedTenants.find((t) => t.tenantId === selectedTenant.tenantId);
        if (updated) setSelectedTenant(updated);
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "データ取得に失敗しました";
      showMsg(errorMessage || "データ取得に失敗しました", MessageBarType.error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTenant = async (tenantId: string, enableDrive: boolean) => {
    try {
      const services = enableDrive ? ['drive'] : [];
      await api.post('/tenants', { tenantId, enabledServices: services });
      showMsg(`テナント '${tenantId}' を作成しました。`, MessageBarType.success);
      setIsTenantModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "作成に失敗しました";
      showMsg(errorMessage || "作成に失敗しました", MessageBarType.error);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!window.confirm(`テナント '${tenantId}' を削除しますか？`)) return;
    try {
      await api.delete(`/tenants/${tenantId}`);
      showMsg(`テナント '${tenantId}' を削除しました。`, MessageBarType.success);
      if (selectedTenant?.tenantId === tenantId) {
        setSelectedTenant(null);
      }
      loadData();
    } catch {
      showMsg("削除に失敗しました", MessageBarType.error);
    }
  };

  const handleAddService = async (tenantId: string, serviceKey: string) => {
    try {
      await api.post(`/tenants/${tenantId}/services`, { serviceKey });
      showMsg(`テナント '${tenantId}' にサービス '${serviceKey}' を追加しました。`, MessageBarType.success);
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "サービスの追加に失敗しました";
      showMsg(errorMessage || "サービスの追加に失敗しました", MessageBarType.error);
      throw err;
    }
  };

  const handleRegisterUser = async (loginId: string, password: string, tenantId: string) => {
    try {
      await api.post('/users', { loginId, password, tenantId });
      showMsg(`ユーザー '${loginId}' を登録しました。`, MessageBarType.success);
      setIsUserModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "ユーザー登録に失敗しました";
      showMsg(errorMessage || "ユーザー登録に失敗しました", MessageBarType.error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      showMsg("ユーザーを削除しました。", MessageBarType.success);
      loadData();
    } catch {
      showMsg("ユーザー削除に失敗しました", MessageBarType.error);
    }
  };

  return (
    <ThemeProvider style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f2f1' }}>
      <Header />

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {msg && <MessageBar messageBarType={msg.type} onDismiss={() => setMsg(null)}>{msg.text}</MessageBar>}

        <Pivot aria-label="Management Sections">
          <PivotItem headerText="テナント管理" itemIcon="Tenant">
            {selectedTenant ? (
              <TenantDetail
                tenant={selectedTenant}
                onBack={() => setSelectedTenant(null)}
                onAddService={handleAddService}
              />
            ) : (
              <TenantManagement
                tenants={tenants}
                onOpenModal={() => setIsTenantModalOpen(true)}
                onSelectTenant={(tenant) => setSelectedTenant(tenant)}
                onDeleteTenant={handleDeleteTenant}
              />
            )}
          </PivotItem>

          <PivotItem headerText="ユーザー管理" itemIcon="People">
            <UserManagement
              users={users}
              onOpenModal={() => setIsUserModalOpen(true)}
              onDeleteUser={handleDeleteUser}
            />
          </PivotItem>
        </Pivot>
      </div>

      <TenantModal
        isOpen={isTenantModalOpen}
        onDismiss={() => setIsTenantModalOpen(false)}
        onCreate={handleCreateTenant}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onDismiss={() => setIsUserModalOpen(false)}
        onCreate={handleRegisterUser}
      />
    </ThemeProvider>
  );
};

export default App;