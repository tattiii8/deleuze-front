import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  PrimaryButton,
  DefaultButton,
  TextField,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Pivot,
  PivotItem,
  Dialog,
  DialogType,
  DialogFooter,
  MessageBar,
  MessageBarType,
  initializeIcons,
  Stack,
  Text,
  Checkbox
} from '@fluentui/react';
import api from './api';

initializeIcons();

export const App: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: MessageBarType } | null>(null);

  // ダイアログ状態
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // フォームデータ
  const [newTenantId, setNewTenantId] = useState('');
  const [enableDrive, setEnableDrive] = useState(true);

  const [newLoginId, setNewLoginId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userTenantId, setUserTenantId] = useState('');

  const loadData = async () => {
    try {
      const [tRes, uRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/users')
      ]);
      setTenants(tRes.data);
      setUsers(uRes.data);
    } catch (err: any) {
      showMsg(err.response?.data?.error || "データ取得に失敗しました", MessageBarType.error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showMsg = (text: string, type: MessageBarType) => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleCreateTenant = async () => {
    try {
      const services = enableDrive ? ['drive'] : [];
      await api.post('/tenants', { tenantId: newTenantId, enabledServices: services });
      showMsg(`テナント '${newTenantId}' を作成しました。`, MessageBarType.success);
      setIsTenantModalOpen(false);
      setNewTenantId('');
      loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.error || "作成に失敗しました", MessageBarType.error);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!window.confirm(`テナント '${tenantId}' を削除しますか？`)) return;
    try {
      await api.delete(`/tenants/${tenantId}`);
      showMsg(`テナント '${tenantId}' を削除しました。`, MessageBarType.success);
      loadData();
    } catch (err: any) {
      showMsg("削除に失敗しました", MessageBarType.error);
    }
  };

  const handleRegisterUser = async () => {
    try {
      await api.post('/users', { loginId: newLoginId, password: newPassword, tenantId: userTenantId });
      showMsg(`ユーザー '${newLoginId}' を登録しました。`, MessageBarType.success);
      setIsUserModalOpen(false);
      setNewLoginId(''); setNewPassword(''); setUserTenantId('');
      loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.error || "ユーザー登録に失敗しました", MessageBarType.error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      showMsg("ユーザーを削除しました。", MessageBarType.success);
      loadData();
    } catch (err: any) {
      showMsg("ユーザー削除に失敗しました", MessageBarType.error);
    }
  };

  const tenantColumns: IColumn[] = [
    { key: 'col1', name: 'Tenant ID', fieldName: 'tenantId', minWidth: 200 },
    {
      key: 'col2', name: '操作', minWidth: 100, onRender: (item) => (
        <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={() => handleDeleteTenant(item.tenantId)}>削除</DefaultButton>
      )
    }
  ];

  const userColumns: IColumn[] = [
    { key: 'col1', name: 'ID', fieldName: 'id', minWidth: 50 },
    { key: 'col2', name: 'Login ID', fieldName: 'loginId', minWidth: 150 },
    { key: 'col3', name: 'Tenant ID', fieldName: 'tenantId', minWidth: 150 },
    { key: 'col4', name: '作成日時', fieldName: 'createdAt', minWidth: 200 },
    {
      key: 'col5', name: '操作', minWidth: 100, onRender: (item) => (
        <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={() => handleDeleteUser(item.id)}>削除</DefaultButton>
      )
    }
  ];

  return (
    <ThemeProvider style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f2f1' }}>
      {/* Azure Top Bar */}
      <div style={{ background: '#0078d4', color: 'white', padding: '0 20px', height: '48px', display: 'flex', alignItems: 'center' }}>
        <Text variant="large" style={{ color: 'white', fontWeight: 600 }}>Deleuze Management Console</Text>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {msg && <MessageBar messageBarType={msg.type} onDismiss={() => setMsg(null)}>{msg.text}</MessageBar>}

        <Pivot aria-label="Management Sections">
          <PivotItem headerText="テナント管理" itemIcon="Tenant">
            <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 15 }}>
              <Stack horizontal horizontalAlign="space-between">
                <Text variant="xLarge">登録済みテナント一覧</Text>
                <PrimaryButton iconProps={{ iconName: 'Add' }} onClick={() => setIsTenantModalOpen(true)}>新規テナント作成</PrimaryButton>
              </Stack>
              <DetailsList items={tenants} columns={tenantColumns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
            </Stack>
          </PivotItem>

          <PivotItem headerText="ユーザー管理" itemIcon="People">
            <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 15 }}>
              <Stack horizontal horizontalAlign="space-between">
                <Text variant="xLarge">ユーザー一覧</Text>
                <PrimaryButton iconProps={{ iconName: 'AddFriend' }} onClick={() => setIsUserModalOpen(true)}>新規ユーザー作成</PrimaryButton>
              </Stack>
              <DetailsList items={users} columns={userColumns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
            </Stack>
          </PivotItem>
        </Pivot>
      </div>

      {/* テナント作成ダイアログ */}
      <Dialog hidden={!isTenantModalOpen} onDismiss={() => setIsTenantModalOpen(false)} dialogContentProps={{ type: DialogType.normal, title: '新規テナント作成' }}>
        <Stack tokens={{ childrenGap: 10 }}>
          <TextField label="テナントID (例: demo_tenant)" value={newTenantId} onChange={(_, v) => setNewTenantId(v || '')} />
          <Checkbox label="Drive サービスを有効化する" checked={enableDrive} onChange={(_, c) => setEnableDrive(!!c)} />
        </Stack>
        <DialogFooter>
          <PrimaryButton onClick={handleCreateTenant} text="作成" />
          <DefaultButton onClick={() => setIsTenantModalOpen(false)} text="キャンセル" />
        </DialogFooter>
      </Dialog>

      {/* ユーザー作成ダイアログ */}
      <Dialog hidden={!isUserModalOpen} onDismiss={() => setIsUserModalOpen(false)} dialogContentProps={{ type: DialogType.normal, title: '新規ユーザー登録' }}>
        <Stack tokens={{ childrenGap: 10 }}>
          <TextField label="ログインID" value={newLoginId} onChange={(_, v) => setNewLoginId(v || '')} />
          <TextField label="パスワード (8文字以上)" type="password" canRevealPassword value={newPassword} onChange={(_, v) => setNewPassword(v || '')} />
          <TextField label="所属テナントID" value={userTenantId} onChange={(_, v) => setUserTenantId(v || '')} />
        </Stack>
        <DialogFooter>
          <PrimaryButton onClick={handleRegisterUser} text="登録" />
          <DefaultButton onClick={() => setIsUserModalOpen(false)} text="キャンセル" />
        </DialogFooter>
      </Dialog>
    </ThemeProvider>
  );
};

export default App;