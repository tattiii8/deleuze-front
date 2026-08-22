import React from 'react';
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Icon,
  getTheme
} from '@fluentui/react';
import { Tenant } from '../types';

interface Props {
  tenants: Tenant[];
  onOpenModal: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
}

const theme = getTheme();

export const TenantManagement: React.FC<Props> = ({
  tenants,
  onOpenModal,
  onSelectTenant,
  onDeleteTenant
}) => {
  const columns: IColumn[] = [
    {
      key: 'col1',
      name: 'Tenant ID',
      fieldName: 'tenantId',
      minWidth: 200,
      maxWidth: 350,
      onRender: (item: Tenant) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
          <Icon iconName="Org" style={{ color: theme.palette.themePrimary, fontSize: 16 }} />
          <Text variant="mediumPlus" style={{ fontWeight: 600, color: theme.palette.neutralPrimary }}>
            {item.tenantId}
          </Text>
        </Stack>
      )
    },
    {
      key: 'col2',
      name: '操作',
      minWidth: 180,
      maxWidth: 220,
      onRender: (item: Tenant) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton
            iconProps={{ iconName: 'Info' }}
            onClick={() => onSelectTenant(item)}
            styles={{ root: { borderRadius: 4 } }}
          >
            詳細
          </PrimaryButton>
          <DefaultButton
            iconProps={{ iconName: 'Delete' }}
            onClick={() => onDeleteTenant(item.tenantId)}
            styles={{ root: { borderRadius: 4 } }}
          >
            削除
          </DefaultButton>
        </Stack>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ marginTop: 15 }}>
      {/* ヘッダーエリア */}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Stack tokens={{ childrenGap: 4 }}>
          <Text variant="xLarge" style={{ fontWeight: 600 }}>登録済みテナント一覧</Text>
        </Stack>
        <PrimaryButton 
          iconProps={{ iconName: 'Add' }} 
          onClick={onOpenModal}
          styles={{ root: { height: 36, borderRadius: 4 } }}
        >
          新規テナント作成
        </PrimaryButton>
      </Stack>

      {/* カード風スタイルのテーブルコンテナ */}
      <div 
        style={{ 
          background: theme.palette.white, 
          borderRadius: 8, 
          boxShadow: '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
          padding: '12px 16px',
          maxWidth: 800 // コンテナの最大幅を制限して間延びを完全に防止
        }}
      >
        <DetailsList
          items={tenants}
          columns={columns}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.fixedColumns} // 列幅を固定して不自然な伸縮を防止
          isHeaderVisible={true}
        />
      </div>
    </Stack>
  );
};