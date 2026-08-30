import {
  and,
  arrayContains,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from 'drizzle-orm';

import {
  communitiesTable,
  communitySourcesTable,
  sourceReferencesTable,
  type CommunityRecord,
} from '@/db/schema';
import {
  communitySchema,
  type Community,
  type CommunitySource,
} from '@/lib/domain/community';
import type { CommunityQuery } from '@/lib/server/community-query';
import type { Database } from '@/lib/server/database';

export interface CommunityRepository {
  list(query?: CommunityQuery): Promise<Community[]>;
  findBySlug(slug: string): Promise<Community | null>;
}

export class CommunityRepositoryError extends Error {
  constructor(
    message: string,
    options: { cause: unknown },
  ) {
    super(message, options);
    this.name = 'CommunityRepositoryError';
  }
}

export class PostgresCommunityRepository implements CommunityRepository {
  constructor(private readonly database: Database) {}

  async list(query: CommunityQuery = {}): Promise<Community[]> {
    try {
      const conditions = queryConditions(query);
      const records = await this.database
        .select()
        .from(communitiesTable)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(communitiesTable.displayOrder);

      return this.attachSources(records);
    } catch (error) {
      throw new CommunityRepositoryError('Unable to list communities', {
        cause: error,
      });
    }
  }

  async findBySlug(slug: string): Promise<Community | null> {
    try {
      const [record] = await this.database
        .select()
        .from(communitiesTable)
        .where(eq(communitiesTable.slug, slug))
        .limit(1);

      if (!record) return null;
      const [community] = await this.attachSources([record]);
      return community;
    } catch (error) {
      throw new CommunityRepositoryError('Unable to retrieve community', {
        cause: error,
      });
    }
  }

  private async attachSources(records: CommunityRecord[]) {
    if (records.length === 0) return [];

    const sourceRows = await this.database
      .select({
        communitySlug: communitySourcesTable.communitySlug,
        label: communitySourcesTable.label,
        url: sourceReferencesTable.url,
      })
      .from(communitySourcesTable)
      .innerJoin(
        sourceReferencesTable,
        eq(communitySourcesTable.sourceId, sourceReferencesTable.id),
      )
      .where(
        inArray(
          communitySourcesTable.communitySlug,
          records.map((record) => record.slug),
        ),
      )
      .orderBy(
        communitySourcesTable.communitySlug,
        communitySourcesTable.position,
      );

    const sourcesByCommunity = new Map<string, CommunitySource[]>();
    for (const source of sourceRows) {
      const sources = sourcesByCommunity.get(source.communitySlug) ?? [];
      sources.push({ label: source.label, url: source.url });
      sourcesByCommunity.set(source.communitySlug, sources);
    }

    return records.map((record) =>
      communitySchema.parse({
        slug: record.slug,
        name: record.name,
        shortName: record.shortName,
        category: record.category,
        region: record.region,
        neighbourhood: record.neighbourhood,
        address: record.address,
        suitableFor: record.suitableFor,
        description: record.description,
        accessType: record.accessType,
        eligibility: record.eligibility,
        accessSummary: record.accessSummary,
        levels: record.levels,
        courtCount: record.courtCount,
        socialPlay: record.socialPlay,
        trainingAvailable: record.trainingAvailable,
        trainingIntensity: record.trainingIntensity,
        trainingSummary: record.trainingSummary,
        joiningFee: record.joiningFee,
        recurringFee: record.recurringFee,
        courtFee: record.courtFee,
        guestFee: record.guestFee,
        indicativeCost: record.indicativeCost,
        joiningSteps: record.joiningSteps,
        contacts: record.contacts,
        sources: sourcesByCommunity.get(record.slug) ?? [],
        lastChecked: record.lastChecked,
        verificationStatus: record.verificationStatus,
        note: record.note ?? undefined,
      }),
    );
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

function queryConditions(query: CommunityQuery) {
  const conditions: SQL[] = [];
  if (query.q) {
    const search = `%${escapeLike(query.q)}%`;
    const searchCondition = or(
      ilike(communitiesTable.name, search),
      ilike(communitiesTable.shortName, search),
      ilike(communitiesTable.neighbourhood, search),
      ilike(communitiesTable.address, search),
      ilike(communitiesTable.region, search),
      ilike(communitiesTable.category, search),
      ilike(communitiesTable.description, search),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  if (query.region) conditions.push(eq(communitiesTable.region, query.region));
  if (query.category)
    conditions.push(eq(communitiesTable.category, query.category));
  if (query.access)
    conditions.push(eq(communitiesTable.accessType, query.access));
  if (query.level)
    conditions.push(arrayContains(communitiesTable.levels, [query.level]));
  if (query.training !== undefined)
    conditions.push(
      eq(communitiesTable.trainingAvailable, query.training),
    );
  return conditions;
}
