import { eq } from 'drizzle-orm';

import {
  communitiesTable,
  communitySourcesTable,
  sourceReferencesTable,
  verificationEventsTable,
} from '@/db/schema';
import { communities } from '@/db/seed-data';
import { communitySchema } from '@/lib/domain/community';
import type { Database } from '@/lib/server/database-core';

export async function seedDatabase(database: Database) {
  for (const [displayOrder, rawCommunity] of communities.entries()) {
    const community = communitySchema.parse(rawCommunity);
    const values = {
      slug: community.slug,
      displayOrder,
      name: community.name,
      shortName: community.shortName,
      category: community.category,
      region: community.region,
      neighbourhood: community.neighbourhood,
      address: community.address,
      suitableFor: community.suitableFor,
      description: community.description,
      accessType: community.accessType,
      eligibility: community.eligibility,
      accessSummary: community.accessSummary,
      levels: community.levels,
      courtCount: community.courtCount,
      socialPlay: community.socialPlay,
      trainingAvailable: community.trainingAvailable,
      trainingIntensity: community.trainingIntensity,
      trainingSummary: community.trainingSummary,
      joiningFee: community.joiningFee,
      recurringFee: community.recurringFee,
      courtFee: community.courtFee,
      guestFee: community.guestFee,
      indicativeCost: community.indicativeCost,
      joiningSteps: community.joiningSteps,
      contacts: community.contacts,
      lastChecked: community.lastChecked,
      verificationStatus: community.verificationStatus,
      note: community.note ?? null,
      updatedAt: new Date(),
    };

    await database
      .insert(communitiesTable)
      .values(values)
      .onConflictDoUpdate({
        target: communitiesTable.slug,
        set: values,
      });

    await database
      .delete(communitySourcesTable)
      .where(eq(communitySourcesTable.communitySlug, community.slug));

    for (const [position, source] of community.sources.entries()) {
      let [sourceRecord] = await database
        .insert(sourceReferencesTable)
        .values({ url: source.url })
        .onConflictDoNothing({ target: sourceReferencesTable.url })
        .returning({ id: sourceReferencesTable.id });

      if (!sourceRecord) {
        [sourceRecord] = await database
          .select({ id: sourceReferencesTable.id })
          .from(sourceReferencesTable)
          .where(eq(sourceReferencesTable.url, source.url))
          .limit(1);
      }

      if (!sourceRecord) {
        throw new Error(`Unable to resolve source ${source.url}`);
      }

      await database.insert(communitySourcesTable).values({
        communitySlug: community.slug,
        sourceId: sourceRecord.id,
        label: source.label,
        position,
      });
    }

    await database
      .insert(verificationEventsTable)
      .values({
        communitySlug: community.slug,
        status: community.verificationStatus,
        checkedAt: community.lastChecked,
        note: 'Imported from the original Squashie editorial dataset.',
      })
      .onConflictDoNothing();
  }

  return { communities: communities.length };
}
