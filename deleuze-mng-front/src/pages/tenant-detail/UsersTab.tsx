import React, {
  useEffect,
  useState
} from 'react';

import { Tenant, User } from '../../types';

import {
  fetchUsers,
  fetchUserById,
  deleteUser,
  issueApiKey,
  fetchApiKeys,
  deleteApiKey
} from '../../api';

import UserCreateModal from './UserCreateModal';

import styles from '../../components/tenant-detail/TenantDetailStyles';

interface ApiKeyItem {
  id?: string;
  apiKeyId?: string;
  keyId?: string;
  name?: string;
  createdAt?: string;
  expiresAt?: string;
  [key: string]: any;
}

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
   * API Key 管理用の状態
   */
  const [apiKeyTab, setApiKeyTab] = useState<'issue' | 'list'>('issue');
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);

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
   * API Key 一覧の取得
   */
  const loadApiKeys = async (loginId: string) => {
    setApiKeysLoading(true);
    setApiKeyError(null);
    try {
      const data = await fetchApiKeys(tenant.tenantId, loginId);
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch API keys:', err);
      const message =
        err?.response?.data ||
        err?.message ||
        'API Key 一覧の取得に失敗しました。';
      setApiKeyError(message);
    } finally {
      setApiKeysLoading(false);
    }
  };

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

    // API Key 状態のリセット
    setApiKeyTab('issue');
    setApiKeyName('');
    setApiKeyExpiresAt('');
    setApiKeyResult(null);
    setApiKeyError(null);

    try {
      const data = await fetchUserById(tenant.tenantId, subjectId);
      setSelectedUser(data);
      if ((data as any)?.loginId) {
        loadApiKeys((data as any).loginId);
      }
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
   * API Key 発行処理
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
      // 発行後に一覧も更新
      loadApiKeys(loginId);
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
   * API Key 削除処理
   */
  const handleDeleteApiKey = async (keyItem: ApiKeyItem) => {
    // GETレスポンスからキーIDを取得 (id, apiKeyId, keyId の揺らぎに対応)
    const keyId = keyItem.id || keyItem.apiKeyId || keyItem.keyId;
    const keyName = keyItem.name || keyId;

    if (!keyId) {
      setApiKeyError('API Key の ID が取得できないため削除できません。');
      return;
    }

    if (!window.confirm(`API Key '${keyName}' を削除してもよろしいですか？`)) {
      return;
    }

    setApiKeyLoading(true);
    setApiKeyError(null);
    try {
      await deleteApiKey(keyId);
      onSuccess('API Key を削除しました。');
      const loginId = (selectedUser as any)?.loginId;
      if (loginId) {
        await loadApiKeys(loginId);
      }
    } catch (err: any) {
      console.error('Failed to delete API key:', err);
      const message =
        err?.response?.data ||
        err?.message ||
        'API Key の削除に失敗しました。';
      setApiKeyError(message);
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
      alert('ユーザーID（subjectId）が取得できないため、削除できません。');
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
                  ユーザーID
                </span>
                <div style={{ fontFamily: 'monospace' }}>
                  {(selectedUser as any).subjectId || '-'}
                </div>

                <span style={styles.managementItemLabel}>ユーザー名</span>
                <div>{(selectedUser as any).userName || '-'}</div>

                <span style={styles.managementItemLabel}>メールアドレス</span>
                <div>{(selectedUser as any).email || '-'}</div>
              </div>

              {/* API Key 管理セクション */}
              <div
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e1dfdd'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                  API Key の管理
                </h4>

                {/* タブ切替ボタン */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    borderBottom: '1px solid #e1dfdd',
                    marginBottom: '16px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setApiKeyTab('issue')}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      borderBottom:
                        apiKeyTab === 'issue'
                          ? '2px solid #0078d4'
                          : '2px solid transparent',
                      fontWeight: apiKeyTab === 'issue' ? 'bold' : 'normal',
                      color: apiKeyTab === 'issue' ? '#0078d4' : '#605e5c'
                    }}
                  >
                    発行
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyTab('list');
                      const loginId = (selectedUser as any)?.loginId;
                      if (loginId) loadApiKeys(loginId);
                    }}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      borderBottom:
                        apiKeyTab === 'list'
                          ? '2px solid #0078d4'
                          : '2px solid transparent',
                      fontWeight: apiKeyTab === 'list' ? 'bold' : 'normal',
                      color: apiKeyTab === 'list' ? '#0078d4' : '#605e5c'
                    }}
                  >
                    一覧
                  </button>
                </div>

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

                {/* タブ1: 発行 */}
                {apiKeyTab === 'issue' && (
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
                        {apiKeyLoading ? '発行中...' : 'API Key を発行'}
                      </button>
                    </div>

                    {/* 発行結果表示 */}
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
                )}

                {/* タブ2: 一覧 */}
                {apiKeyTab === 'list' && (
                  <div>
                    {apiKeysLoading ? (
                      <div style={{ color: '#605e5c', padding: '12px 0' }}>
                        API Key 一覧を読み込み中...
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div style={{ color: '#605e5c', padding: '12px 0' }}>
                        発行済みの API Key はありません。
                      </div>
                    ) : (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Key 名</th>
                            <th style={styles.th}>作成日時</th>
                            <th style={styles.th}>有効期限</th>
                            <th
                              style={{
                                ...styles.th,
                                textAlign: 'center',
                                width: '100px'
                              }}
                            >
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map((keyItem, index) => {
                            const keyId =
                              keyItem.id ||
                              keyItem.apiKeyId ||
                              keyItem.keyId ||
                              String(index);

                            return (
                              <tr key={keyId}>
                                <td style={styles.td}>{keyItem.name || '-'}</td>
                                <td style={styles.td}>
                                  {keyItem.createdAt
                                    ? new Date(
                                        keyItem.createdAt
                                      ).toLocaleString()
                                    : '-'}
                                </td>
                                <td style={styles.td}>
                                  {keyItem.expiresAt
                                    ? new Date(
                                        keyItem.expiresAt
                                      ).toLocaleString()
                                    : '-'}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteApiKey(keyItem)}
                                    disabled={apiKeyLoading}
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
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
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