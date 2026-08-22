import React from 'react';
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn
} from '@fluentui/react';
import { Tenant } from '../types';

interface Props {
  tenants: Tenant[];
  onOpenModal: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
}

export const TenantManagement: React.FC<Props> = ({
  tenants,
  onOpenModal,
  onSelectTenant,
  onDeleteTenant
}) => {
  const columns: IColumn[] = [
    { key: 'col1', name: 'Tenant ID', fieldName: 'tenantId', minWidth: 200 },
    {
      key: 'col2',
      name: '操作',
      minWidth: 200,
      onRender: (item: Tenant) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton
            iconProps={{ iconName: 'Info' }}
            onClick={() => onSelectTenant(item)}
          >
            詳細
          </PrimaryButton>
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
    </Stack>
  );
};