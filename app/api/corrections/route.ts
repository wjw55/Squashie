import { correctionSubmissionResponseSchema } from '@/lib/api/correction-contract';
import { correctionSubmissionSchema } from '@/lib/domain/correction';
import { CorrectionRateLimitError } from '@/lib/server/correction-repository';
import { withCorrectionService } from '@/lib/server/correction-service';
import { errorContext } from '@/lib/server/error-context';
import {
  InvalidRequestBodyError,
  InvalidRequestOriginError,
  RequestBodyTooLargeError,
  RequestSecurityConfigurationError,
  assertSameOrigin,
  correctionFingerprint,
  readJsonBody,
} from '@/lib/server/request-security';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const raw = await readJsonBody(request);
    const parsed = correctionSubmissionSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: 'INVALID_CORRECTION',
            message: 'Review the correction fields and try again.',
            issues: parsed.error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        },
        { status: 400 },
      );
    }

    const fingerprint = await correctionFingerprint(request);
    const created = await withCorrectionService((service) =>
      service.submit(parsed.data, fingerprint),
    );
    if (!created) {
      return Response.json(
        {
          error: {
            code: 'COMMUNITY_NOT_FOUND',
            message: 'The selected community could not be found.',
          },
        },
        { status: 404 },
      );
    }

    const response = correctionSubmissionResponseSchema.parse({
      data: created,
    });
    return Response.json(response, { status: 201 });
  } catch (error) {
    if (
      error instanceof InvalidRequestBodyError ||
      error instanceof InvalidRequestOriginError
    ) {
      return Response.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'The correction request could not be accepted.',
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
            message: 'The correction request is too large.',
          },
        },
        { status: 413 },
      );
    }
    if (error instanceof CorrectionRateLimitError) {
      return Response.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many corrections were submitted. Try again later.',
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': '3600' },
        },
      );
    }
    console.error('Public correction submission failed', {
      error: errorContext(error),
    });
    return Response.json(
      {
        error: {
          code:
            error instanceof RequestSecurityConfigurationError
              ? 'CORRECTIONS_NOT_CONFIGURED'
              : 'CORRECTIONS_UNAVAILABLE',
          message: 'Corrections are temporarily unavailable.',
        },
      },
      { status: 503 },
    );
  }
}
