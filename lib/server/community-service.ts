import 'server-only';

import type { Community } from '@/lib/domain/community';
import {
  PostgresCommunityRepository,
  type CommunityRepository,
} from '@/lib/server/community-repository';
import {
  communityQuerySchema,
  communitySlugSchema,
  type CommunityQuery,
} from '@/lib/server/community-query';
import { getDatabase } from '@/lib/server/database';
import {
  createDatabaseConnection,
  isRequestScopedDatabase,
} from '@/lib/server/database-core';

export class CommunityService {
  constructor(private readonly repository: CommunityRepository) {}

  list(query: CommunityQuery = {}): Promise<Community[]> {
    return this.repository.list(communityQuerySchema.parse(query));
  }

  getBySlug(slug: string): Promise<Community | null> {
    return this.repository.findBySlug(communitySlugSchema.parse(slug));
  }
}

export function getCommunityService() {
  return new CommunityService(
    new PostgresCommunityRepository(getDatabase()),
  );
}

export async function withCommunityService<T>(
  operation: (service: CommunityService) => Promise<T>,
) {
  if (!isRequestScopedDatabase()) {
    return operation(getCommunityService());
  }

  const connection = createDatabaseConnection();
  try {
    return await operation(
      new CommunityService(
        new PostgresCommunityRepository(connection.database),
      ),
    );
  } finally {
    await connection.close();
  }
}
