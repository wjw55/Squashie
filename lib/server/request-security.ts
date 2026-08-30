import 'server-only';

export class InvalidRequestOriginError extends Error {}
export class RequestBodyTooLargeError extends Error {}
export class InvalidRequestBodyError extends Error {}
export class RequestSecurityConfigurationError extends Error {}

export async function readJsonBody(
  request: Request,
  maximumBytes = 16_384,
): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new InvalidRequestBodyError('Expected an application/json body');
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new RequestBodyTooLargeError('Request body is too large');
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maximumBytes) {
    throw new RequestBodyTooLargeError('Request body is too large');
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new InvalidRequestBodyError('Request body is not valid JSON');
  }
}

export function assertSameOrigin(request: Request) {
  const suppliedOrigin = request.headers.get('origin');
  if (!suppliedOrigin) {
    throw new InvalidRequestOriginError('Origin header is required');
  }

  const allowedOrigins = new Set([new URL(request.url).origin]);
  for (const configured of [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]) {
    if (!configured) continue;
    try {
      allowedOrigins.add(new URL(configured).origin);
    } catch {
      // Invalid deployment configuration is handled by its owning boundary.
    }
  }

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(suppliedOrigin).origin;
  } catch {
    throw new InvalidRequestOriginError();
  }

  if (!allowedOrigins.has(normalizedOrigin)) {
    throw new InvalidRequestOriginError('Request origin is not allowed');
  }
}

export async function correctionFingerprint(request: Request) {
  const salt = process.env.CORRECTION_RATE_LIMIT_SALT?.trim();
  const testing = process.env.SQUASHIE_TEST_DATABASE === '1';
  if (!salt && !testing) {
    throw new RequestSecurityConfigurationError(
      'CORRECTION_RATE_LIMIT_SALT is required',
    );
  }

  const forwarded =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'unavailable';
  const address = forwarded.split(',')[0]?.trim() || 'unavailable';
  const bytes = new TextEncoder().encode(
    `${salt ?? 'squashie-isolated-test-salt'}:${address}`,
  );
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
