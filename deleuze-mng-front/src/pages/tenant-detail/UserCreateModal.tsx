import React, { useState } from 'react';
import { Tenant } from '../../types';
import { registerUser } from '../../api';
import styles from '../../components/tenant-detail/TenantDetailStyles';

interface UserCreateModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  tenant,
  onClose,
  onSuccess,
  onError
}) => {
  const [newLoginId, setNewLoginId] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [newUserName, setNewUserName] =
    useState('');

  const [newEmail, setNewEmail] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newLoginId.trim()) {
      setError(
        'ログインIDを入力してください。'
      );
      return;
    }

    if (!newPassword) {
      setError(
        'パスワードを入力してください。'
      );
      return;
    }

    setLoading(true);
    setError(null);

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

      onSuccess(
        `ユーザー '${newLoginId.trim()}' を登録しました。`
      );

      onClose();
    } catch (err: any) {
      console.error(
        'Failed to register user:',
        err
      );

      const message =
        err?.response?.data ||
        err?.message ||
        'ユーザーの登録に失敗しました。';

      setError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  return (
    <div
      style={styles.modalOverlay}
      onClick={handleClose}
    >
      <div
        style={styles.modalContainer}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          ユーザーを追加
        </h3>

        <p
          style={{
            margin: '0 0 16px 0',
            color: '#605e5c',
            fontSize: '12px'
          }}
        >
          テナント{' '}
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 600
            }}
          >
            {tenant.tenantId}
          </span>{' '}
          にユーザーを登録します。
        </p>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fde7e9',
              border: '1px solid #f8d7da',
              color: '#a80000',
              fontSize: '12px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* ログインID */}
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
              required
              autoFocus
              placeholder="例: user01"
              value={newLoginId}
              onChange={(e) =>
                setNewLoginId(
                  e.target.value
                )
              }
              disabled={loading}
              style={styles.inputField}
            />
          </div>

          {/* パスワード */}
          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              パスワード{' '}
              <span
                style={{
                  color: '#a80000'
                }}
              >
                *
              </span>
            </label>

            <input
              type="password"
              required
              placeholder="パスワード"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              disabled={loading}
              style={styles.inputField}
            />
          </div>

          {/* ユーザー名 */}
          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              ユーザー名
            </label>

            <input
              type="text"
              placeholder="例: 山田 太郎"
              value={newUserName}
              onChange={(e) =>
                setNewUserName(
                  e.target.value
                )
              }
              disabled={loading}
              style={styles.inputField}
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              メールアドレス
            </label>

            <input
              type="email"
              placeholder="例: user@example.com"
              value={newEmail}
              onChange={(e) =>
                setNewEmail(
                  e.target.value
                )
              }
              disabled={loading}
              style={styles.inputField}
            />
          </div>

          {/* ボタン */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={styles.secondaryButton}
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !newLoginId.trim() ||
                !newPassword
              }
              style={styles.primaryButton}
            >
              {loading
                ? '登録中...'
                : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;