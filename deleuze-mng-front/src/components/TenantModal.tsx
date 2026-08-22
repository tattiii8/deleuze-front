import React, { useState } from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, TextField, Checkbox, Stack } from '@fluentui/react';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  onCreate: (tenantId: string, enableDrive: boolean) => Promise<void>;
}

export const TenantModal: React.FC<Props> = ({ isOpen, onDismiss, onCreate }) => {
  const [newTenantId, setNewTenantId] = useState('');
  const [enableDrive, setEnableDrive] = useState(true);

  const handleSubmit = async () => {
    await onCreate(newTenantId, enableDrive);
    setNewTenantId('');
  };

  return (
    <Dialog hidden={!isOpen} onDismiss={onDismiss} dialogContentProps={{ type: DialogType.normal, title: '新規テナント作成' }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <TextField label="テナントID (例: demo_tenant)" value={newTenantId} onChange={(_, v) => setNewTenantId(v || '')} />
        <Checkbox label="Drive サービスを有効化する" checked={enableDrive} onChange={(_, c) => setEnableDrive(!!c)} />
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={handleSubmit} text="作成" />
        <DefaultButton onClick={onDismiss} text="キャンセル" />
      </DialogFooter>
    </Dialog>
  );
};