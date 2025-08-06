// app/_layout.tsx
import 'expo-dev-client';
import { AuthProvider } from '@/context/AuthContext';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { SnackbarContainer } from '@/components/common/SnackbarContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { View } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SnackbarProvider>
          <View style={{ flex: 1 }}>
            {/* The Slot component renders the current child route. */}
            {/* The AuthProvider will handle which route that is. */}
            <Slot />
            {/* Global snackbar container positioned at the bottom */}
            <SnackbarContainer />
          </View>
        </SnackbarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}