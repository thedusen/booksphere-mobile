// app/(app)/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to dashboard when authenticated
  return <Redirect href="/dashboard" />;
}