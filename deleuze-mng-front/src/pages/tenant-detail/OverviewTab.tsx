import React, { useState } from 'react';
import { Tenant } from '../../types';
import styles from '../../components/tenant-detail/TenantDetailStyles';

interface OverviewTabProps {
  tenant: Tenant;
  actionError: string | null;
  onError: (message: string | null) => void;
  onSuccess: (message: string | null) => void;
  clearMessages: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  tenant,
  onError,
  onSuccess
}) => {
  const [actionLoading, setActionLoading] =
    useState(false);

  const [dummyTenantStatus, setDummyTenantStatus] =
    useState<'active' | 'suspended'>('active');

  const [dummyHealthStatus, setDummyHealthStatus] =
    useState<{
      dbStatus: string;
      storageStatus: string;
      message: string;
    } | null>(null);

  const handleHealthCheck = async () => {
    setActionLoading(true);
    onError(null);
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

  return (
    <div style={styles.sectionContainer}>

      {/* 基本情報 */}
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

      {/* ステータス */}
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

      {/* Health Check */}
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
  );
};

export default OverviewTab;