import React, { useState } from 'react';
import {
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  Separator,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import { Tenant } from '../types';

interface Props {
  tenant: Tenant;
  onBack: () => void;
  onAddService: (tenantId: string, serviceKey: string) => Promise<void>;
}

const SERVICE_OPTIONS: IDropdownOption[] = [
  { key: 'drive', text: 'Drive (deleuze-drive)' },
  { key: 'analytics', text: 'Analytics' },
  { key: 'kms', text: 'KMS' }
];

export const TenantDetail: React.FC<Props> = ({ tenant, onBack, onAddService }) => {
  const [selectedService, setSelectedService] = useState<string>('drive');
  const [msg, setMsg] = useState<{ text: string; type: MessageBarType } | null>(null);

  const services = tenant.enabledServices || tenant.services || [];

  const handleAdd = async () => {
    try {
      await onAddService(tenant.tenantId, selectedService);
      setMsg({ text: `サービス '${selectedService}' を追加しました。`, type: MessageBarType.success });
    } catch (err: any) {
      setMsg({ text: err.message || '追加に失敗しました', type: MessageBarType.error });
    }
  };

  return (
    <Stack tokens={{ childrenGap: 20 }} style={{ marginTop: 15 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} onClick={onBack}>
          一覧へ戻る
        </DefaultButton>
        <Text variant="xLarge">テナント詳細: {tenant.tenantId}</Text>
      </Stack>

      {msg && <MessageBar messageBarType={msg.type}>{msg.text}</MessageBar>}

      <Stack tokens={{ childrenGap: 10 }} style={{ background: '#f3f2f1', padding: 20, borderRadius: 4 }}>
        <Text variant="large">有効化済みサービス</Text>
        {services.length > 0 ? (
          <Stack tokens={{ childrenGap: 5 }}>
            {services.map((s: string) => (
              <Text key={s} variant="medium">• {s}</Text>
            ))}
          </Stack>
        ) : (
          <Text variant="medium">有効なサービスはありません</Text>
        )}
      </Stack>

      <Separator />

      <Stack tokens={{ childrenGap: 10 }} style={{ maxWidth: 400 }}>
        <Text variant="large">サービス追加</Text>
        <Dropdown
          label="有効化するサービスを選択"
          selectedKey={selectedService}
          options={SERVICE_OPTIONS}
          onChange={(_, opt) => setSelectedService(opt?.key as string)}
        />
        <PrimaryButton iconProps={{ iconName: 'Add' }} onClick={handleAdd} style={{ width: 120 }}>
          サービス追加
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};