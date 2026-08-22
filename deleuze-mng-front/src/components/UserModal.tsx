import React, { useState } from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, TextField, Stack } from '@fluentui/react';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  onCreate: (loginId: string, password: string, tenantId: string) => Promise<void>;
}

export const UserModal: React.FC<Props> = ({ isOpen, onDismiss, onCreate }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');

  const handleSubmit = async () => {
    await onCreate(loginId, password, tenantId);
    setLoginId('');
    setPassword('');
    setTenantId('');
  };

  return (
    <Dialog hidden={!isOpen} onDismiss={onDismiss} dialogContentProps={{ type: DialogType.normal, title: '新規ユーザー登録' }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <TextField label="ログインID" value={loginId} onChange={(_, v) => setLoginId(v || '')} />
        <TextField label="パスワード (8文字以上)" type="password" canRevealPassword value={password} onChange={(_, v) => setPassword(v || '')} />
        <TextField label="所属テナントID" value={tenantId} onChange={(_, v) => setTenantId(v || '')} />
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={handleSubmit} text="登録" />
        <DefaultButton onClick={onDismiss} text="キャンセル" />
      </DialogFooter>
    </Dialog>
  );
};