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
  isLoadingOrganization: boolean;
  organizationError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  organizationId: null,
  isLoading: true,
  isLoadingOrganization: false,
  organizationError: null,
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

// Function to fetch user's organization from the database
const fetchUserOrganization = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_organizations')
      .select('organizations_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    return data?.organizations_id || null;
  } catch (error) {
    console.error('Error in fetchUserOrganization:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoadingOrganization, setIsLoadingOrganization] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  // Effect to handle organization fetching when user changes
  useEffect(() => {
    const loadOrganization = async (user: User) => {
      setIsLoadingOrganization(true);
      setOrganizationError(null);
      
      const orgId = await fetchUserOrganization(user.id);
      
      if (orgId) {
        setOrganizationId(orgId);
      } else {
        setOrganizationError('No organization found for user');
        setOrganizationId(null);
      }
      
      setIsLoadingOrganization(false);
    };

    if (session?.user) {
      loadOrganization(session.user);
    } else {
      // Clear organization data when user logs out
      setOrganizationId(null);
      setOrganizationError(null);
      setIsLoadingOrganization(false);
    }
  }, [session?.user?.id]);

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
    organizationId,
    isLoading,
    isLoadingOrganization,
    organizationError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};