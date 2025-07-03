// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  // The AuthProvider now handles protecting this route.
  // This component's only job is to define the stack for the authenticated screens.
  return (
    <Stack>
      <Stack.Screen name="index" options={{ 
        headerShown: false,
        title: "Home"
      }} />
      <Stack.Screen name="inventory" options={{ 
        headerTitle: 'Inventory',
        headerBackTitle: 'Home'
      }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      {/* Add other protected screens here */}
    </Stack>
  );
}