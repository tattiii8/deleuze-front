import React, { useState, useEffect } from 'react';
import {
  generateApiKey,
  updateAuthMode,
  migrateTenant,
  fetchTenantMigrations,
  fetchTenantStatus,
  updateTenantStatus,
  checkTenantHealth
} from '../api';
import { Tenant } from '../types';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const AVAILABLE_SERVICES = [
  { key: 'drive', label: 'Drive' },
  { key: 'function', label: 'Function' },
];

const AUTH_MODE_LABELS: Record<number, string> = {
  0: 'JWT (Bearer) のみ',
  1: 'API Key のみ',
  2: '両方許可',
};

export const TenantDetail: React.FC<TenantDetailProps> = ({
  tenant,
  onBack,
  onAddService,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(
    'overview'
  );

  // サービスごとのマイグレーション履歴タブの選択状態
  const [activeMigrationService, setActiveMigrationService] = useState<string>(
    AVAILABLE_SERVICES[0]?.key || 'drive'
  );

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const unenabledServices = AVAILABLE_SERVICES.filter(
    (s) => !tenant.services?.includes(s.key)
  );

  const [selectedService, setSelectedService] = useState<string>(
    unenabledServices[0]?.key || ''
  );

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [migrationLoading, setMigrationLoading] = useState<boolean>(false);

  const [migrations, setMigrations] = useState<
    { serviceKey?: string; migrationName: string; appliedAt: string }[]
  >([]);

  const [loadingMigrations, setLoadingMigrations] = useState<boolean>(false);

  const [healthStatus, setHealthStatus] = useState<{
    dbStatus: string;
    storageStatus: string;
    message: string;
  } | null>(null);

  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  const initialAuthMode = (tenant as any).authMode ?? (tenant as any).AuthMode;
  const initialApiKey = (tenant as any).apiKey ?? (tenant as any).ApiKey;

  const [apiKey, setApiKey] = useState<string | null>(
    initialApiKey || null
  );

  const [authMode, setAuthMode] = useState<number>(
    typeof initialAuthMode === 'number' ? initialAuthMode : 0
  );

  /*
   * テナントステータス
   *
   * TenantInfo からではなく、
   * GET /api/mng/tenants/{tenantId}/status
   * で取得する。
   */
  const [tenantStatus, setTenantStatus] = useState<
    'active' | 'suspended'
  >('active');

  const [isCopied, setIsCopied] = useState<boolean>(false);

  /**
   * テナントの現在のステータスを取得
   */
  const loadTenantStatus = async () => {
    try {
      const data = await fetchTenantStatus(tenant.tenantId);

      if (data.status === 'active' || data.status === 'suspended') {
        setTenantStatus(data.status);
      }
    } catch (err) {
      console.error(
        'テナントステータスの取得に失敗しました。',
        err
      );

      setError(
        'テナントのステータス取得に失敗しました。'
      );
    }
  };

  /**
   * テナント情報が変更されたときに各種情報を再取得
   */
  useEffect(() => {
    const currentAuthMode =
      (tenant as any).authMode ?? (tenant as any).AuthMode;

    const currentApiKey =
      (tenant as any).apiKey ?? (tenant as any).ApiKey;

    if (typeof currentAuthMode === 'number') {
      setAuthMode(currentAuthMode);
    }

    setApiKey(currentApiKey || null);

    loadTenantStatus();
    loadMigrations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  /**
   * マイグレーション履歴を取得
   */
  const loadMigrations = async () => {
    setLoadingMigrations(true);

    try {
      const data = await fetchTenantMigrations(tenant.tenantId);
      setMigrations(data);
    } catch (err) {
      setMigrations([]);
    } finally {
      setLoadingMigrations(false);
    }
  };

  /**
   * サービスを有効化
   */
  const handleEnableService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onAddService(
        tenant.tenantId,
        selectedService
      );

      setSuccessMessage(
        `サービス '${selectedService}' を有効化しました。`
      );

      const updatedUnenabled = unenabledServices.filter(
        (s) => s.key !== selectedService
      );

      setSelectedService(
        updatedUnenabled[0]?.key || ''
      );
    } catch (err: any) {
      setError(
        err.message ||
          'サービスの有効化に失敗しました。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * API Key を発行
   */
  const handleGenerateApiKey = async () => {
    if (
      apiKey &&
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
      const res = await generateApiKey(
        tenant.tenantId
      );

      setApiKey(res.apiKey);

      setSuccessMessage(
        '新しい API Key を発行しました。安全な場所に保存してください。'
      );

      await onRefresh();
    } catch (err: any) {
      setError(
        err.message ||
          'API Key の発行に失敗しました。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * 認証モード変更
   */
  const handleAuthModeChange = async (
    newMode: number
  ) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateAuthMode(
        tenant.tenantId,
        newMode
      );

      setAuthMode(newMode);

      setSuccessMessage(
        '認証モードを更新しました。'
      );

      await onRefresh();
    } catch (err: any) {
      setError(
        err.message ||
          '認証モードの更新に失敗しました。'
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * テナントステータス変更
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
      await updateTenantStatus(
        tenant.tenantId,
        newStatus
      );

      /*
       * PATCH の結果をそのまま信用するのではなく、
       * GET /status でDB上の最新状態を取得する。
       */
      await loadTenantStatus();

      setSuccessMessage(
        `テナントを${actionName}しました。`
      );

      await onRefresh();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          `テナントの${actionName}に失敗しました。`
      );
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * マイグレーション実行
   */
  const handleMigrate = async () => {
    const service = AVAILABLE_SERVICES.find(
      (s) =>
        s.key === activeMigrationService
    );

    const serviceLabel =
      service?.label ||
      activeMigrationService;

    if (
      !window.confirm(
        `テナント '${tenant.tenantId}' の ${serviceLabel} サービスのデータベースマイグレーションを実行しますか？`
      )
    ) {
      return;
    }

    setMigrationLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await migrateTenant(
        tenant.tenantId,
        activeMigrationService
      );

      setSuccessMessage(
        res.message ||
          `テナント '${tenant.tenantId}' の ${serviceLabel} のマイグレーションが完了しました。`
      );

      await loadMigrations();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          `${serviceLabel} のマイグレーションの実行に失敗しました。`
      );
    } finally {
      setMigrationLoading(false);
    }
  };

  /**
   * ヘルスチェック
   */
  const handleHealthCheck = async () => {
    setHealthLoading(true);
    setHealthStatus(null);
    setError(null);

    try {
      const res = await checkTenantHealth(
        tenant.tenantId
      );

      setHealthStatus(res);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'ヘルスチェックの実行に失敗しました。'
      );
    } finally {
      setHealthLoading(false);
    }
  };

  /**
   * API Key コピー
   */
  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);

      setIsCopied(true);

      setTimeout(
        () => setIsCopied(false),
        2000
      );
    }
  };

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

    managementSectionDescription: {
      margin: '0 0 16px 0',
      fontSize: '12px',
      color: '#605e5c'
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

    infoIcon: {
      color: '#605e5c',
      fontSize: '12px',
      cursor: 'help'
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

    subTabBar: {
      display: 'flex',
      gap: '24px',
      borderBottom: '1px solid #e1dfdd',
      marginBottom: '12px'
    },

    subTabButton: (isActive: boolean) => ({
      background: 'none',
      border: 'none',
      padding: '4px 0 8px 0',
      fontSize: '13px',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#0078d4' : '#323130',
      cursor: 'pointer',
      position: 'relative' as const,
      boxShadow: isActive
        ? 'inset 0 -2px 0 0 #0078d4'
        : 'none'
    })
  };

  return (
    <div style={styles.container}>
      <button
        onClick={onBack}
        style={styles.backButton}
      >
        &larr; テナント一覧に戻る
      </button>

      {/* メインタブ切り替え */}
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
            setActiveTab('settings')
          }
          style={styles.tabButton(
            activeTab === 'settings'
          )}
        >
          構成・設定
        </button>
      </div>

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
        の各種設定および有効化サービスを管理します。
      </p>

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

      {/* =========================================================
          タブ 1: 基本情報
          ========================================================= */}
      {activeTab === 'overview' && (
        <div style={styles.sectionContainer}>
          {/* 現在のステータス */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              現在のステータス
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
              <span
                style={
                  styles.managementItemLabel
                }
              >
                ライセンス状況
                <span
                  style={styles.infoIcon}
                  title="テナントの稼働または一時停止"
                >
                  ⓘ
                </span>
              </span>

              <div>
                {tenantStatus ===
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

              <span
                style={
                  styles.managementItemLabel
                }
              >
                現在の認証方式
                <span
                  style={styles.infoIcon}
                  title="設定されている認証モード"
                >
                  ⓘ
                </span>
              </span>

              <div
                style={{
                  fontWeight: 600
                }}
              >
                {AUTH_MODE_LABELS[authMode] ||
                  '不明'}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                API Key ステータス
                <span
                  style={styles.infoIcon}
                  title="API Keyの有無"
                >
                  ⓘ
                </span>
              </span>

              <div>
                {apiKey ? (
                  <span
                    style={{
                      color: '#107c41',
                      fontWeight: 600
                    }}
                  >
                    ● 発行済み
                  </span>
                ) : (
                  <span
                    style={{
                      color: '#a19f9d'
                    }}
                  >
                    未発行
                  </span>
                )}
              </div>

              <span
                style={
                  styles.managementItemLabel
                }
              >
                有効化済みサービス
                <span
                  style={styles.infoIcon}
                  title="利用可能なサービス"
                >
                  ⓘ
                </span>
              </span>

              <div>
                {tenant.services &&
                tenant.services.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {tenant.services.map(
                      (s) => (
                        <span
                          key={s}
                          style={{
                            backgroundColor:
                              '#f3f2f1',
                            border:
                              '1px solid #8a8886',
                            padding:
                              '2px 8px',
                            borderRadius:
                              '2px',
                            fontSize: '12px'
                          }}
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <span
                    style={{
                      color: '#a19f9d'
                    }}
                  >
                    なし
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* システム疎通確認 */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              システム疎通確認
            </h3>

            <button
              type="button"
              onClick={handleHealthCheck}
              disabled={healthLoading}
              style={styles.secondaryButton}
            >
              {healthLoading
                ? 'テスト実行中...'
                : '接続テストを実行'}
            </button>

            {healthStatus && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor:
                    '#f3f2f1',
                  borderRadius: '2px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong>DB状態:</strong>{' '}
                  {healthStatus.dbStatus}
                </div>

                <div>
                  <strong>
                    ストレージ状態:
                  </strong>{' '}
                  {healthStatus.storageStatus}
                </div>

                <div>
                  <strong>
                    メッセージ:
                  </strong>{' '}
                  {healthStatus.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          タブ 2: 構成・設定
          ========================================================= */}
      {activeTab === 'settings' && (
        <div style={styles.sectionContainer}>
          {/* =====================================================
              1. 認証方式の管理
              ===================================================== */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              認証方式の管理
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* 認証方式 */}
              <div
                style={
                  styles.managementItem
                }
              >
                <label
                  style={
                    styles.managementItemLabel
                  }
                >
                  認証方式
                  <span
                    style={{
                      color: '#a80000'
                    }}
                  >
                    *
                  </span>
                </label>

                <select
                  value={authMode}
                  onChange={(e) =>
                    handleAuthModeChange(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  disabled={actionLoading}
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

              {/* API Key */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop:
                    '1px solid #e1dfdd'
                }}
              >
                <div
                  style={
                    styles.managementItem
                  }
                >
                  <label
                    style={
                      styles.managementItemLabel
                    }
                  >
                    API Key 管理
                    <span
                      style={{
                        color: '#a80000'
                      }}
                    >
                      *
                    </span>
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems:
                        'center',
                      flexWrap:
                        'wrap'
                    }}
                  >
                    <button
                      onClick={
                        handleGenerateApiKey
                      }
                      disabled={
                        actionLoading
                      }
                      style={
                        styles.primaryButton
                      }
                    >
                      {apiKey
                        ? 'API Key を再発行'
                        : 'API Key を新規発行'}
                    </button>

                    {apiKey && (
                      <div
                        style={{
                          display:
                            'flex',
                          gap: '8px',
                          width:
                            '100%',
                          maxWidth:
                            '480px',
                          marginTop:
                            '8px'
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          value={
                            apiKey
                          }
                          style={{
                            ...styles.inputSelect,
                            flex: 1,
                            fontFamily:
                              'monospace'
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
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              2. サービスの管理
              ===================================================== */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              サービスの管理
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* 有効化済みサービス */}
              <div
                style={
                  styles.managementItem
                }
              >
                <label
                  style={
                    styles.managementItemLabel
                  }
                >
                  有効化済みサービス
                </label>

                {tenant.services &&
                tenant.services.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    {tenant.services.map(
                      (s) => (
                        <span
                          key={s}
                          style={{
                            backgroundColor:
                              '#f3f2f1',
                            border:
                              '1px solid #8a8886',
                            padding:
                              '2px 8px',
                            borderRadius:
                              '2px',
                            fontSize:
                              '12px'
                          }}
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <span
                    style={{
                      color: '#a19f9d'
                    }}
                  >
                    なし
                  </span>
                )}
              </div>

              {/* 追加サービス */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop:
                    '1px solid #e1dfdd'
                }}
              >
                <div
                  style={
                    styles.managementItem
                  }
                >
                  <label
                    style={
                      styles.managementItemLabel
                    }
                  >
                    追加サービス有効化
                  </label>

                  {unenabledServices.length >
                  0 ? (
                    <form
                      onSubmit={
                        handleEnableService
                      }
                      style={{
                        display:
                          'flex',
                        gap: '12px',
                        alignItems:
                          'center'
                      }}
                    >
                      <select
                        value={
                          selectedService
                        }
                        onChange={(
                          e
                        ) =>
                          setSelectedService(
                            e.target
                              .value
                          )
                        }
                        disabled={
                          actionLoading
                        }
                        style={
                          styles.inputSelect
                        }
                      >
                        {unenabledServices.map(
                          (s) => (
                            <option
                              key={
                                s.key
                              }
                              value={
                                s.key
                              }
                            >
                              {
                                s.label
                              }
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="submit"
                        disabled={
                          actionLoading ||
                          !selectedService
                        }
                        style={{
                          ...styles.primaryButton,
                          backgroundColor:
                            '#107c41'
                        }}
                      >
                        有効化
                      </button>
                    </form>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color:
                          '#605e5c'
                      }}
                    >
                      追加可能なサービスはすべて有効化されています。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              3. データベースの管理
              ===================================================== */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              データベースの管理
            </h3>

            {/* マイグレーション実行 */}
            <div
              style={
                styles.managementItem
              }
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                スキーママイグレーション
              </label>

              <div>
                <button
                  type="button"
                  onClick={
                    handleMigrate
                  }
                  disabled={
                    migrationLoading ||
                    actionLoading
                  }
                  style={{
                    ...styles.secondaryButton,
                    fontWeight: 600
                  }}
                >
                  {migrationLoading
                    ? 'マイグレーション実行中...'
                    : 'データベースのマイグレーションを実行'}
                </button>
              </div>
            </div>

            {/* 履歴 */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop:
                  '1px solid #e1dfdd'
              }}
            >
              <div
                style={
                  styles.managementItem
                }
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
                    maxWidth:
                      '540px'
                  }}
                >
                  <div
                    style={
                      styles.subTabBar
                    }
                  >
                    {AVAILABLE_SERVICES.map(
                      (service) => (
                        <button
                          key={
                            service.key
                          }
                          onClick={() =>
                            setActiveMigrationService(
                              service.key
                            )
                          }
                          style={styles.subTabButton(
                            activeMigrationService ===
                              service.key
                          )}
                        >
                          {
                            service.label
                          }
                        </button>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      padding:
                        '12px',
                      backgroundColor:
                        '#faf9f8',
                      border:
                        '1px solid #e1dfdd',
                      borderRadius:
                        '2px',
                      maxHeight:
                        '160px',
                      overflowY:
                        'auto'
                    }}
                  >
                    {loadingMigrations ? (
                      <div
                        style={{
                          fontSize:
                            '12px',
                          color:
                            '#605e5c'
                        }}
                      >
                        履歴を読み込み中...
                      </div>
                    ) : (
                      (() => {
                        const filteredMigrations =
                          migrations.filter(
                            (m) =>
                              (m.serviceKey ||
                                'drive') ===
                              activeMigrationService
                          );

                        return filteredMigrations.length >
                          0 ? (
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft:
                                '16px',
                              fontSize:
                                '12px',
                              color:
                                '#605e5c'
                            }}
                          >
                            {filteredMigrations.map(
                              (
                                m,
                                idx
                              ) => (
                                <li
                                  key={
                                    idx
                                  }
                                  style={{
                                    marginBottom:
                                      '4px'
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily:
                                        'monospace',
                                      fontWeight:
                                        600
                                    }}
                                  >
                                    {
                                      m.migrationName
                                    }
                                  </span>

                                  <span
                                    style={{
                                      color:
                                        '#a19f9d',
                                      marginLeft:
                                        '8px'
                                    }}
                                  >
                                    (
                                    {new Date(
                                      m.appliedAt
                                    ).toLocaleString()}
                                    )
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <div
                            style={{
                              fontSize:
                                '12px',
                              color:
                                '#a19f9d'
                            }}
                          >
                            適用済みの履歴はありません（未有効化または未実行）
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              4. テナント運用の管理
              ===================================================== */}
          <div style={styles.managementSection}>
            <h3
              style={
                styles.managementSectionTitle
              }
            >
              テナント運用の管理
            </h3>

            <div
              style={
                styles.managementItem
              }
            >
              <label
                style={
                  styles.managementItemLabel
                }
              >
                ライセンス状況
              </label>

              <div>
                {tenantStatus ===
                'suspended' ? (
                  <span
                    style={{
                      color:
                        '#a80000',
                      fontWeight:
                        600
                    }}
                  >
                    ● 一時停止中 (Suspended)
                  </span>
                ) : (
                  <span
                    style={{
                      color:
                        '#107c41',
                      fontWeight:
                        600
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
              <div
                style={
                  styles.managementItem
                }
              >
                <label
                  style={
                    styles.managementItemLabel
                  }
                >
                  テナントの状態変更
                </label>

                <div>
                  {tenantStatus ===
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
                      テナントを有効化 (再開) する
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
                      テナントを一時停止する
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetail;