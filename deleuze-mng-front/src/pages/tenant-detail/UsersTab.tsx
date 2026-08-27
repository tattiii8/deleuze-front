import React, {
  useEffect,
  useState
} from 'react';

import { Tenant, User } from '../../types';

import {
  fetchUsers,
  fetchUserById,
  deleteUser
} from '../../api';

import UserCreateModal from './UserCreateModal';

import styles from '../../components/tenant-detail/TenantDetailStyles';

interface UsersTabProps {
  tenant: Tenant;
  onError: (message: string | null) => void;
  onSuccess: (message: string | null) => void;
  clearMessages: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  tenant,
  onError,
  onSuccess
}) => {
  const [users, setUsers] =
    useState<User[]>([]);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const [usersError, setUsersError] =
    useState<string | null>(null);

  const [userSearchFilter, setUserSearchFilter] =
    useState('');

  const [usersView, setUsersView] =
    useState<'list' | 'detail'>('list');

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [userDetailLoading, setUserDetailLoading] =
    useState(false);

  const [userDetailError, setUserDetailError] =
    useState<string | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] =
    useState(false);

  const [userActionLoading, setUserActionLoading] =
    useState(false);

  /*
   * ユーザー一覧
   */
  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const data = await fetchUsers(
        tenant.tenantId
      );

      setUsers(data);
    } catch (err: any) {
      console.error(
        'Failed to fetch tenant users:',
        err
      );

      const message =
        err?.response?.data ||
        err?.message ||
        'ユーザー一覧の取得に失敗しました。';

      setUsersError(message);
      onError(message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    setUsersView('list');
    setSelectedUser(null);
    setUserDetailError(null);

    loadUsers();
  }, [tenant.tenantId]);

  /*
   * ユーザー詳細
   */
  const openUserDetail = async (
    user: User
  ) => {
    const subjectId =
      (user as any).subjectId;

    if (!subjectId) {
      alert(
        'ユーザーID（subjectId）が取得できないため、詳細を表示できません。'
      );
      return;
    }

    setUsersView('detail');
    setSelectedUser(user);
    setUserDetailError(null);
    setUserDetailLoading(true);

    try {
      const data = await fetchUserById(
        tenant.tenantId,
        subjectId
      );

      setSelectedUser(data);
    } catch (err: any) {
      console.error(
        'Failed to fetch user detail:',
        err
      );

      const message =
        err?.response?.data ||
        err?.message ||
        'ユーザー詳細の取得に失敗しました。';

      setUserDetailError(message);
      onError(message);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const closeUserDetail = () => {
    setUsersView('list');
    setSelectedUser(null);
    setUserDetailError(null);
  };

  /*
   * ユーザー削除
   */
  const handleDeleteUser = async (
    user: User
  ) => {
    const subjectId =
      (user as any).subjectId;

    if (!subjectId) {
      alert(
        'ユーザーID（subjectId）が取得できないため、削除できません。'
      );
      return;
    }

    const loginId =
      (user as any).loginId ||
      subjectId;

    if (
      !window.confirm(
        `ユーザー '${loginId}' を削除してもよろしいですか？\n\nこの操作は取り消せません。`
      )
    ) {
      return;
    }

    setUserActionLoading(true);
    onError(null);
    onSuccess(null);

    try {
      await deleteUser(
        tenant.tenantId,
        subjectId
      );

      onSuccess(
        `ユーザー '${loginId}' を削除しました。`
      );

      if (
        usersView === 'detail' &&
        (selectedUser as any)?.subjectId ===
          subjectId
      ) {
        closeUserDetail();
      }

      await loadUsers();
    } catch (err: any) {
      console.error(
        'Failed to delete user:',
        err
      );

      const message =
        err?.response?.data ||
        err?.message ||
        'ユーザーの削除に失敗しました。';

      onError(message);
    } finally {
      setUserActionLoading(false);
    }
  };

  /*
   * 検索
   */
  const filteredUsers = users.filter(
    (user) => {
      const keyword =
        userSearchFilter
          .trim()
          .toLowerCase();

      if (!keyword) {
        return true;
      }

      const loginId =
        String(
          (user as any).loginId || ''
        ).toLowerCase();

      const userName =
        String(
          (user as any).userName || ''
        ).toLowerCase();

      const email =
        String(
          (user as any).email || ''
        ).toLowerCase();

      const subjectId =
        String(
          (user as any).subjectId || ''
        ).toLowerCase();

      return (
        loginId.includes(keyword) ||
        userName.includes(keyword) ||
        email.includes(keyword) ||
        subjectId.includes(keyword)
      );
    }
  );

  /*
   * 一覧
   */
  if (usersView === 'list') {
    return (
      <>
        <div style={styles.sectionContainer}>
          <div style={styles.managementSection}>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '12px'
              }}
            >
              <div>
                <h3
                  style={{
                    ...styles.managementSectionTitle,
                    marginBottom: '4px'
                  }}
                >
                  所属ユーザー
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: '#605e5c',
                    fontSize: '12px'
                  }}
                >
                  テナントに所属しているユーザーを表示します。
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsUserModalOpen(true)
                }
                disabled={
                  userActionLoading ||
                  usersLoading
                }
                style={{
                  ...styles.primaryButton,
                  whiteSpace: 'nowrap'
                }}
              >
                ＋ ユーザーを追加
              </button>
            </div>

            {/* 検索 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom:
                  '1px solid #e1dfdd'
              }}
            >
              <input
                type="text"
                placeholder="ログインID、ユーザー名、メールアドレスで検索..."
                value={userSearchFilter}
                onChange={(e) =>
                  setUserSearchFilter(
                    e.target.value
                  )
                }
                style={{
                  ...styles.inputField,
                  marginTop: 0,
                  maxWidth: '400px'
                }}
              />

              <button
                type="button"
                onClick={loadUsers}
                disabled={
                  usersLoading ||
                  userActionLoading
                }
                style={styles.secondaryButton}
              >
                {usersLoading
                  ? '読み込み中...'
                  : '↻ 更新'}
              </button>
            </div>

            {/* エラー */}
            {usersError && (
              <div
                style={{
                  padding: '10px 12px',
                  marginBottom: '16px',
                  backgroundColor: '#fde7e9',
                  border:
                    '1px solid #f8d7da',
                  color: '#a80000',
                  borderRadius: '2px'
                }}
              >
                <div
                  style={{
                    marginBottom: '8px'
                  }}
                >
                  {usersError}
                </div>

                <button
                  type="button"
                  onClick={loadUsers}
                  style={
                    styles.secondaryButton
                  }
                >
                  再試行
                </button>
              </div>
            )}

            {/* Loading */}
            {usersLoading ? (
              <div
                style={{
                  padding: '32px 0',
                  textAlign: 'center',
                  color: '#605e5c'
                }}
              >
                ユーザー一覧を読み込み中...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div
                style={{
                  padding: '32px 0',
                  textAlign: 'center',
                  color: '#605e5c'
                }}
              >
                {userSearchFilter
                  ? '検索条件に一致するユーザーが見つかりませんでした。'
                  : 'このテナントに所属するユーザーはいません。'}
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      ログインID
                    </th>

                    <th style={styles.th}>
                      ユーザー名
                    </th>

                    <th style={styles.th}>
                      メールアドレス
                    </th>

                    <th
                      style={{
                        ...styles.th,
                        textAlign: 'center',
                        width: '170px'
                      }}
                    >
                      操作
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => {
                      const subjectId =
                        (user as any)
                          .subjectId;

                      const loginId =
                        (user as any)
                          .loginId || '-';

                      const userName =
                        (user as any)
                          .userName || '-';

                      const email =
                        (user as any)
                          .email || '-';

                      return (
                        <tr
                          key={
                            subjectId ||
                            loginId
                          }
                        >
                          <td
                            style={{
                              ...styles.td,
                              fontFamily:
                                'monospace'
                            }}
                          >
                            {loginId}
                          </td>

                          <td style={styles.td}>
                            {userName}
                          </td>

                          <td style={styles.td}>
                            {email}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              textAlign: 'center'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent:
                                  'center'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openUserDetail(
                                    user
                                  )
                                }
                                disabled={
                                  userActionLoading
                                }
                                style={{
                                  ...styles.secondaryButton,
                                  height: '28px',
                                  padding:
                                    '0 10px'
                                }}
                              >
                                詳細
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteUser(
                                    user
                                  )
                                }
                                disabled={
                                  userActionLoading
                                }
                                style={{
                                  ...styles.secondaryButton,
                                  height: '28px',
                                  padding:
                                    '0 10px',
                                  color:
                                    '#a80000',
                                  borderColor:
                                    '#f8d7da'
                                }}
                              >
                                削除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isUserModalOpen && (
          <UserCreateModal
            tenant={tenant}
            onClose={() =>
              setIsUserModalOpen(false)
            }
            onSuccess={(message) => {
              onSuccess(message);
              loadUsers();
            }}
            onError={onError}
          />
        )}
      </>
    );
  }

  /*
   * 詳細
   */
  return (
    <div style={styles.sectionContainer}>
      <div style={styles.managementSection}>

        <button
          onClick={closeUserDetail}
          style={styles.backButton}
        >
          &larr; ユーザー一覧に戻る
        </button>

        <h3 style={styles.managementSectionTitle}>
          ユーザー詳細
        </h3>

        {userDetailError && (
          <div
            style={{
              padding: '10px 12px',
              marginBottom: '16px',
              backgroundColor: '#fde7e9',
              border: '1px solid #f8d7da',
              color: '#a80000',
              borderRadius: '2px'
            }}
          >
            {userDetailError}
          </div>
        )}

        {userDetailLoading ? (
          <div
            style={{
              padding: '32px 0',
              textAlign: 'center',
              color: '#605e5c'
            }}
          >
            ユーザー詳細を読み込み中...
          </div>
        ) : (
          selectedUser && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '200px 1fr',
                rowGap: '16px',
                columnGap: '12px',
                alignItems: 'center'
              }}
            >
              <span
                style={
                  styles.managementItemLabel
                }
              >
                ログインID
              </span>

              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              >
                {(selectedUser as any)
                  .loginId || '-'}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                ユーザーID (subjectId)
              </span>

              <div
                style={{
                  fontFamily: 'monospace'
                }}
              >
                {(selectedUser as any)
                  .subjectId || '-'}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                ユーザー名
              </span>

              <div>
                {(selectedUser as any)
                  .userName || '-'}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                メールアドレス
              </span>

              <div>
                {(selectedUser as any)
                  .email || '-'}
              </div>
            </div>
          )
        )}

        {selectedUser &&
          !userDetailLoading && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop:
                  '1px solid #e1dfdd'
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handleDeleteUser(
                    selectedUser
                  )
                }
                disabled={
                  userActionLoading
                }
                style={
                  styles.dangerButton
                }
              >
                このユーザーを削除
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default UsersTab;