import assert from 'node:assert/strict';
import test from 'node:test';

import {
  correctionFieldLabel,
  correctionSubmissionSchema,
  moderationDecisionSchema,
} from '../lib/domain/correction.ts';

void test('accepts a supported correction with either source evidence form', () => {
  const withUrl = correctionSubmissionSchema.safeParse({
    communitySlug: 'safra-squash-club',
    field: 'courtFee',
    proposedValue: '$5 per hour',
    sourceUrl: 'https://example.com/fees',
    explanation: '',
    contactInfo: '',
    website: '',
  });
  assert.equal(withUrl.success, true);

  const withExplanation = correctionSubmissionSchema.safeParse({
    communitySlug: 'safra-squash-club',
    field: 'courtFee',
    proposedValue: '$5 per hour',
    sourceUrl: '',
    explanation: 'Confirmed by the organizer at the latest club briefing.',
    website: '',
  });
  assert.equal(withExplanation.success, true);
});

void test('rejects unsupported fields, missing evidence, bad URLs, and honeypots', () => {
  const base = {
    communitySlug: 'safra-squash-club',
    field: 'courtFee',
    proposedValue: '$5 per hour',
    explanation: 'Published in the current member guide.',
    website: '',
  };
  assert.equal(
    correctionSubmissionSchema.safeParse({ ...base, field: 'slug' }).success,
    false,
  );
  assert.equal(
    correctionSubmissionSchema.safeParse({
      ...base,
      explanation: '',
      sourceUrl: '',
    }).success,
    false,
  );
  assert.equal(
    correctionSubmissionSchema.safeParse({
      ...base,
      sourceUrl: 'not a URL',
    }).success,
    false,
  );
  assert.equal(
    correctionSubmissionSchema.safeParse({
      ...base,
      website: 'spam.example',
    }).success,
    false,
  );
});

void test('moderation accepts only explicit approve or reject decisions', () => {
  assert.equal(
    moderationDecisionSchema.safeParse({
      action: 'approved',
      moderationNote: 'Source confirmed.',
    }).success,
    true,
  );
  assert.equal(
    moderationDecisionSchema.safeParse({ action: 'publish' }).success,
    false,
  );
  assert.equal(correctionFieldLabel('indicativeCost'), 'Indicative cost');
});
