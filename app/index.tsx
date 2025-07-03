// app/index.tsx
import { Redirect } from 'expo-router';

// This component will never be visible.
// It immediately redirects to the protected (app) group.
// The AppLayout component will then decide whether to show the app
// or redirect to the login screen.
export default function StartPage() {
  return <Redirect href="/(app)" />;
}