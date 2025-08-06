import React from 'react';
import { View } from 'react-native';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Snackbar } from './Snackbar';

export const SnackbarContainer: React.FC = () => {
  const { messages, dismissSnackbar } = useSnackbar();

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      {messages.map((message, index) => (
        <Snackbar
          key={message.id}
          {...message}
          onDismiss={dismissSnackbar}
          visible={message.visible}
        />
      ))}
    </View>
  );
};