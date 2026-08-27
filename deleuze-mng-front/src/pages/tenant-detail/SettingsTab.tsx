import React, { useState } from 'react';

import { Tenant } from '../../types';
import { issueApiKey } from '../../api';

import styles from '../../components/tenant-detail/TenantDetailStyles';

interface SettingsTabProps {
  tenant: Tenant;
  onError: (message: string | null) => void;
  onSuccess: (message: string | null) => void;
  clearMessages: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  tenant,
  onError,
  onSuccess
}) => {
  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * 認証方式
   */
  const [dummyAuthMode, setDummyAuthMode] =
    useState<number>(0);

  /*
   * API Key
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

  const [isCopied, setIsCopied] =
    useState(false);

  /*
   * Migration
   */
  const [activeMigrationService, setActiveMigrationService] =
    useState('auth');

  const [dummyMigrations] = useState<
    {
      serviceKey?: string;
      migrationName: string;
      appliedAt: string;
    }[]
  >([]);

  /*
   * Tenant Status
   */
  const [dummyTenantStatus, setDummyTenantStatus] =
    useState<'active' | 'suspended'>('active');

  /*
   * API Key 表示値
   */
  const apiKeyDisplayValue: string | null =
    (() => {
      if (
        apiKeyResult === null ||
        apiKeyResult === undefined
      ) {
        return null;
      }

      if (
        typeof apiKeyResult === 'string'
      ) {
        return apiKeyResult;
      }

      if (
        typeof apiKeyResult === 'object'
      ) {
        const obj =
          apiKeyResult as Record<
            string,
            any
          >;

        const candidate =
          obj.apiKey ||
          obj.key ||
          obj.token ||
          obj.secret;

        if (
          typeof candidate === 'string'
        ) {
          return candidate;
        }

        return JSON.stringify(
          obj,
          null,
          2
        );
      }

      return String(apiKeyResult);
    })();

  /*
   * 認証方式変更
   */
  const handleAuthModeChange = async (
    newMode: number
  ) => {
    setActionLoading(true);
    onError(null);
    onSuccess(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setDummyAuthMode(newMode);

      onSuccess(
        '認証モードは現在ダミー表示です。' +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * API Key 発行
   */
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
    onError(null);
    onSuccess(null);

    try {
      const expiresAtIso =
        new Date(
          apiKeyExpiresAt
        ).toISOString();

      const data =
        await issueApiKey({
          tenantId:
            tenant.tenantId,
          loginId:
            apiKeyLoginId.trim(),
          name:
            apiKeyName.trim(),
          expiresAt:
            expiresAtIso
        });

      setApiKeyResult(data);

      onSuccess(
        'API Key を発行しました。'
      );
    } catch (err: any) {
      console.error(
        'Failed to issue API key:',
        err
      );

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
   * API Key コピー
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
   * サービス
   */
  const handleEnableService = async (
    serviceKey: string
  ) => {
    setActionLoading(true);
    onError(null);
    onSuccess(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      onSuccess(
        `サービス '${serviceKey}' の有効化処理はダミーです。` +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * Migration
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
    onError(null);
    onSuccess(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      onSuccess(
        'マイグレーションは現在ダミー処理です。' +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * テナントステータス
   */
  const handleStatusChange = async (
    newStatus:
      | 'active'
      | 'suspended'
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
    onError(null);
    onSuccess(null);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setDummyTenantStatus(
        newStatus
      );

      onSuccess(
        `テナントを${actionName}しました（ダミー処理）。`
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.sectionContainer}>

      {/* 認証方式 */}
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

        <div style={styles.managementItem}>
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
                Number(e.target.value)
              )
            }
            disabled={actionLoading}
            style={styles.inputSelect}
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

      {/* API Key */}
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
              border:
                '1px solid #f8d7da',
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
            onClick={
              handleIssueApiKey
            }
            disabled={apiKeyLoading}
            style={
              styles.primaryButton
            }
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
              alignItems:
                'flex-start'
            }}
          >
            <textarea
              readOnly
              value={
                apiKeyDisplayValue
              }
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
                fontFamily:
                  'monospace',
                resize: 'vertical'
              }}
            />

            <button
              onClick={
                handleCopyApiKey
              }
              style={
                styles.secondaryButton
              }
            >
              {isCopied
                ? 'コピー完了'
                : 'コピー'}
            </button>
          </div>
        )}
      </div>

      {/* サービス管理 */}
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

        <div style={styles.managementItem}>
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
            ].map((service) => (
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
                {service} を有効化（ダミー）
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Migration */}
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

        <div style={styles.managementItem}>
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
                  color: '#a19f9d'
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

      {/* テナント運用 */}
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

        <div style={styles.managementItem}>
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
                  color: '#a80000',
                  fontWeight: 600
                }}
              >
                ● 一時停止中
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

      {/* OpenAPI */}
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
  );
};

export default SettingsTab;