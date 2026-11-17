import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile, UserRole } from '../../types';
import { ensureSupabaseClient, isSupabaseReady } from '../../lib/supabase';
import {
  getCurrentProfile,
  signInLocalSandbox,
  signInWithEmailPassword,
  signOutAdmin,
} from '../../services/adminBackendService';

interface AdminAuthContextType {
  profile: Profile | null;
  loading: boolean;
  isSupabaseMode: boolean;
  loginWithSupabase: (email: string, password: string) => Promise<void>;
  loginLocalSandbox: (displayName: string, role: UserRole) => void;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseMode, setIsSupabaseMode] = useState<boolean>(() => isSupabaseReady());

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const client = await ensureSupabaseClient();
      setIsSupabaseMode(Boolean(client));
      const prof = await getCurrentProfile();
      setProfile(prof);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      await loadSession();
      const client = await ensureSupabaseClient();
      if (active && client) {
        const { data } = client.auth.onAuthStateChange(() => {
          void loadSession();
        });
        unsubscribe = () => data.subscription.unsubscribe();
      }
    };

    void init();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [loadSession]);

  const loginWithSupabase = useCallback(async (email: string, password: string) => {
    const prof = await signInWithEmailPassword(email, password);
    setProfile(prof);
  }, []);

  const loginLocalSandbox = useCallback((displayName: string, role: UserRole) => {
    const prof = signInLocalSandbox(displayName, role);
    setProfile(prof);
  }, []);

  const logout = useCallback(async () => {
    await signOutAdmin();
    setProfile(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        profile,
        loading,
        isSupabaseMode,
        loginWithSupabase,
        loginLocalSandbox,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
