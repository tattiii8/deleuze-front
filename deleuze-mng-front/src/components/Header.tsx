import React from 'react';
import { Text } from '@fluentui/react';

export const Header: React.FC = () => (
  <div style={{ background: '#0078d4', color: 'white', padding: '0 20px', height: '48px', display: 'flex', alignItems: 'center' }}>
    <Text variant="large" style={{ color: 'white', fontWeight: 600 }}>Deleuze Management Console</Text>
  </div>
);