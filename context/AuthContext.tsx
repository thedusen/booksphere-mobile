// context/AuthContext.tsx
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  organizationId: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  organizationId: null,
  isLoading: true,
});

// This hook can be used to access the user info.
export const useAuth = () => {
  return useContext(AuthContext);
};

// This hook will protect the route access based on user authentication.
function useProtectedRoute(session: Session | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(app)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !session &&
      inAuthGroup
    ) {
      // Redirect to the login page.
      router.replace('/login');
    } else if (session && !inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/');
    }
  }, [session, segments, router]); // Re-run the effect when the session or segments change.
}

const ORGANIZATION_ID = '4d65db82-064c-4949-bac9-ea308f8c40b3';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // The custom hook is used here to protect the routes.
  useProtectedRoute(session);

  const value = {
    session,
    user: session?.user ?? null,
    organizationId: session?.user ? ORGANIZATION_ID : null,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};