import {
  and,
  asc,
  eq,
  lt,
  max,
  sql,
} from 'drizzle-orm';

import {
  communitiesTable,
  communitySourcesTable,
  correctionRateLimitsTable,
  correctionRequestsTable,
  moderationAuditTable,
  sourceReferencesTable,
  verificationEventsTable,
  type CommunityRecord,
} from '@/db/schema';
import type {
  CorrectionField,
  CorrectionRequest,
  CorrectionSubmission,
  ModerationDecision,
} from '@/lib/domain/correction';
import type { Database } from '@/lib/server/database';

export interface ModerationActor {
  userId: string;
  email: string;
}

export interface SubmittedCorrection {
  id: string;
  status: 'pending';
  createdAt: string;
}

export interface ResolvedCorrection {
  id: string;
  communitySlug: string;
  status: 'approved' | 'rejected';
}

export class CorrectionNotFoundError extends Error {}
export class CorrectionAlreadyResolvedError extends Error {}
export class CorrectionRateLimitError extends Error {}

export interface CorrectionRepository {
  submit(
    input: CorrectionSubmission,
    currentValue: string,
    fingerprint: string,
  ): Promise<SubmittedCorrection>;
  listPending(): Promise<CorrectionRequest[]>;
  resolve(
    id: string,
    decision: ModerationDecision,
    actor: ModerationActor,
  ): Promise<ResolvedCorrection>;
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1_000;
const RATE_LIMIT_MAX = 5;

export class PostgresCorrectionRepository
  implements CorrectionRepository
{
  constructor(private readonly database: Database) {}

  async submit(
    input: CorrectionSubmission,
    currentValue: string,
    fingerprint: string,
  ) {
    return this.database.transaction(async (transaction) => {
      const now = new Date();
      await transaction
        .delete(correctionRateLimitsTable)
        .where(lt(correctionRateLimitsTable.expiresAt, now));

      const windowStart = Math.floor(now.getTime() / RATE_LIMIT_WINDOW_MS);
      const key = `${fingerprint}:${windowStart}`;
      const [counter] = await transaction
        .insert(correctionRateLimitsTable)
        .values({
          key,
          count: 1,
          expiresAt: new Date((windowStart + 1) * RATE_LIMIT_WINDOW_MS),
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: correctionRateLimitsTable.key,
          set: {
            count: sql`${correctionRateLimitsTable.count} + 1`,
            updatedAt: now,
          },
        })
        .returning({ count: correctionRateLimitsTable.count });

      if (!counter || counter.count > RATE_LIMIT_MAX) {
        throw new CorrectionRateLimitError(
          'Too many correction submissions',
        );
      }

      const id = crypto.randomUUID();
      const [created] = await transaction
        .insert(correctionRequestsTable)
        .values({
          id,
          communitySlug: input.communitySlug,
          field: input.field,
          submittedCurrentValue: currentValue,
          proposedValue: input.proposedValue,
          sourceUrl: input.sourceUrl,
          explanation: input.explanation,
          contactInfo: input.contactInfo,
          submitterFingerprint: fingerprint,
        })
        .returning({
          createdAt: correctionRequestsTable.createdAt,
        });

      return {
        id,
        status: 'pending' as const,
        createdAt: created.createdAt.toISOString(),
      };
    });
  }

  async listPending() {
    const rows = await this.database
      .select({
        request: correctionRequestsTable,
        community: communitiesTable,
      })
      .from(correctionRequestsTable)
      .innerJoin(
        communitiesTable,
        eq(correctionRequestsTable.communitySlug, communitiesTable.slug),
      )
      .where(eq(correctionRequestsTable.status, 'pending'))
      .orderBy(asc(correctionRequestsTable.createdAt));

    return rows.map(({ request, community }) => ({
      id: request.id,
      communitySlug: request.communitySlug,
      communityName: community.name,
      field: request.field,
      currentValue: communityFieldValue(community, request.field),
      submittedCurrentValue: request.submittedCurrentValue,
      proposedValue: request.proposedValue,
      sourceUrl: request.sourceUrl ?? undefined,
      explanation: request.explanation ?? undefined,
      contactInfo: request.contactInfo ?? undefined,
      status: request.status,
      moderationNote: request.moderationNote ?? undefined,
      resolvedByEmail: request.resolvedByEmail ?? undefined,
      createdAt: request.createdAt.toISOString(),
      resolvedAt: request.resolvedAt?.toISOString(),
    }));
  }

  async resolve(
    id: string,
    decision: ModerationDecision,
    actor: ModerationActor,
  ) {
    return this.database.transaction(async (transaction) => {
      const [row] = await transaction
        .select({
          request: correctionRequestsTable,
          community: communitiesTable,
        })
        .from(correctionRequestsTable)
        .innerJoin(
          communitiesTable,
          eq(correctionRequestsTable.communitySlug, communitiesTable.slug),
        )
        .where(eq(correctionRequestsTable.id, id))
        .limit(1);

      if (!row) throw new CorrectionNotFoundError('Correction not found');
      if (row.request.status !== 'pending') {
        throw new CorrectionAlreadyResolvedError(
          'Correction has already been resolved',
        );
      }

      const now = new Date();
      const [claimed] = await transaction
        .update(correctionRequestsTable)
        .set({
          status: decision.action,
          moderationNote: decision.moderationNote,
          resolvedByUserId: actor.userId,
          resolvedByEmail: actor.email,
          resolvedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(correctionRequestsTable.id, id),
            eq(correctionRequestsTable.status, 'pending'),
          ),
        )
        .returning({ id: correctionRequestsTable.id });

      if (!claimed) {
        throw new CorrectionAlreadyResolvedError(
          'Correction has already been resolved',
        );
      }

      const oldValue = communityFieldValue(
        row.community,
        row.request.field,
      );

      if (decision.action === 'approved') {
        const checkedAt = now.toISOString().slice(0, 10);
        await transaction
          .update(communitiesTable)
          .set({
            ...communityFieldUpdate(
              row.request.field,
              row.request.proposedValue,
            ),
            lastChecked: checkedAt,
            verificationStatus: 'Needs re-checking',
            updatedAt: now,
          })
          .where(eq(communitiesTable.slug, row.request.communitySlug));

        if (row.request.sourceUrl) {
          const [source] = await transaction
            .insert(sourceReferencesTable)
            .values({ url: row.request.sourceUrl })
            .onConflictDoUpdate({
              target: sourceReferencesTable.url,
              set: { url: row.request.sourceUrl },
            })
            .returning({ id: sourceReferencesTable.id });
          const [lastPosition] = await transaction
            .select({ value: max(communitySourcesTable.position) })
            .from(communitySourcesTable)
            .where(
              eq(
                communitySourcesTable.communitySlug,
                row.request.communitySlug,
              ),
            );
          await transaction
            .insert(communitySourcesTable)
            .values({
              communitySlug: row.request.communitySlug,
              sourceId: source.id,
              label: 'Approved correction source',
              position: Number(lastPosition?.value ?? 0) + 1,
            })
            .onConflictDoUpdate({
              target: [
                communitySourcesTable.communitySlug,
                communitySourcesTable.sourceId,
              ],
              set: { label: 'Approved correction source' },
            });
        }

        await transaction
          .insert(verificationEventsTable)
          .values({
            communitySlug: row.request.communitySlug,
            status: 'Needs re-checking',
            checkedAt,
            note: `Correction ${id} approved; public source should be reconfirmed during the next editorial review.`,
          })
          .onConflictDoNothing();
      }

      await transaction.insert(moderationAuditTable).values({
        id: crypto.randomUUID(),
        correctionRequestId: id,
        communitySlug: row.request.communitySlug,
        action: decision.action,
        field: row.request.field,
        oldValue,
        newValue:
          decision.action === 'approved'
            ? row.request.proposedValue
            : undefined,
        actorUserId: actor.userId,
        actorEmail: actor.email,
        moderationNote: decision.moderationNote,
      });

      return {
        id,
        communitySlug: row.request.communitySlug,
        status: decision.action,
      };
    });
  }
}

export function communityFieldValue(
  community: CommunityRecord,
  field: CorrectionField,
) {
  const value = community[field];
  return typeof value === 'string' && value.length > 0
    ? value
    : 'Not currently listed';
}

function communityFieldUpdate(field: CorrectionField, value: string) {
  return { [field]: value } as Partial<
    typeof communitiesTable.$inferInsert
  >;
}
