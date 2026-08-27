import React, { useState } from 'react';
import { Tenant } from '../types';

import OverviewTab from './tenant-detail/OverviewTab';
import UsersTab from './tenant-detail/UsersTab';
import SettingsTab from './tenant-detail/SettingsTab';

import styles from '../components/tenant-detail/TenantDetailStyles';

interface TenantDetailProps {
  tenant: Tenant;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

type Tab = 'overview' | 'users' | 'settings';

const TenantDetail: React.FC<TenantDetailProps> = ({
  tenant,
  onBack,
  onRefresh
}) => {
  const [activeTab, setActiveTab] =
    useState<Tab>('overview');

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const handleError = (message: string | null) => {
    setError(message);
  };

  const handleSuccess = (message: string | null) => {
    setSuccessMessage(message);
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div style={styles.container}>

      {/* 戻る */}
      <button
        onClick={onBack}
        style={styles.backButton}
      >
        &larr; テナント一覧に戻る
      </button>

      {/* タイトル */}
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

      {/* タブ */}
      <div style={styles.tabBar}>
        <button
          onClick={() => {
            setActiveTab('overview');
            clearMessages();
          }}
          style={styles.tabButton(
            activeTab === 'overview'
          )}
        >
          基本情報
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            clearMessages();
          }}
          style={styles.tabButton(
            activeTab === 'users'
          )}
        >
          所属ユーザー
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            clearMessages();
          }}
          style={styles.tabButton(
            activeTab === 'settings'
          )}
        >
          構成・設定
        </button>
      </div>

      {/* 共通エラー */}
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

      {/* 共通成功メッセージ */}
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

      {/* 基本情報 */}
      {activeTab === 'overview' && (
        <OverviewTab
          tenant={tenant}
          actionError={error}
          onError={handleError}
          onSuccess={handleSuccess}
          clearMessages={clearMessages}
        />
      )}

      {/* 所属ユーザー */}
      {activeTab === 'users' && (
        <UsersTab
          tenant={tenant}
          onError={handleError}
          onSuccess={handleSuccess}
          clearMessages={clearMessages}
        />
      )}

      {/* 構成・設定 */}
      {activeTab === 'settings' && (
        <SettingsTab
          tenant={tenant}
          onError={handleError}
          onSuccess={handleSuccess}
          clearMessages={clearMessages}
        />
      )}
    </div>
  );
};

export default TenantDetail;