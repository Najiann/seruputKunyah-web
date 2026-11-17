/// <reference types="node" />
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL_ENV_CANDIDATES = [
  'VITE_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
] as const;

const ANON_KEY_ENV_CANDIDATES = [
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
] as const;

function looksLikeServiceRoleKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8')
      ) as { role?: string };
      if (payload?.role === 'service_role') return true;
    } catch {
      // not a standard JWT
    }
  }
  return false;
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    !value ||
    lower.includes('your-project-ref') ||
    lower.includes('your-supabase-anon-key') ||
    lower.startsWith('my_')
  );
}

function resolveSupabasePublicEnv() {
  let detectedUrlEnv: string | null = null;
  let url = '';
  for (const name of URL_ENV_CANDIDATES) {
    const val = (process.env[name] || '').trim();
    if (val && !isPlaceholder(val)) {
      detectedUrlEnv = name;
      url = val.replace(/\/+$/, '');
      break;
    }
  }

  let detectedAnonKeyEnv: string | null = null;
  let anonKey = '';
  for (const name of ANON_KEY_ENV_CANDIDATES) {
    const val = (process.env[name] || '').trim();
    if (val && !isPlaceholder(val)) {
      detectedAnonKeyEnv = name;
      anonKey = val;
      break;
    }
  }

  const serviceRoleBlocked = looksLikeServiceRoleKey(anonKey);
  if (serviceRoleBlocked) {
    anonKey = '';
  }

  const configured = Boolean(url && anonKey && !serviceRoleBlocked);

  return {
    configured,
    url: configured ? url : '',
    anonKey: configured ? anonKey : '',
    detectedUrlEnv,
    detectedAnonKeyEnv,
    serviceRoleBlocked,
  };
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.get('/api/maps-config', (_req, res) => {
    const apiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.setHeader('Cache-Control', 'no-store');
    res.json({ apiKey });
  });

  // Public Supabase client config (URL + Anon/Publishable Key ONLY — never service_role)
  app.get('/api/supabase-config', (_req, res) => {
    const cfg = resolveSupabasePublicEnv();
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      configured: cfg.configured,
      url: cfg.url,
      anonKey: cfg.anonKey,
      serviceRoleBlocked: cfg.serviceRoleBlocked,
    });
  });

  // Live Supabase connectivity & schema readiness check (never leaks secret values)
  app.get('/api/supabase-health', async (_req, res) => {
    const cfg = resolveSupabasePublicEnv();
    res.setHeader('Cache-Control', 'no-store');

    if (cfg.serviceRoleBlocked) {
      res.json({
        configured: false,
        serviceRoleBlocked: true,
        detectedUrlEnv: cfg.detectedUrlEnv,
        detectedAnonKeyEnv: cfg.detectedAnonKeyEnv,
        message:
          'Key yang dimasukkan terdeteksi sebagai service_role/secret key. Ganti dengan anon/publishable key agar aman untuk frontend.',
      });
      return;
    }

    if (!cfg.configured) {
      res.json({
        configured: false,
        detectedUrlEnv: cfg.detectedUrlEnv,
        detectedAnonKeyEnv: cfg.detectedAnonKeyEnv,
        message: 'VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum terbaca di runtime server.',
      });
      return;
    }

    let urlHost = '';
    try {
      urlHost = new URL(cfg.url).host;
    } catch {
      res.json({
        configured: false,
        detectedUrlEnv: cfg.detectedUrlEnv,
        detectedAnonKeyEnv: cfg.detectedAnonKeyEnv,
        message: 'Format URL Supabase tidak valid (harus diawali https://).',
      });
      return;
    }

    try {
      const headers = {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
      };

      const [authRes, prodRes, catRes] = await Promise.all([
        fetch(`${cfg.url}/auth/v1/health`, { headers }),
        fetch(`${cfg.url}/rest/v1/products?select=id&limit=1`, { headers }),
        fetch(`${cfg.url}/rest/v1/categories?select=id&limit=1`, { headers }),
      ]);

      const tablesReady = prodRes.ok && catRes.ok;
      let productsError: string | null = null;
      if (!prodRes.ok) {
        try {
          const body = (await prodRes.json()) as { message?: string; code?: string };
          productsError = body.code ? `${body.code}: ${body.message || ''}` : body.message || `HTTP ${prodRes.status}`;
        } catch {
          productsError = `HTTP ${prodRes.status}`;
        }
      }

      res.json({
        configured: true,
        detectedUrlEnv: cfg.detectedUrlEnv,
        detectedAnonKeyEnv: cfg.detectedAnonKeyEnv,
        urlHost,
        reachable: authRes.ok || prodRes.status > 0,
        authHealthStatus: authRes.status,
        productsStatus: prodRes.status,
        categoriesStatus: catRes.status,
        tablesReady,
        productsError,
      });
    } catch (err) {
      res.json({
        configured: true,
        detectedUrlEnv: cfg.detectedUrlEnv,
        detectedAnonKeyEnv: cfg.detectedAnonKeyEnv,
        urlHost,
        reachable: false,
        tablesReady: false,
        message: err instanceof Error ? err.message : 'Gagal menghubungi server Supabase.',
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

void startServer();
