import { toCommunityResponse } from '@/lib/api/community-contract';
import { parseCommunitySearchParams } from '@/lib/server/community-query';
import { withCommunityService } from '@/lib/server/community-service';
import { errorContext } from '@/lib/server/error-context';

export async function GET(request: Request) {
  const parsed = parseCommunitySearchParams(new URL(request.url).searchParams);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: 'INVALID_QUERY',
          message: 'One or more discovery parameters are invalid.',
        },
      },
      { status: 400 },
    );
  }

  try {
    const communities = await withCommunityService((service) =>
      service.list(parsed.data),
    );
    return Response.json(
      { data: communities.map(toCommunityResponse) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Public community list API failed', {
      query: parsed.data,
      error: errorContext(error),
    });
    return Response.json(
      {
        error: {
          code: 'COMMUNITIES_UNAVAILABLE',
          message: 'Community listings are temporarily unavailable.',
        },
      },
      { status: 503 },
    );
  }
}
