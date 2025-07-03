// app/_layout.tsx
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* The Slot component renders the current child route. */}
        {/* The AuthProvider will handle which route that is. */}
        <Slot />
      </AuthProvider>
    </QueryClientProvider>
  );
}