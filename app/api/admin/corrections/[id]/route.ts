import { z } from 'zod';

import { moderationResponseSchema } from '@/lib/api/correction-contract';
import { moderationDecisionSchema } from '@/lib/domain/correction';
import {
  AdminAuthConfigurationError,
  AdminForbiddenError,
  getAdminIdentity,
} from '@/lib/server/admin-auth';
import {
  CorrectionAlreadyResolvedError,
  CorrectionNotFoundError,
} from '@/lib/server/correction-repository';
import { withCorrectionService } from '@/lib/server/correction-service';
import { errorContext } from '@/lib/server/error-context';
import {
  InvalidRequestBodyError,
  InvalidRequestOriginError,
  RequestBodyTooLargeError,
  assertSameOrigin,
  readJsonBody,
} from '@/lib/server/request-security';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const identity = await getAdminIdentity(request.headers);
    if (!identity) {
      return Response.json(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Administrator sign-in is required.',
          },
        },
        { status: 401 },
      );
    }
    assertSameOrigin(request);
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) {
      return Response.json(
        {
          error: {
            code: 'INVALID_CORRECTION_ID',
            message: 'The correction identifier is invalid.',
          },
        },
        { status: 400 },
      );
    }
    const raw = await readJsonBody(request, 8_192);
    const decision = moderationDecisionSchema.safeParse(raw);
    if (!decision.success) {
      return Response.json(
        {
          error: {
            code: 'INVALID_DECISION',
            message: 'Review the moderation decision and try again.',
          },
        },
        { status: 400 },
      );
    }

    const resolved = await withCorrectionService((service) =>
      service.resolve(id, decision.data, identity),
    );
    return Response.json(
      moderationResponseSchema.parse({ data: resolved }),
    );
  } catch (error) {
    if (error instanceof AdminForbiddenError) {
      return Response.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'This account is not authorized to moderate Squashie.',
          },
        },
        { status: 403 },
      );
    }
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
    if (error instanceof CorrectionNotFoundError) {
      return Response.json(
        {
          error: {
            code: 'CORRECTION_NOT_FOUND',
            message: 'The correction request could not be found.',
          },
        },
        { status: 404 },
      );
    }
    if (error instanceof CorrectionAlreadyResolvedError) {
      return Response.json(
        {
          error: {
            code: 'ALREADY_RESOLVED',
            message: 'This correction request has already been resolved.',
          },
        },
        { status: 409 },
      );
    }
    if (
      error instanceof InvalidRequestBodyError ||
      error instanceof InvalidRequestOriginError
    ) {
      return Response.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'The moderation request could not be accepted.',
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json(
        {
          error: {
            code: 'REQUEST_TOO_LARGE',
            message: 'The moderation request is too large.',
          },
        },
        { status: 413 },
      );
    }
    console.error('Moderation action failed', {
      error: errorContext(error),
    });
    return Response.json(
      {
        error: {
          code: 'MODERATION_UNAVAILABLE',
          message: 'Moderation is temporarily unavailable.',
        },
      },
      { status: 503 },
    );
  }
}
