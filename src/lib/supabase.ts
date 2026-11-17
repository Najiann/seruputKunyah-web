import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const buildTimeUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const buildTimeAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

function isValidPublicConfig(url: string, anonKey: string): boolean {
  return Boolean(
    url &&
      anonKey &&
      !url.includes('your-project-ref') &&
      !anonKey.includes('your-supabase-anon-key')
  );
}

let cachedClient: SupabaseClient | null = isValidPublicConfig(buildTimeUrl, buildTimeAnonKey)
  ? createClient(buildTimeUrl, buildTimeAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

let runtimeLookupPromise: Promise<SupabaseClient | null> | null = null;

export function isSupabaseReady(): boolean {
  return cachedClient !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  return cachedClient;
}

/**
 * Resolves the Supabase client from build-time Vite env OR runtime `/api/supabase-config`
 * (used in AI Studio preview and Cloud Run where Secrets are injected at runtime).
 */
export async function ensureSupabaseClient(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;

  if (!runtimeLookupPromise) {
    runtimeLookupPromise = (async () => {
      try {
        const res = await fetch('/api/supabase-config', { cache: 'no-store' });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          configured?: boolean;
          url?: string;
          anonKey?: string;
        };
        const url = (data.url || '').trim();
        const anonKey = (data.anonKey || '').trim();
        if (data.configured && isValidPublicConfig(url, anonKey)) {
          cachedClient = createClient(url, anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
            },
          });
          return cachedClient;
        }
        return null;
      } catch {
        return null;
      }
    })();
  }

  const client = await runtimeLookupPromise;
  if (!client) {
    // Allow re-checking later if server was still starting
    runtimeLookupPromise = null;
  }
  return client;
}
