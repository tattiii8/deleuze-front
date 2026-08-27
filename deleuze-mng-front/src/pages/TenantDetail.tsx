import React, { useEffect, useState } from 'react';
import { Tenant, User } from '../types';
import {
  fetchUsers,
  fetchUserById,
  registerUser,
  deleteUser,
  issueApiKey
} from '../api';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

const TenantDetail: React.FC<TenantDetailProps> = ({
  tenant,
  onBack,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'settings'
  >('overview');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * =========================================================
   * 所属ユーザー
   * =========================================================
   */

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] =
    useState(false);
  const [usersError, setUsersError] =
    useState<string | null>(null);

  const [userSearchFilter, setUserSearchFilter] =
    useState('');

  /*
   * 所属ユーザー: 一覧 / 詳細 の画面切り替え
   */

  const [usersView, setUsersView] = useState<
    'list' | 'detail'
  >('list');

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [userDetailLoading, setUserDetailLoading] =
    useState(false);

  const [userDetailError, setUserDetailError] =
    useState<string | null>(null);

  /*
   * ユーザー登録モーダル
   */

  const [isUserModalOpen, setIsUserModalOpen] =
    useState(false);

  const [newLoginId, setNewLoginId] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [newUserName, setNewUserName] =
    useState('');

  const [newEmail, setNewEmail] =
    useState('');

  const [userActionLoading, setUserActionLoading] =
    useState(false);

  const [userActionError, setUserActionError] =
    useState<string | null>(null);

  /*
   * =========================================================
   * API Key 発行
   *
   * POST /api/auth/internal/admin/apikey
   * =========================================================
   */

  const [apiKeyLoginId, setApiKeyLoginId] =
    useState('');

  const [apiKeyName, setApiKeyName] =
    useState('');

  const [apiKeyExpiresAt, setApiKeyExpiresAt] =
    useState('');

  const [apiKeyResult, setApiKeyResult] =
    useState<unknown>(null);

  const [apiKeyLoading, setApiKeyLoading] =
    useState(false);

  const [apiKeyError, setApiKeyError] =
    useState<string | null>(null);

  /*
   * =========================================================
   * ダミー状態
   * =========================================================
   */

  const [dummyTenantStatus, setDummyTenantStatus] =
    useState<'active' | 'suspended'>('active');

  const [dummyAuthMode, setDummyAuthMode] =
    useState<number>(0);

  const [dummyHealthStatus, setDummyHealthStatus] =
    useState<{
      dbStatus: string;
      storageStatus: string;
      message: string;
    } | null>(null);

  const [dummyMigrations] = useState<
    {
      serviceKey?: string;
      migrationName: string;
      appliedAt: string;
    }[]
  >([]);

  const [activeMigrationService, setActiveMigrationService] =
    useState('auth');

  const [isCopied, setIsCopied] =
    useState(false);

  /*
   * =========================================================
   * ユーザー一覧取得
   * =========================================================
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

      setUsersError(
        err?.response?.data ||
          err?.message ||
          'ユーザー一覧の取得に失敗しました。'
      );
    } finally {
      setUsersLoading(false);
    }
  };

  /*
   * 所属ユーザータブを開いたときに取得（一覧画面へリセット）
   */

  useEffect(() => {
    if (activeTab !== 'users') {
      return;
    }

    setUsersView('list');
    setSelectedUser(null);
    setUserDetailError(null);

    loadUsers();
  }, [activeTab, tenant.tenantId]);

  /*
   * =========================================================
   * ユーザー詳細
   *
   * GET
   * /api/mng/tenants/{tenantId}/users/{subjectId}
   * =========================================================
   */

  const openUserDetail = async (user: User) => {
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

      setUserDetailError(
        err?.response?.data ||
          err?.message ||
          'ユーザー詳細の取得に失敗しました。'
      );
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
   * =========================================================
   * ユーザー登録モーダル
   * =========================================================
   */

  const openUserModal = () => {
    setUserActionError(null);

    setNewLoginId('');
    setNewPassword('');
    setNewUserName('');
    setNewEmail('');

    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    if (userActionLoading) {
      return;
    }

    setIsUserModalOpen(false);
    setUserActionError(null);

    setNewLoginId('');
    setNewPassword('');
    setNewUserName('');
    setNewEmail('');
  };

  /*
   * =========================================================
   * ユーザー登録
   *
   * POST
   * /api/mng/tenants/{tenantId}/users
   * =========================================================
   */

  const handleRegisterUser = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newLoginId.trim()) {
      setUserActionError(
        'ログインIDを入力してください。'
      );
      return;
    }

    if (!newPassword) {
      setUserActionError(
        'パスワードを入力してください。'
      );
      return;
    }

    setUserActionLoading(true);
    setUserActionError(null);
    setError(null);
    setSuccessMessage(null);

    try {
      await registerUser(
        tenant.tenantId,
        {
          loginId: newLoginId.trim(),
          password: newPassword,
          userName:
            newUserName.trim() || undefined,
          email:
            newEmail.trim() || undefined
        }
      );

      closeUserModal();

      setSuccessMessage(
        `ユーザー '${newLoginId.trim()}' を登録しました。`
      );

      /*
       * 登録後に一覧を再取得
       */
      await loadUsers();
    } catch (err: any) {
      console.error(
        'Failed to register user:',
        err
      );

      setUserActionError(
        err?.response?.data ||
          err?.message ||
          'ユーザーの登録に失敗しました。'
      );
    } finally {
      setUserActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ユーザー削除
   *
   * DELETE
   * /api/mng/tenants/{tenantId}/users/{subjectId}
   * =========================================================
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
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteUser(
        tenant.tenantId,
        subjectId
      );

      setSuccessMessage(
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

      setError(
        err?.response?.data ||
          err?.message ||
          'ユーザーの削除に失敗しました。'
      );
    } finally {
      setUserActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ユーザー検索
   * =========================================================
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
   * =========================================================
   * ダミー: サービス管理
   * =========================================================
   */

  const handleEnableService = async (
    serviceKey: string
  ) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setSuccessMessage(
        `サービス '${serviceKey}' の有効化処理はダミーです。` +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * API Key 発行
   *
   * POST /api/auth/internal/admin/apikey
   * =========================================================
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

      const candidate =
        obj.apiKey ||
        obj.key ||
        obj.token ||
        obj.secret;

      if (typeof candidate === 'string') {
        return candidate;
      }

      return JSON.stringify(obj, null, 2);
    }

    return String(apiKeyResult);
  })();

  const handleIssueApiKey = async () => {
    if (!apiKeyLoginId.trim()) {
      setApiKeyError(
        'ログインIDを入力してください。'
      );
      return;
    }

    if (!apiKeyName.trim()) {
      setApiKeyError(
        'API Key名を入力してください。'
      );
      return;
    }

    if (!apiKeyExpiresAt) {
      setApiKeyError(
        '有効期限を入力してください。'
      );
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
    setError(null);
    setSuccessMessage(null);

    try {
      const expiresAtIso = new Date(
        apiKeyExpiresAt
      ).toISOString();

      const data = await issueApiKey({
        tenantId: tenant.tenantId,
        loginId: apiKeyLoginId.trim(),
        name: apiKeyName.trim(),
        expiresAt: expiresAtIso
      });

      setApiKeyResult(data);

      setSuccessMessage(
        'API Key を発行しました。'
      );
    } catch (err: any) {
      console.error(
        'Failed to issue API key:',
        err
      );

      setApiKeyError(
        err?.response?.data ||
          err?.message ||
          'API Key の発行に失敗しました。'
      );
    } finally {
      setApiKeyLoading(false);
    }
  };

  /*
   * =========================================================
   * ダミー: 認証モード変更
   * =========================================================
   */

  const handleAuthModeChange = async (
    newMode: number
  ) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setDummyAuthMode(newMode);

      setSuccessMessage(
        '認証モードは現在ダミー表示です。' +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ダミー: テナントステータス変更
   * =========================================================
   */

  const handleStatusChange = async (
    newStatus: 'active' | 'suspended'
  ) => {
    const actionName =
      newStatus === 'suspended'
        ? '一時停止'
        : '有効化';

    if (
      !window.confirm(
        `テナント '${tenant.tenantId}' を${actionName}しますか？`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setDummyTenantStatus(newStatus);

      setSuccessMessage(
        `テナントを${actionName}しました（ダミー処理）。`
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ダミー: Migration
   * =========================================================
   */

  const handleMigrate = async () => {
    if (
      !window.confirm(
        `テナント '${tenant.tenantId}' の ` +
          `${activeMigrationService} サービスの ` +
          'データベースマイグレーションを実行しますか？'
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setSuccessMessage(
        'マイグレーションは現在ダミー処理です。' +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * ダミー: Health Check
   * =========================================================
   */

  const handleHealthCheck = async () => {
    setActionLoading(true);
    setError(null);
    setDummyHealthStatus(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setDummyHealthStatus({
        dbStatus: 'healthy',
        storageStatus: 'healthy',
        message:
          'Health Check API は現在 OpenAPI に存在しないため、' +
          'ダミーデータを表示しています。'
      });
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================================================
   * API Key コピー
   * =========================================================
   */

  const handleCopyApiKey = async () => {
    if (!apiKeyDisplayValue) {
      return;
    }

    await navigator.clipboard.writeText(
      apiKeyDisplayValue
    );

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  /*
   * =========================================================
   * Styles
   * =========================================================
   */

  const styles = {
    container: {
      padding: '24px 32px',
      maxWidth: '960px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      fontFamily:
        '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      color: '#323130',
      fontSize: '13px',
      lineHeight: '1.6'
    },

    backButton: {
      background: 'none',
      border: 'none',
      color: '#0078d4',
      cursor: 'pointer',
      padding: 0,
      marginBottom: '16px',
      fontSize: '13px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    },

    title: {
      marginTop: 0,
      marginBottom: '8px',
      fontSize: '20px',
      fontWeight: 600,
      color: '#1b1b1b'
    },

    description: {
      color: '#605e5c',
      marginBottom: '20px',
      fontSize: '13px'
    },

    tabBar: {
      display: 'flex',
      borderBottom: '1px solid #e1dfdd',
      marginBottom: '24px'
    },

    tabButton: (isActive: boolean) => ({
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      fontSize: '13px',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#0078d4' : '#323130',
      borderBottom: isActive
        ? '2px solid #0078d4'
        : '2px solid transparent',
      cursor: 'pointer',
      marginBottom: '-1px'
    }),

    sectionContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },

    managementSection: {
      border: '1px solid #e1dfdd',
      borderRadius: '2px',
      padding: '20px 24px',
      backgroundColor: '#ffffff'
    },

    managementSectionTitle: {
      margin: 0,
      marginBottom: '16px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#1b1b1b'
    },

    managementItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },

    managementItemLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '13px',
      color: '#323130',
      fontWeight: 600
    },

    inputSelect: {
      width: '100%',
      maxWidth: '480px',
      height: '32px',
      padding: '0 8px',
      border: '1px solid #605e5c',
      borderRadius: '2px',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      color: '#323130',
      outline: 'none'
    },

    primaryButton: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#0078d4',
      color: '#ffffff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    },

    secondaryButton: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#ffffff',
      color: '#323130',
      border: '1px solid #8a8886',
      borderRadius: '2px',
      fontSize: '13px',
      cursor: 'pointer'
    },

    dangerButton: {
      height: '32px',
      padding: '0 16px',
      backgroundColor: '#a80000',
      color: '#ffffff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      textAlign: 'left' as const,
      fontSize: '13px',
      border: '1px solid #e1dfdd'
    },

    th: {
      backgroundColor: '#faf9f8',
      padding: '10px 12px',
      fontWeight: 600,
      color: '#323130',
      borderBottom: '1px solid #e1dfdd',
      fontSize: '12px'
    },

    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #edebe9',
      verticalAlign: 'middle'
    },

    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },

    modalContainer: {
      backgroundColor: '#ffffff',
      padding: '24px',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid #8a8886',
      boxShadow:
        '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)'
    },

    inputField: {
      width: '100%',
      height: '32px',
      padding: '0 8px',
      border: '1px solid #605e5c',
      borderRadius: '2px',
      fontSize: '13px',
      outline: 'none',
      marginTop: '4px',
      boxSizing: 'border-box' as const
    }
  };

  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (
    <div style={styles.container}>
      {/* =====================================================
          戻る
         ===================================================== */}

      <button
        onClick={onBack}
        style={styles.backButton}
      >
        &larr; テナント一覧に戻る
      </button>

      {/* =====================================================
          タイトル
         ===================================================== */}

      <h2 style={styles.title}>
        テナントの詳細
      </h2>

      <p style={styles.description}>
        テナント{' '}
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600
          }}
        >
          {tenant.tenantId}
        </span>{' '}
        の詳細情報を表示します。
      </p>

      {/* =====================================================
          タブ
         ===================================================== */}

      <div style={styles.tabBar}>
        <button
          onClick={() =>
            setActiveTab('overview')
          }
          style={styles.tabButton(
            activeTab === 'overview'
          )}
        >
          基本情報
        </button>

        <button
          onClick={() =>
            setActiveTab('users')
          }
          style={styles.tabButton(
            activeTab === 'users'
          )}
        >
          所属ユーザー
        </button>

        <button
          onClick={() =>
            setActiveTab('settings')
          }
          style={styles.tabButton(
            activeTab === 'settings'
          )}
        >
          構成・設定
        </button>
      </div>

      {/* =====================================================
          エラー
         ===================================================== */}

      {error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#fde7e9',
            border: '1px solid #f8d7da',
            color: '#a80000',
            borderRadius: '2px',
            marginBottom: '16px'
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          成功メッセージ
         ===================================================== */}

      {successMessage && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#dff6dd',
            border: '1px solid #c3e6cb',
            color: '#107c41',
            borderRadius: '2px',
            marginBottom: '16px'
          }}
        >
          {successMessage}
        </div>
      )}

      {/* =====================================================
          基本情報
         ===================================================== */}

      {activeTab === 'overview' && (
        <div style={styles.sectionContainer}>
          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              テナント基本情報
            </h3>

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
                テナントID
              </span>

              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}
              >
                {tenant.tenantId}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                テナント名
              </span>

              <div>
                {tenant.tenantName}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                表示名
              </span>

              <div>
                {tenant.displayName}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                作成日時
              </span>

              <div>
                {new Date(
                  tenant.createdAt
                ).toLocaleString('ja-JP')}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                更新日時
              </span>

              <div>
                {new Date(
                  tenant.updatedAt
                ).toLocaleString('ja-JP')}
              </div>
            </div>
          </div>

          {/* =================================================
              現在のステータス
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              現在のステータス
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ テナントステータス API は現在の
              OpenAPI に存在しないため、ダミーデータを表示しています。
            </p>

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
                ステータス
              </span>

              <div>
                {dummyTenantStatus ===
                'suspended' ? (
                  <span
                    style={{
                      color: '#a80000',
                      fontWeight: 600
                    }}
                  >
                    ● 一時停止中 (Suspended)
                  </span>
                ) : (
                  <span
                    style={{
                      color: '#107c41',
                      fontWeight: 600
                    }}
                  >
                    ● Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              Health Check
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              システム疎通確認
            </h3>

            <p
              style={{
                margin: '0 0 12px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ Health Check API は現在の OpenAPI
              に存在しないため、ダミー結果を表示します。
            </p>

            <button
              type="button"
              onClick={handleHealthCheck}
              disabled={actionLoading}
              style={styles.secondaryButton}
            >
              {actionLoading
                ? 'テスト実行中...'
                : '接続テストを実行'}
            </button>

            {dummyHealthStatus && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f3f2f1',
                  borderRadius: '2px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong>DB状態:</strong>{' '}
                  {
                    dummyHealthStatus.dbStatus
                  }
                </div>

                <div>
                  <strong>
                    ストレージ状態:
                  </strong>{' '}
                  {
                    dummyHealthStatus.storageStatus
                  }
                </div>

                <div>
                  <strong>
                    メッセージ:
                  </strong>{' '}
                  {
                    dummyHealthStatus.message
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          所属ユーザー: 一覧
         ===================================================== */}

      {activeTab === 'users' &&
        usersView === 'list' && (
          <div style={styles.sectionContainer}>
            <div style={styles.managementSection}>
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
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
                  onClick={openUserModal}
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

              {/* =================================================
                  検索・更新
                 ================================================= */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
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
                  style={
                    styles.secondaryButton
                  }
                >
                  {usersLoading
                    ? '読み込み中...'
                    : '↻ 更新'}
                </button>
              </div>

              {/* =================================================
                  エラー
                 ================================================= */}

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

              {/* =================================================
                  Loading
                 ================================================= */}

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

                            <td
                              style={
                                styles.td
                              }
                            >
                              {userName}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {email}
                            </td>

                            <td
                              style={{
                                ...styles.td,
                                textAlign:
                                  'center'
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    'flex',
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
        )}

      {/* =====================================================
          所属ユーザー: 詳細
         ===================================================== */}

      {activeTab === 'users' &&
        usersView === 'detail' && (
          <div style={styles.sectionContainer}>
            <div style={styles.managementSection}>
              <button
                onClick={closeUserDetail}
                style={styles.backButton}
              >
                &larr; ユーザー一覧に戻る
              </button>

              <h3
                style={styles.managementSectionTitle}
              >
                ユーザー詳細
              </h3>

              {userDetailError && (
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

              {selectedUser && !userDetailLoading && (
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
                    style={styles.dangerButton}
                  >
                    このユーザーを削除
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* =====================================================
          構成・設定
         ===================================================== */}

      {activeTab === 'settings' && (
        <div style={styles.sectionContainer}>
          {/* =================================================
              認証方式
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              認証方式の管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ 認証モード変更 API は現在の OpenAPI
              に存在しないため、以下はダミー設定です。
            </p>

            <div
              style={styles.managementItem}
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                認証方式
              </label>

              <select
                value={dummyAuthMode}
                onChange={(e) =>
                  handleAuthModeChange(
                    Number(
                      e.target.value
                    )
                  )
                }
                disabled={
                  actionLoading
                }
                style={
                  styles.inputSelect
                }
              >
                <option value={0}>
                  JWT (Bearer) のみ
                </option>

                <option value={1}>
                  API Key のみ
                </option>

                <option value={2}>
                  両方許可
                </option>
              </select>
            </div>
          </div>

          {/* =================================================
              API Key
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              API Key 管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ユーザー用の API Key を発行します
              （POST /api/auth/internal/admin/apikey）。
              ※ レスポンスの正確な Schema が未提示のため、
              返却された内容をそのまま表示します。
            </p>

            {apiKeyError && (
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
                {apiKeyError}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '480px'
              }}
            >
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  ログインID{' '}
                  <span
                    style={{
                      color: '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="例: admin"
                  value={apiKeyLoginId}
                  onChange={(e) =>
                    setApiKeyLoginId(
                      e.target.value
                    )
                  }
                  disabled={apiKeyLoading}
                  style={styles.inputField}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  API Key名{' '}
                  <span
                    style={{
                      color: '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="例: テスト用API Key"
                  value={apiKeyName}
                  onChange={(e) =>
                    setApiKeyName(
                      e.target.value
                    )
                  }
                  disabled={apiKeyLoading}
                  style={styles.inputField}
                />
              </div>

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '12px'
                  }}
                >
                  有効期限{' '}
                  <span
                    style={{
                      color: '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="datetime-local"
                  value={apiKeyExpiresAt}
                  onChange={(e) =>
                    setApiKeyExpiresAt(
                      e.target.value
                    )
                  }
                  disabled={apiKeyLoading}
                  style={styles.inputField}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: '16px'
              }}
            >
              <button
                onClick={handleIssueApiKey}
                disabled={apiKeyLoading}
                style={styles.primaryButton}
              >
                {apiKeyLoading
                  ? '発行中...'
                  : apiKeyResult
                  ? 'API Key を再発行'
                  : 'API Key を発行'}
              </button>
            </div>

            {apiKeyDisplayValue && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '560px',
                  marginTop: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <textarea
                  readOnly
                  value={apiKeyDisplayValue}
                  rows={
                    apiKeyDisplayValue.includes(
                      '\n'
                    )
                      ? 6
                      : 1
                  }
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
                  onClick={handleCopyApiKey}
                  style={styles.secondaryButton}
                >
                  {isCopied
                    ? 'コピー完了'
                    : 'コピー'}
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              サービス管理
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              サービスの管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ サービス管理 API は現在の OpenAPI
              に存在しません。以下の操作はダミーです。
            </p>

            <div
              style={styles.managementItem}
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                サービス
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                {[
                  'auth',
                  'drive',
                  'function'
                ].map(
                  (service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() =>
                        handleEnableService(
                          service
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      {
                        service
                      }{' '}
                      を有効化（ダミー）
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              Migration
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              データベースの管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ Migration API は現在の OpenAPI
              に存在しません。以下の操作はダミーです。
            </p>

            <div
              style={styles.managementItem}
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                スキーママイグレーション
              </label>

              <select
                value={
                  activeMigrationService
                }
                onChange={(e) =>
                  setActiveMigrationService(
                    e.target.value
                  )
                }
                disabled={
                  actionLoading
                }
                style={
                  styles.inputSelect
                }
              >
                <option value="auth">
                  Auth
                </option>

                <option value="drive">
                  Drive
                </option>

                <option value="function">
                  Function
                </option>
              </select>

              <button
                type="button"
                onClick={
                  handleMigrate
                }
                disabled={
                  actionLoading
                }
                style={
                  styles.secondaryButton
                }
              >
                {actionLoading
                  ? 'マイグレーション実行中...'
                  : 'マイグレーションを実行（ダミー）'}
              </button>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop:
                  '1px solid #e1dfdd'
              }}
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                マイグレーション履歴
              </label>

              <div
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor:
                    '#faf9f8',
                  border:
                    '1px solid #e1dfdd',
                  borderRadius: '2px'
                }}
              >
                {dummyMigrations.length ===
                0 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      color:
                        '#a19f9d'
                    }}
                  >
                    適用済みの履歴はありません（ダミー）
                  </span>
                ) : (
                  dummyMigrations.map(
                    (
                      migration,
                      index
                    ) => (
                      <div
                        key={index}
                      >
                        {
                          migration.migrationName
                        }
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              テナント運用
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              テナント運用の管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ テナントステータス変更 API は現在の
              OpenAPI に存在しないため、以下はダミー処理です。
            </p>

            <div
              style={styles.managementItem}
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                現在の状態
              </label>

              <div>
                {dummyTenantStatus ===
                'suspended' ? (
                  <span
                    style={{
                      color:
                        '#a80000',
                      fontWeight: 600
                    }}
                  >
                    ● 一時停止中
                  </span>
                ) : (
                  <span
                    style={{
                      color:
                        '#107c41',
                      fontWeight: 600
                    }}
                  >
                    ● Active
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop:
                  '1px solid #e1dfdd'
              }}
            >
              {dummyTenantStatus ===
              'suspended' ? (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      'active'
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  style={{
                    ...styles.primaryButton,
                    backgroundColor:
                      '#107c41'
                  }}
                >
                  テナントを有効化（ダミー）
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      'suspended'
                    )
                  }
                  disabled={
                    actionLoading
                  }
                  style={
                    styles.dangerButton
                  }
                >
                  テナントを一時停止（ダミー）
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              OpenAPI 対応状況
             ================================================= */}

          <div style={styles.managementSection}>
            <h3
              style={styles.managementSectionTitle}
            >
              OpenAPI 対応状況
            </h3>

            <div
              style={{
                fontSize: '12px',
                color: '#605e5c',
                lineHeight: 1.8
              }}
            >
              <div>
                ✓ テナント取得:
                GET /api/mng/tenants/{'{tenantId}'}
              </div>

              <div>
                ✓ テナント一覧:
                GET /api/mng/tenants
              </div>

              <div>
                ✓ テナント作成:
                POST /api/mng/tenants
              </div>

              <div>
                ✓ テナント削除:
                DELETE /api/mng/tenants/{'{tenantId}'}
              </div>

              <div>
                ✓ ユーザー一覧:
                GET /api/mng/tenants/{'{tenantId}'}/users
              </div>

              <div>
                ✓ ユーザー登録:
                POST /api/mng/tenants/{'{tenantId}'}/users
              </div>

              <div>
                ✓ ユーザー詳細:
                GET /api/mng/tenants/{'{tenantId}'}/users/{'{subjectId}'}
              </div>

              <div>
                ✓ ユーザー削除:
                DELETE /api/mng/tenants/{'{tenantId}'}/users/{'{subjectId}'}
              </div>

              <div>
                ✓ API Key 発行:
                POST /api/auth/internal/admin/apikey
              </div>

              <div>
                ○ サービス管理: ダミー
              </div>

              <div>
                ○ 認証モード管理: ダミー
              </div>

              <div>
                ○ ステータス管理: ダミー
              </div>

              <div>
                ○ Migration 管理: ダミー
              </div>

              <div>
                ○ Health Check: ダミー
              </div>
            </div>

            <p
              style={{
                margin: '16px 0 0 0',
                fontSize: '12px',
                color: '#a19f9d'
              }}
            >
              ※ バックエンドの OpenAPI に API が追加されたら、
              実APIへ置き換える。
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          ユーザー登録モーダル
         ===================================================== */}

      {isUserModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={closeUserModal}
        >
          <div
            style={styles.modalContainer}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3
              style={{
                margin:
                  '0 0 16px 0',
                fontSize: '18px',
                fontWeight: 600
              }}
            >
              ユーザーを追加
            </h3>

            <p
              style={{
                margin:
                  '0 0 16px 0',
                color:
                  '#605e5c',
                fontSize: '12px'
              }}
            >
              テナント{' '}
              <span
                style={{
                  fontFamily:
                    'monospace',
                  fontWeight: 600
                }}
              >
                {tenant.tenantId}
              </span>{' '}
              にユーザーを登録します。
            </p>

            {userActionError && (
              <div
                style={{
                  padding:
                    '8px 12px',
                  backgroundColor:
                    '#fde7e9',
                  border:
                    '1px solid #f8d7da',
                  color:
                    '#a80000',
                  fontSize:
                    '12px',
                  marginBottom:
                    '16px'
                }}
              >
                {userActionError}
              </div>
            )}

            <form
              onSubmit={
                handleRegisterUser
              }
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap: '16px'
              }}
            >
              {/* ログインID */}

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize:
                      '12px'
                  }}
                >
                  ログインID{' '}
                  <span
                    style={{
                      color:
                        '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="例: user01"
                  value={
                    newLoginId
                  }
                  onChange={(e) =>
                    setNewLoginId(
                      e.target.value
                    )
                  }
                  disabled={
                    userActionLoading
                  }
                  style={
                    styles.inputField
                  }
                />
              </div>

              {/* パスワード */}

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize:
                      '12px'
                  }}
                >
                  パスワード{' '}
                  <span
                    style={{
                      color:
                        '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <input
                  type="password"
                  required
                  placeholder="パスワード"
                  value={
                    newPassword
                  }
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  disabled={
                    userActionLoading
                  }
                  style={
                    styles.inputField
                  }
                />
              </div>

              {/* ユーザー名 */}

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize:
                      '12px'
                  }}
                >
                  ユーザー名
                </label>

                <input
                  type="text"
                  placeholder="例: 山田 太郎"
                  value={
                    newUserName
                  }
                  onChange={(e) =>
                    setNewUserName(
                      e.target.value
                    )
                  }
                  disabled={
                    userActionLoading
                  }
                  style={
                    styles.inputField
                  }
                />
              </div>

              {/* メールアドレス */}

              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize:
                      '12px'
                  }}
                >
                  メールアドレス
                </label>

                <input
                  type="email"
                  placeholder="例: user@example.com"
                  value={
                    newEmail
                  }
                  onChange={(e) =>
                    setNewEmail(
                      e.target.value
                    )
                  }
                  disabled={
                    userActionLoading
                  }
                  style={
                    styles.inputField
                  }
                />
              </div>

              {/* ボタン */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap: '8px',
                  marginTop:
                    '8px'
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeUserModal
                  }
                  disabled={
                    userActionLoading
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  キャンセル
                </button>

                <button
                  type="submit"
                  disabled={
                    userActionLoading ||
                    !newLoginId.trim() ||
                    !newPassword
                  }
                  style={
                    styles.primaryButton
                  }
                >
                  {userActionLoading
                    ? '登録中...'
                    : '登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetail;
