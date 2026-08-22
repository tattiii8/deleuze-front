import React, { useState } from 'react';
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Dialog,
  DialogType,
  DialogFooter,
  Dropdown,
  IDropdownOption
} from '@fluentui/react';
import { Tenant } from '../types';

interface Props {
  tenants: Tenant[];
  onOpenModal: () => void;
  onDeleteTenant: (tenantId: string) => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
}

const SERVICE_OPTIONS: IDropdownOption[] = [
  { key: 'drive', text: 'Drive' },
  { key: 'analytics', text: 'Analytics' },
  { key: 'kms', text: 'KMS' }
];

export const TenantManagement: React.FC<Props> = ({
  tenants,
  onOpenModal,
  onDeleteTenant,
  onAddService
}) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('drive');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleOpenServiceModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSelectedServiceKey('drive');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!selectedTenant || !selectedServiceKey) return;
    await onAddService(selectedTenant.tenantId, selectedServiceKey);
    setIsServiceModalOpen(false);
    setSelectedTenant(null);
  };

  const columns: IColumn[] = [
    { key: 'col1', name: 'Tenant ID', fieldName: 'tenantId', minWidth: 150 },
    {
      key: 'col2',
      name: '有効サービス',
      minWidth: 180,
      onRender: (item: Tenant) => (
        <span>{(item.enabledServices && item.enabledServices.length > 0) ? item.enabledServices.join(', ') : 'なし'}</span>
      )
    },
    {
      key: 'col3',
      name: '操作',
      minWidth: 220,
      onRender: (item: Tenant) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <DefaultButton
            iconProps={{ iconName: 'Add' }}
            onClick={() => handleOpenServiceModal(item)}
          >
            サービス追加
          </DefaultButton>
          <DefaultButton
            iconProps={{ iconName: 'Delete' }}
            onClick={() => onDeleteTenant(item.tenantId)}
          >
            削除
          </DefaultButton>
        </Stack>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 15 }}>
      <Stack horizontal horizontalAlign="space-between">
        <Text variant="xLarge">登録済みテナント一覧</Text>
        <PrimaryButton iconProps={{ iconName: 'Add' }} onClick={onOpenModal}>
          新規テナント作成
        </PrimaryButton>
      </Stack>

      <DetailsList
        items={tenants}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
      />

      <Dialog
        hidden={!isServiceModalOpen}
        onDismiss={() => setIsServiceModalOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: `サービス追加 (${selectedTenant?.tenantId})`
        }}
      >
        <Stack tokens={{ childrenGap: 12 }} style={{ marginTop: 10 }}>
          <Dropdown
            label="追加するサービスを選択"
            selectedKey={selectedServiceKey}
            options={SERVICE_OPTIONS}
            onChange={(_, option) => setSelectedServiceKey(option?.key as string)}
          />
        </Stack>
        <DialogFooter>
          <PrimaryButton onClick={handleSaveService} text="追加" />
          <DefaultButton onClick={() => setIsServiceModalOpen(false)} text="キャンセル" />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};