import React from 'react';
import { Stack, Text, PrimaryButton, DetailsList, DetailsListLayoutMode, SelectionMode, DefaultButton, IColumn } from '@fluentui/react';
import { User } from '../types';

interface Props {
  users: User[];
  onOpenModal: () => void;
  onDeleteUser: (id: number) => void;
}

export const UserManagement: React.FC<Props> = ({ users, onOpenModal, onDeleteUser }) => {
  const columns: IColumn[] = [
    { key: 'col1', name: 'ID', fieldName: 'id', minWidth: 50 },
    { key: 'col2', name: 'Login ID', fieldName: 'loginId', minWidth: 150 },
    { key: 'col3', name: 'Tenant ID', fieldName: 'tenantId', minWidth: 150 },
    { key: 'col4', name: '作成日時', fieldName: 'createdAt', minWidth: 200 },
    {
      key: 'col5', name: '操作', minWidth: 100, onRender: (item: User) => (
        <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={() => onDeleteUser(item.id)}>削除</DefaultButton>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 15 }} style={{ marginTop: 15 }}>
      <Stack horizontal horizontalAlign="space-between">
        <Text variant="xLarge">ユーザー一覧</Text>
        <PrimaryButton iconProps={{ iconName: 'AddFriend' }} onClick={onOpenModal}>新規ユーザー作成</PrimaryButton>
      </Stack>
      <DetailsList items={users} columns={columns} selectionMode={SelectionMode.none} layoutMode={DetailsListLayoutMode.justified} />
    </Stack>
  );
};