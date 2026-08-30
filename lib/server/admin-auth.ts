import 'server-only';

import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth/minimal';

import { authSchema } from '@/db/auth-schema';
import { getDatabase } from '@/lib/server/database';

export interface AdminIdentity {
  userId: string;
  email: string;
  name: string;
}

export class AdminAuthConfigurationError extends Error {}
export class AdminForbiddenError extends Error {}

function configuration() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const baseURL = process.env.BETTER_AUTH_URL?.trim();
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  const adminEmails = new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!secret || secret.length < 32) {
    throw new AdminAuthConfigurationError(
      'BETTER_AUTH_SECRET must contain at least 32 characters',
    );
  }
  if (!baseURL) {
    throw new AdminAuthConfigurationError('BETTER_AUTH_URL is required');
  }
  try {
    new URL(baseURL);
  } catch {
    throw new AdminAuthConfigurationError(
      'BETTER_AUTH_URL must be an absolute URL',
    );
  }
  if (!clientId || !clientSecret) {
    throw new AdminAuthConfigurationError(
      'GitHub OAuth credentials are required',
    );
  }
  if (adminEmails.size === 0) {
    throw new AdminAuthConfigurationError(
      'ADMIN_EMAILS must contain at least one administrator email',
    );
  }

  return {
    secret,
    baseURL,
    clientId,
    clientSecret,
    adminEmails,
  };
}

export function isAdminAuthConfigured() {
  try {
    configuration();
    return true;
  } catch {
    return false;
  }
}

function createAuth() {
  const config = configuration();
  return betterAuth({
    appName: 'Squashie moderation',
    baseURL: config.baseURL,
    secret: config.secret,
    database: drizzleAdapter(getDatabase(), {
      provider: 'pg',
      schema: authSchema,
    }),
    socialProviders: {
      github: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
    },
    emailAndPassword: { enabled: false },
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

function getAuth() {
  if (authInstance) return authInstance;
  authInstance = createAuth();
  return authInstance;
}

export async function handleAuthRequest(request: Request) {
  return getAuth().handler(request);
}

export async function getAdminIdentity(headers: Headers) {
  if (
    process.env.SQUASHIE_TEST_DATABASE === '1' &&
    process.env.SQUASHIE_TEST_ADMIN === '1'
  ) {
    const email = headers.get('x-squashie-test-admin');
    if (email) {
      return {
        userId: headers.get('x-squashie-test-admin-id') ?? 'test-admin',
        email: email.toLowerCase(),
        name: 'Test administrator',
      } satisfies AdminIdentity;
    }
  }

  const config = configuration();
  const session = await getAuth().api.getSession({ headers });
  if (!session) return null;
  const email = session.user.email.toLowerCase();
  if (!config.adminEmails.has(email)) {
    throw new AdminForbiddenError(
      'Authenticated user is not a Squashie administrator',
    );
  }
  return {
    userId: session.user.id,
    email,
    name: session.user.name,
  } satisfies AdminIdentity;
}
