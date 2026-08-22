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
import { User } from '../types';

interface Props {
  users: User[];
  onOpenModal: () => void;
  onDeleteUser: (id: number) => void;
}

const theme = getTheme();

export const UserManagement: React.FC<Props> = ({ users, onOpenModal, onDeleteUser }) => {
  const columns: IColumn[] = [
    {
      key: 'col2',
      name: 'Login ID',
      fieldName: 'loginId',
      minWidth: 150,
      maxWidth: 220,
      onRender: (item: User) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName="Contact" style={{ color: theme.palette.themePrimary, fontSize: 16 }} />
          <Text variant="mediumPlus" style={{ fontWeight: 600, color: theme.palette.neutralPrimary }}>
            {item.loginId}
          </Text>
        </Stack>
      )
    },
    {
      key: 'col3',
      name: 'Tenant ID',
      fieldName: 'tenantId',
      minWidth: 120,
      maxWidth: 180,
      onRender: (item: User) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
          <Icon iconName="Org" style={{ color: theme.palette.neutralSecondary, fontSize: 14 }} />
          <Text variant="medium">{item.tenantId}</Text>
        </Stack>
      )
    },
    {
      key: 'col4',
      name: '作成日時',
      fieldName: 'createdAt',
      minWidth: 160,
      maxWidth: 200,
      onRender: (item: User) => {
        const formattedDate = item.createdAt 
          ? new Date(item.createdAt).toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';
        return <Text variant="medium" style={{ color: theme.palette.neutralSecondary }}>{formattedDate}</Text>;
      }
    },
    {
      key: 'col5',
      name: '操作',
      minWidth: 100,
      maxWidth: 120,
      onRender: (item: User) => (
        <DefaultButton
          iconProps={{ iconName: 'Delete' }}
          onClick={() => onDeleteUser(item.id)}
          styles={{ root: { borderRadius: 4 } }}
        >
          削除
        </DefaultButton>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ marginTop: 15 }}>
      {/* ヘッダーエリア */}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Stack tokens={{ childrenGap: 4 }}>
          <Text variant="xLarge" style={{ fontWeight: 600 }}>ユーザー一覧</Text>
          <Text variant="small" style={{ color: theme.palette.neutralSecondary }}>
            登録済みのシステムユーザー（{users.length}件）を管理します
          </Text>
        </Stack>
        <PrimaryButton
          iconProps={{ iconName: 'AddFriend' }}
          onClick={onOpenModal}
          styles={{ root: { height: 36, borderRadius: 4 } }}
        >
          新規ユーザー作成
        </PrimaryButton>
      </Stack>

      {/* カード風スタイルのテーブルコンテナ */}
      <div
        style={{
          background: theme.palette.white,
          borderRadius: 8,
          boxShadow: '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
          padding: '12px 16px',
          maxWidth: 800 // テナント一覧のカード幅と揃えて統一感を演出
        }}
      >
        <DetailsList
          items={users}
          columns={columns}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          isHeaderVisible={true}
        />
      </div>
    </Stack>
  );
};