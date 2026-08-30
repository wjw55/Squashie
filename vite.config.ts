import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json' with { type: 'json' };

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localVars: Record<string, string> =
  process.env.SQUASHIE_TEST_DATABASE === '1'
    ? {
        DATABASE_URL:
          'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
        DATABASE_POOL_MAX: '1',
        SQUASHIE_TEST_DATABASE: '1',
        SQUASHIE_TEST_ADMIN: '1',
        CORRECTION_RATE_LIMIT_SALT:
          'isolated-browser-test-rate-limit-salt',
        BETTER_AUTH_SECRET:
          'isolated-browser-test-auth-secret-32-characters',
        BETTER_AUTH_URL: 'http://localhost:3000',
        GITHUB_CLIENT_ID: 'isolated-test-client-id',
        GITHUB_CLIENT_SECRET: 'isolated-test-client-secret',
        ADMIN_EMAILS: 'admin@example.com',
      }
    : {};

const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_date: '2026-08-30',
  compatibility_flags: [
    'nodejs_compat',
    'nodejs_compat_populate_process_env',
  ],
  vars: localVars,
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

const authOptimizeDeps = {
  exclude: [
    'better-auth',
    'better-auth/react',
    '@better-auth/core',
    '@better-auth/core/context',
    '@better-auth/drizzle-adapter',
  ],
};

export default defineConfig(async ({ mode }) => {
  const isVercelBuild =
    mode === 'vercel' ||
    process.env.VERCEL === '1' ||
    process.env.NITRO_PRESET === 'vercel';

  if (isVercelBuild) {
    process.env.NITRO_PRESET ??= 'vercel';
    const { nitro } = await import('nitro/vite');
    const { default: tailwindcssVite } = await import('@tailwindcss/vite');

    return {
      optimizeDeps: authOptimizeDeps,
      plugins: [vinext(), tailwindcssVite(), nitro()],
    };
  }

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    optimizeDeps: authOptimizeDeps,
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
