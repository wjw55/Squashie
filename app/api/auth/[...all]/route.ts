import {
  AdminAuthConfigurationError,
  handleAuthRequest,
} from '@/lib/server/admin-auth';
import { errorContext } from '@/lib/server/error-context';

async function authHandler(request: Request) {
  try {
    return await handleAuthRequest(request);
  } catch (error) {
    if (error instanceof AdminAuthConfigurationError) {
      return Response.json(
        {
          error: {
            code: 'AUTH_NOT_CONFIGURED',
            message: 'Administrator sign-in is not configured.',
          },
        },
        { status: 503 },
      );
    }
    console.error('Administrator authentication failed', {
      error: errorContext(error),
    });
    return Response.json(
      {
        error: {
          code: 'AUTH_UNAVAILABLE',
          message: 'Administrator sign-in is temporarily unavailable.',
        },
      },
      { status: 503 },
    );
  }
}

export const GET = authHandler;
export const POST = authHandler;
