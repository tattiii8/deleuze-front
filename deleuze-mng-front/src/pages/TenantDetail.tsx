import React, { useState } from 'react';
import { Tenant } from '../types';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(
    'overview'
  );

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /*
   * =========================================================
   * 現在の Management API OpenAPI 対応状況
   * =========================================================
   *
   * 実APIとして存在:
   *
   * POST   /api/mng/internal/init
   *
   * POST   /api/mng/tenants
   * GET    /api/mng/tenants
   * GET    /api/mng/tenants/{tenantId}
   * DELETE /api/mng/tenants/{tenantId}
   *
   * POST   /api/mng/tenants/{tenantId}/users
   * GET    /api/mng/tenants/{tenantId}/users
   * GET    /api/mng/tenants/{tenantId}/users/{subjectId}
   * DELETE /api/mng/tenants/{tenantId}/users/{subjectId}
   *
   * 現在 OpenAPI に存在しない:
   *
   * - サービス管理
   * - API Key 管理
   * - 認証モード管理
   * - テナントステータス管理
   * - Migration 管理
   * - Health Check
   *
   * 上記の未実装機能はバックエンドへリクエストせず、
   * UI確認用のダミー処理としている。
   */

  /*
   * =========================================================
   * ダミー状態
   * =========================================================
   *
   * バックエンド側にAPIが追加されたら、
   * それぞれ実APIへ置き換える。
   */

  const [dummyTenantStatus, setDummyTenantStatus] = useState<
    'active' | 'suspended'
  >('active');

  const [dummyAuthMode, setDummyAuthMode] = useState<number>(0);

  const [dummyApiKey, setDummyApiKey] = useState<string | null>(null);

  const [dummyHealthStatus, setDummyHealthStatus] = useState<{
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

  const [isCopied, setIsCopied] = useState(false);

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
      await new Promise((resolve) => setTimeout(resolve, 300));

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
   * ダミー: API Key 発行
   * =========================================================
   */

  const handleGenerateApiKey = async () => {
    if (
      dummyApiKey &&
      !window.confirm(
        'API Key を再発行すると既存のキーは無効になります。よろしいですか？'
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const generatedKey =
        `dummy_${tenant.tenantId}_${Date.now()}`;

      setDummyApiKey(generatedKey);

      setSuccessMessage(
        'API Key は現在ダミー表示です。' +
          'バックエンド API 実装後に接続してください。'
      );
    } finally {
      setActionLoading(false);
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
      await new Promise((resolve) => setTimeout(resolve, 300));

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
      await new Promise((resolve) => setTimeout(resolve, 300));

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
      await new Promise((resolve) => setTimeout(resolve, 300));

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
      await new Promise((resolve) => setTimeout(resolve, 300));

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
    if (!dummyApiKey) {
      return;
    }

    await navigator.clipboard.writeText(dummyApiKey);

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
    }
  };

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
          タブ
         ===================================================== */}

      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('overview')}
          style={styles.tabButton(
            activeTab === 'overview'
          )}
        >
          基本情報
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={styles.tabButton(
            activeTab === 'settings'
          )}
        >
          構成・設定
        </button>
      </div>

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
          {/* =================================================
              テナント基本情報

              GET
              /api/mng/tenants/{tenantId}

              実際のレスポンス:

              {
                "tenantId": "flaubert",
                "tenantName": "flaubert",
                "displayName": "flaubert",
                "createdAt": "...",
                "updatedAt": "..."
              }
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              テナント基本情報
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                rowGap: '16px',
                columnGap: '12px',
                alignItems: 'center'
              }}
            >
              <span style={styles.managementItemLabel}>
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

              <span style={styles.managementItemLabel}>
                テナント名
              </span>

              <div>
                {tenant.tenantName}
              </div>

              <span style={styles.managementItemLabel}>
                表示名
              </span>

              <div>
                {tenant.displayName}
              </div>

              <span style={styles.managementItemLabel}>
                作成日時
              </span>

              <div>
                {new Date(
                  tenant.createdAt
                ).toLocaleString('ja-JP')}
              </div>

              <span style={styles.managementItemLabel}>
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

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
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
                gridTemplateColumns: '200px 1fr',
                rowGap: '16px',
                columnGap: '12px',
                alignItems: 'center'
              }}
            >
              <span style={styles.managementItemLabel}>
                ステータス
              </span>

              <div>
                {dummyTenantStatus === 'suspended' ? (
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

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              システム疎通確認
            </h3>

            <p
              style={{
                margin: '0 0 12px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ Health Check API は現在の OpenAPI に存在しないため、
              ダミー結果を表示します。
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
                  {dummyHealthStatus.dbStatus}
                </div>

                <div>
                  <strong>ストレージ状態:</strong>{' '}
                  {dummyHealthStatus.storageStatus}
                </div>

                <div>
                  <strong>メッセージ:</strong>{' '}
                  {dummyHealthStatus.message}
                </div>
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

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              認証方式の管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ 認証モード変更 API は現在の OpenAPI に存在しないため、
              以下はダミー設定です。
            </p>

            <div style={styles.managementItem}>
              <label style={styles.managementItemLabel}>
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

          {/* =================================================
              API Key

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              API Key 管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ API Key 発行 API は現在の OpenAPI に存在しません。
              UI確認用のダミーキーのみ生成します。
            </p>

            <div style={styles.managementItem}>
              <button
                onClick={handleGenerateApiKey}
                disabled={actionLoading}
                style={styles.primaryButton}
              >
                {dummyApiKey
                  ? 'API Key を再発行（ダミー）'
                  : 'API Key を新規発行（ダミー）'}
              </button>

              {dummyApiKey && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '560px',
                    marginTop: '8px'
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={dummyApiKey}
                    style={{
                      ...styles.inputSelect,
                      flex: 1,
                      fontFamily: 'monospace'
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
          </div>

          {/* =================================================
              サービス管理

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              サービスの管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ サービス管理 API は現在の OpenAPI に存在しません。
              以下の操作はダミーです。
            </p>

            <div style={styles.managementItem}>
              <label style={styles.managementItemLabel}>
                サービス
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                {['auth', 'drive', 'function'].map(
                  (service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() =>
                        handleEnableService(service)
                      }
                      disabled={actionLoading}
                      style={styles.secondaryButton}
                    >
                      {service} を有効化（ダミー）
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              Migration

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              データベースの管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ Migration API は現在の OpenAPI に存在しません。
              以下の操作はダミーです。
            </p>

            <div style={styles.managementItem}>
              <label style={styles.managementItemLabel}>
                スキーママイグレーション
              </label>

              <select
                value={activeMigrationService}
                onChange={(e) =>
                  setActiveMigrationService(
                    e.target.value
                  )
                }
                disabled={actionLoading}
                style={styles.inputSelect}
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
                onClick={handleMigrate}
                disabled={actionLoading}
                style={styles.secondaryButton}
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
                borderTop: '1px solid #e1dfdd'
              }}
            >
              <label style={styles.managementItemLabel}>
                マイグレーション履歴
              </label>

              <div
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: '#faf9f8',
                  border: '1px solid #e1dfdd',
                  borderRadius: '2px'
                }}
              >
                {dummyMigrations.length === 0 ? (
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
                    (migration, index) => (
                      <div key={index}>
                        {migration.migrationName}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              テナント運用

              OpenAPI に存在しないためダミー
             ================================================= */}

          <div style={styles.managementSection}>
            <h3 style={styles.managementSectionTitle}>
              テナント運用の管理
            </h3>

            <p
              style={{
                margin: '0 0 16px 0',
                color: '#605e5c',
                fontSize: '12px'
              }}
            >
              ※ テナントステータス変更 API は現在の OpenAPI
              に存在しないため、以下はダミー処理です。
            </p>

            <div style={styles.managementItem}>
              <label style={styles.managementItemLabel}>
                現在の状態
              </label>

              <div>
                {dummyTenantStatus === 'suspended' ? (
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
                borderTop: '1px solid #e1dfdd'
              }}
            >
              {dummyTenantStatus === 'suspended' ? (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange('active')
                  }
                  disabled={actionLoading}
                  style={{
                    ...styles.primaryButton,
                    backgroundColor: '#107c41'
                  }}
                >
                  テナントを有効化（ダミー）
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange('suspended')
                  }
                  disabled={actionLoading}
                  style={styles.dangerButton}
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
            <h3 style={styles.managementSectionTitle}>
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
                ✓ ユーザー管理:
                /tenants/{'{tenantId}'}/users
              </div>

              <div>
                ○ サービス管理: ダミー
              </div>

              <div>
                ○ API Key 管理: ダミー
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
    </div>
  );
};

export default TenantDetail;