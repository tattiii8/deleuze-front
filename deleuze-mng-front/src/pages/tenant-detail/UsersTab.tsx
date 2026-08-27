import React, {
  useEffect,
  useState
} from 'react';

import { Tenant, User } from '../../types';

import {
  fetchUsers,
  fetchUserById,
  deleteUser,
  issueApiKey
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
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [usersView, setUsersView] = useState<'list' | 'detail'>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);

  /*
   * API Key 発行用の状態
   */
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyExpiresAt, setApiKeyExpiresAt] = useState('');
  const [apiKeyResult, setApiKeyResult] = useState<unknown>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  /*
   * API Key 表示値の抽出
   */
  const apiKeyDisplayValue: string | null = (() => {
    if (apiKeyResult === null || apiKeyResult === undefined) {
      return null;
    }
    if (typeof apiKeyResult === 'string') {
      return apiKeyResult;
    }
    if (typeof apiKeyResult === 'object') {
      const obj = apiKeyResult as Record<string, any>;
      const candidate = obj.apiKey || obj.key || obj.token || obj.secret;
      if (typeof candidate === 'string') {
        return candidate;
      }
      return JSON.stringify(obj, null, 2);
    }
    return String(apiKeyResult);
  })();

  /*
   * ユーザー一覧取得
   */
  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const data = await fetchUsers(tenant.tenantId);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch tenant users:', err);
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
  const openUserDetail = async (user: User) => {
    const subjectId = (user as any).subjectId;

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

    // API Key 入力状態のリセット
    setApiKeyName('');
    setApiKeyExpiresAt('');
    setApiKeyResult(null);
    setApiKeyError(null);

    try {
      const data = await fetchUserById(tenant.tenantId, subjectId);
      setSelectedUser(data);
    } catch (err: any) {
      console.error('Failed to fetch user detail:', err);
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
    setApiKeyResult(null);
    setApiKeyError(null);
  };

  /*
   * API Key 発行処理（選択中ユーザーに対して実行）
   */
  const handleIssueApiKeyForUser = async () => {
    if (!selectedUser) return;

    const loginId = (selectedUser as any).loginId;
    if (!loginId) {
      setApiKeyError(
        'ユーザーのログインIDが取得できないため発行できません。'
      );
      return;
    }

    if (!apiKeyName.trim()) {
      setApiKeyError('API Key名を入力してください。');
      return;
    }

    if (!apiKeyExpiresAt) {
      setApiKeyError('有効期限を入力してください。');
      return;
    }

    if (
      apiKeyResult &&
      !window.confirm(
        'API Key を再発行すると既存のキーが無効になる場合があります。よろしいですか？'
      )
    ) {
      return;
    }

    setApiKeyLoading(true);
    setApiKeyError(null);
    setApiKeyResult(null);
    onError(null);
    onSuccess(null);

    try {
      const expiresAtIso = new Date(apiKeyExpiresAt).toISOString();

      const data = await issueApiKey({
        tenantId: tenant.tenantId,
        loginId: loginId,
        name: apiKeyName.trim(),
        expiresAt: expiresAtIso
      });

      setApiKeyResult(data);
      onSuccess(`ユーザー '${loginId}' の API Key を発行しました。`);
    } catch (err: any) {
      console.error('Failed to issue API key:', err);
      const message =
        err?.response?.data ||
        err?.message ||
        'API Key の発行に失敗しました。';
      setApiKeyError(message);
      onError(message);
    } finally {
      setApiKeyLoading(false);
    }
  };

  /*
   * API Key コピー処理
   */
  const handleCopyApiKey = async () => {
    if (!apiKeyDisplayValue) return;

    await navigator.clipboard.writeText(apiKeyDisplayValue);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  /*
   * ユーザー削除
   */
  const handleDeleteUser = async (user: User) => {
    const subjectId = (user as any).subjectId;

    if (!subjectId) {
      alert(
        'ユーザーID（subjectId）が取得できないため、削除できません。'
      );
      return;
    }

    const loginId = (user as any).loginId || subjectId;

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
      await deleteUser(tenant.tenantId, subjectId);

      onSuccess(`ユーザー '${loginId}' を削除しました。`);

      if (
        usersView === 'detail' &&
        (selectedUser as any)?.subjectId === subjectId
      ) {
        closeUserDetail();
      }

      await loadUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
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
   * 検索フィルター
   */
  const filteredUsers = users.filter((user) => {
    const keyword = userSearchFilter.trim().toLowerCase();
    if (!keyword) return true;

    const loginId = String((user as any).loginId || '').toLowerCase();
    const userName = String((user as any).userName || '').toLowerCase();
    const email = String((user as any).email || '').toLowerCase();
    const subjectId = String((user as any).subjectId || '').toLowerCase();

    return (
      loginId.includes(keyword) ||
      userName.includes(keyword) ||
      email.includes(keyword) ||
      subjectId.includes(keyword)
    );
  });

  /*
   * 一覧画面
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
                onClick={() => setIsUserModalOpen(true)}
                disabled={userActionLoading || usersLoading}
                style={{
                  ...styles.primaryButton,
                  whiteSpace: 'nowrap'
                }}
              >
                ＋ ユーザーを追加
              </button>
            </div>

            {/* 検索バー */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e1dfdd'
              }}
            >
              <input
                type="text"
                placeholder="ログインID、ユーザー名、メールアドレスで検索..."
                value={userSearchFilter}
                onChange={(e) => setUserSearchFilter(e.target.value)}
                style={{
                  ...styles.inputField,
                  marginTop: 0,
                  maxWidth: '400px'
                }}
              />

              <button
                type="button"
                onClick={loadUsers}
                disabled={usersLoading || userActionLoading}
                style={styles.secondaryButton}
              >
                {usersLoading ? '読み込み中...' : '↻ 更新'}
              </button>
            </div>

            {/* エラー表示 */}
            {usersError && (
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
                <div style={{ marginBottom: '8px' }}>{usersError}</div>
                <button
                  type="button"
                  onClick={loadUsers}
                  style={styles.secondaryButton}
                >
                  再試行
                </button>
              </div>
            )}

            {/* テーブルリスト */}
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
                    <th style={styles.th}>ログインID</th>
                    <th style={styles.th}>ユーザー名</th>
                    <th style={styles.th}>メールアドレス</th>
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
                  {filteredUsers.map((user) => {
                    const subjectId = (user as any).subjectId;
                    const loginId = (user as any).loginId || '-';
                    const userName = (user as any).userName || '-';
                    const email = (user as any).email || '-';

                    return (
                      <tr key={subjectId || loginId}>
                        <td
                          style={{
                            ...styles.td,
                            fontFamily: 'monospace'
                          }}
                        >
                          {loginId}
                        </td>
                        <td style={styles.td}>{userName}</td>
                        <td style={styles.td}>{email}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'center'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => openUserDetail(user)}
                              disabled={userActionLoading}
                              style={{
                                ...styles.secondaryButton,
                                height: '28px',
                                padding: '0 10px'
                              }}
                            >
                              詳細
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={userActionLoading}
                              style={{
                                ...styles.secondaryButton,
                                height: '28px',
                                padding: '0 10px',
                                color: '#a80000',
                                borderColor: '#f8d7da'
                              }}
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isUserModalOpen && (
          <UserCreateModal
            tenant={tenant}
            onClose={() => setIsUserModalOpen(false)}
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
   * 詳細画面
   */
  return (
    <div style={styles.sectionContainer}>
      <div style={styles.managementSection}>
        <button onClick={closeUserDetail} style={styles.backButton}>
          &larr; ユーザー一覧に戻る
        </button>

        <h3 style={styles.managementSectionTitle}>ユーザー詳細</h3>

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
            <>
              {/* 基本情報 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  rowGap: '16px',
                  columnGap: '12px',
                  alignItems: 'center'
                }}
              >
                <span style={styles.managementItemLabel}>ログインID</span>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600
                  }}
                >
                  {(selectedUser as any).loginId || '-'}
                </div>

                <span style={styles.managementItemLabel}>
                  ユーザーID (subjectId)
                </span>
                <div style={{ fontFamily: 'monospace' }}>
                  {(selectedUser as any).subjectId || '-'}
                </div>

                <span style={styles.managementItemLabel}>ユーザー名</span>
                <div>{(selectedUser as any).userName || '-'}</div>

                <span style={styles.managementItemLabel}>メールアドレス</span>
                <div>{(selectedUser as any).email || '-'}</div>
              </div>

              {/* API Key 発行フォーム */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e1dfdd'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                  API Key の発行
                </h4>

                {apiKeyError && (
                  <div
                    style={{
                      padding: '8px 12px',
                      marginBottom: '12px',
                      backgroundColor: '#fde7e9',
                      border: '1px solid #f8d7da',
                      color: '#a80000',
                      borderRadius: '2px',
                      fontSize: '12px'
                    }}
                  >
                    {apiKeyError}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxWidth: '400px'
                  }}
                >
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '12px' }}>
                      API Key名 <span style={{ color: '#a80000' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例: CLIツール用キー"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      disabled={apiKeyLoading || userActionLoading}
                      style={styles.inputField}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '12px' }}>
                      有効期限 <span style={{ color: '#a80000' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={apiKeyExpiresAt}
                      onChange={(e) => setApiKeyExpiresAt(e.target.value)}
                      disabled={apiKeyLoading || userActionLoading}
                      style={styles.inputField}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleIssueApiKeyForUser}
                      disabled={apiKeyLoading || userActionLoading}
                      style={styles.primaryButton}
                    >
                      {apiKeyLoading
                        ? '発行中...'
                        : apiKeyResult
                        ? 'API Key を再発行'
                        : 'API Key を発行'}
                    </button>
                  </div>
                </div>

                {/* API Key 発行結果 */}
                {apiKeyDisplayValue && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      maxWidth: '560px',
                      marginTop: '16px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <textarea
                      readOnly
                      value={apiKeyDisplayValue}
                      rows={apiKeyDisplayValue.includes('\n') ? 5 : 1}
                      style={{
                        ...styles.inputSelect,
                        flex: 1,
                        height: 'auto',
                        minHeight: '32px',
                        padding: '8px',
                        fontFamily: 'monospace',
                        resize: 'vertical'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyApiKey}
                      style={styles.secondaryButton}
                    >
                      {isCopied ? 'コピー完了' : 'コピー'}
                    </button>
                  </div>
                )}
              </div>

              {/* 危険な操作 (削除ボタン) */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e1dfdd'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleDeleteUser(selectedUser)}
                  disabled={userActionLoading || apiKeyLoading}
                  style={styles.dangerButton}
                >
                  このユーザーを削除
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default UsersTab;