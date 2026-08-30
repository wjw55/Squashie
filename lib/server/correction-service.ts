import 'server-only';

import type { Community } from '@/lib/domain/community';
import {
  correctionSubmissionSchema,
  moderationDecisionSchema,
  type CorrectionSubmission,
  type ModerationDecision,
} from '@/lib/domain/correction';
import {
  PostgresCorrectionRepository,
  type CorrectionRepository,
  type ModerationActor,
} from '@/lib/server/correction-repository';
import {
  createDatabaseConnection,
  isRequestScopedDatabase,
} from '@/lib/server/database-core';
import { getDatabase } from '@/lib/server/database';
import { PostgresCommunityRepository } from '@/lib/server/community-repository';

type PublicDataRefresher = (communitySlug: string) => void | Promise<void>;

export class CorrectionService {
  constructor(
    private readonly corrections: CorrectionRepository,
    private readonly communities: PostgresCommunityRepository,
    private readonly refreshPublicData: PublicDataRefresher = () => {},
  ) {}

  async submit(
    input: CorrectionSubmission,
    fingerprint: string,
  ) {
    const parsed = correctionSubmissionSchema.parse(input);
    const community = await this.communities.findBySlug(
      parsed.communitySlug,
    );
    if (!community) return null;
    const currentValue = publicCommunityFieldValue(
      community,
      parsed.field,
    );
    return this.corrections.submit(parsed, currentValue, fingerprint);
  }

  listPending() {
    return this.corrections.listPending();
  }

  async resolve(
    id: string,
    input: ModerationDecision,
    actor: ModerationActor,
  ) {
    const decision = moderationDecisionSchema.parse(input);
    const resolved = await this.corrections.resolve(id, decision, actor);
    if (resolved.status === 'approved') {
      await this.refreshPublicData(resolved.communitySlug);
    }
    return resolved;
  }
}

function publicCommunityFieldValue(
  community: Community,
  field: CorrectionSubmission['field'],
) {
  const value = community[field];
  return typeof value === 'string' && value.length > 0
    ? value
    : 'Not currently listed';
}

async function refreshCommunityData(communitySlug: string) {
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'page');
    revalidatePath(`/communities/${communitySlug}`, 'page');
  } catch (error) {
    if (process.env.SQUASHIE_TEST_DATABASE !== '1') throw error;
  }
}

function serviceFor(database: ReturnType<typeof getDatabase>) {
  return new CorrectionService(
    new PostgresCorrectionRepository(database),
    new PostgresCommunityRepository(database),
    refreshCommunityData,
  );
}

export function getCorrectionService() {
  return serviceFor(getDatabase());
}

export async function withCorrectionService<T>(
  operation: (service: CorrectionService) => Promise<T>,
) {
  if (!isRequestScopedDatabase()) {
    return operation(getCorrectionService());
  }

  const connection = createDatabaseConnection();
  try {
    return await operation(serviceFor(connection.database));
  } finally {
    await connection.close();
  }
}
