import 'server-only';

import type { Community } from '@/lib/domain/community';
import type { CommunityQuery } from '@/lib/server/community-query';
import { withCommunityService } from '@/lib/server/community-service';
import { errorContext } from '@/lib/server/error-context';

export async function loadCommunities(
  query: CommunityQuery = {},
): Promise<Community[]> {
  try {
    return await withCommunityService((service) => service.list(query));
  } catch (error) {
    console.error('Community list read failed', errorContext(error));
    throw new Error('Community listings are temporarily unavailable.', {
      cause: error,
    });
  }
}

export const loadCommunity = cache(async (slug: string) => {
  try {
    return await withCommunityService((service) => service.getBySlug(slug));
  } catch (error) {
    console.error('Community detail read failed', {
      slug,
      error: errorContext(error),
    });
    throw new Error('This community listing is temporarily unavailable.', {
      cause: error,
    });
  }
});
import { cache } from 'react';
