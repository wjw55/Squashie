import { toCommunityResponse } from '@/lib/api/community-contract';
import { communitySlugSchema } from '@/lib/server/community-query';
import { withCommunityService } from '@/lib/server/community-service';
import { errorContext } from '@/lib/server/error-context';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const parsed = communitySlugSchema.safeParse((await params).slug);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: 'INVALID_SLUG',
          message: 'The community identifier is invalid.',
        },
      },
      { status: 400 },
    );
  }

  try {
    const community = await withCommunityService((service) =>
      service.getBySlug(parsed.data),
    );
    if (!community) {
      return Response.json(
        {
          error: {
            code: 'COMMUNITY_NOT_FOUND',
            message: 'No community exists with that identifier.',
          },
        },
        { status: 404 },
      );
    }

    return Response.json(
      { data: toCommunityResponse(community) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Public community detail API failed', {
      slug: parsed.data,
      error: errorContext(error),
    });
    return Response.json(
      {
        error: {
          code: 'COMMUNITY_UNAVAILABLE',
          message: 'This community listing is temporarily unavailable.',
        },
      },
      { status: 503 },
    );
  }
}
