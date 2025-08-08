// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  // The AuthProvider now handles protecting this route.
  // This component's only job is to define the stack for the authenticated screens.
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F9FBF9',
        },
        headerTitleStyle: {
          color: '#1F2937',
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
        headerTintColor: '#007AFF', // iOS blue for back button
      }}
    >
      {/* Main screens - these will have bottom tab bar */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerTitle: 'Dashboard', headerShown: true }} />
      <Stack.Screen name="inventory" options={{ headerTitle: 'Inventory', headerShown: true }} />
      <Stack.Screen name="catalog-jobs" options={{ headerTitle: 'Cataloging Jobs', headerShown: true }} />
      <Stack.Screen name="settings" options={{ headerTitle: 'Settings', headerShown: true }} />
      
      {/* Other screens */}
      <Stack.Screen name="catalog-new" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      <Stack.Screen name="manual-entry" options={{ headerTitle: 'Manual Entry', headerShown: true }} />
      <Stack.Screen name="catalog-review/[job_id]" options={{ headerTitle: 'Review Book', headerShown: true }} />
      <Stack.Screen name="book-summary/[id]" options={{ headerTitle: 'Book Details', headerShown: true }} />
      <Stack.Screen name="stock-item/[id]" options={{ headerTitle: 'Stock Item', headerShown: true }} />
      <Stack.Screen name="add-to-inventory" options={{ headerTitle: 'Add to Inventory', headerShown: true }} />
      <Stack.Screen name="edit-book" options={{ headerTitle: 'Edit Book', headerShown: true }} />
      <Stack.Screen name="add-success" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ headerTitle: 'Review', headerShown: true }} />
    </Stack>
  );
}