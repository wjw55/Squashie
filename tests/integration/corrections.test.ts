import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { count, eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { POST as moderateCorrectionApi } from '../../app/api/admin/corrections/[id]/route';
import { POST as submitCorrectionApi } from '../../app/api/corrections/route';
import { GET as getCommunityApi } from '../../app/api/communities/[slug]/route';
import {
  communitiesTable,
  correctionRequestsTable,
  moderationAuditTable,
} from '../../db/schema';
import { seedDatabase } from '../../db/seed';
import {
  closeDatabase,
  getDatabase,
} from '../../lib/server/database-core';

const port = 55433;
const origin = 'http://localhost';
let embeddedPostgres: PGlite;
let socketServer: PGLiteSocketServer;

before(async () => {
  embeddedPostgres = await PGlite.create();
  socketServer = new PGLiteSocketServer({
    db: embeddedPostgres,
    host: '127.0.0.1',
    port,
    maxConnections: 10,
  });
  await socketServer.start();
  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;
  process.env.CORRECTION_RATE_LIMIT_SALT =
    'integration-test-rate-limit-salt';
  process.env.BETTER_AUTH_SECRET =
    'integration-test-auth-secret-at-least-32-characters';
  process.env.BETTER_AUTH_URL = origin;
  process.env.GITHUB_CLIENT_ID = 'integration-client-id';
  process.env.GITHUB_CLIENT_SECRET = 'integration-client-secret';
  process.env.ADMIN_EMAILS = 'admin@example.com';

  await migrate(getDatabase(), { migrationsFolder: 'db/migrations' });
  await seedDatabase(getDatabase());
});

after(async () => {
  await closeDatabase();
  await socketServer.stop();
  await embeddedPostgres.close();
  for (const name of [
    'DATABASE_URL',
    'CORRECTION_RATE_LIMIT_SALT',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'ADMIN_EMAILS',
    'SQUASHIE_TEST_DATABASE',
    'SQUASHIE_TEST_ADMIN',
  ]) {
    delete process.env[name];
  }
});

function submissionRequest(
  body: Record<string, unknown>,
  address = '198.51.100.10',
) {
  return new Request(`${origin}/api/corrections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'x-vercel-forwarded-for': address,
    },
    body: JSON.stringify(body),
  });
}

async function submit(
  overrides: Record<string, unknown> = {},
  address?: string,
) {
  const response = await submitCorrectionApi(
    submissionRequest(
      {
        communitySlug: 'safra-squash-club',
        field: 'indicativeCost',
        proposedValue: 'Updated correction value',
        sourceUrl: 'https://example.com/official-source',
        explanation: 'Current organizer information.',
        contactInfo: 'editor@example.com',
        website: '',
        ...overrides,
      },
      address,
    ),
  );
  return response;
}

function moderationRequest(id: string, body: Record<string, unknown>) {
  return new Request(`${origin}/api/admin/corrections/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      'x-squashie-test-admin': 'admin@example.com',
      'x-squashie-test-admin-id': 'integration-admin',
    },
    body: JSON.stringify(body),
  });
}

void test('public API validates and stores a pending correction safely', async () => {
  const invalid = await submit({ sourceUrl: '', explanation: '' });
  assert.equal(invalid.status, 400);

  const response = await submit({}, '198.51.100.20');
  assert.equal(response.status, 201);
  const body = (await response.json()) as {
    data: { id: string; status: string };
  };
  assert.equal(body.data.status, 'pending');

  const [stored] = await getDatabase()
    .select()
    .from(correctionRequestsTable)
    .where(eq(correctionRequestsTable.id, body.data.id));
  assert.equal(stored.status, 'pending');
  assert.equal(stored.contactInfo, 'editor@example.com');
});

void test('public submissions are limited to five per address per hour', async () => {
  const address = '203.0.113.77';
  for (let index = 0; index < 5; index += 1) {
    const response = await submit(
      { proposedValue: `Rate-limited value ${index}` },
      address,
    );
    assert.equal(response.status, 201);
  }
  const limited = await submit(
    { proposedValue: 'Sixth value' },
    address,
  );
  assert.equal(limited.status, 429);
});

void test('approval is transactional, audited, public, and cannot repeat', async () => {
  const created = await submit(
    { proposedValue: 'Court and club costs confirmed with organizer' },
    '198.51.100.30',
  );
  const createdBody = (await created.json()) as { data: { id: string } };

  process.env.SQUASHIE_TEST_DATABASE = '1';
  process.env.SQUASHIE_TEST_ADMIN = '1';
  const approved = await moderateCorrectionApi(
    moderationRequest(createdBody.data.id, {
      action: 'approved',
      moderationNote: 'Official source reviewed.',
    }),
    { params: Promise.resolve({ id: createdBody.data.id }) },
  );
  assert.equal(approved.status, 200);

  const [community] = await getDatabase()
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.slug, 'safra-squash-club'));
  assert.equal(
    community.indicativeCost,
    'Court and club costs confirmed with organizer',
  );
  assert.equal(community.verificationStatus, 'Needs re-checking');

  const [auditCount] = await getDatabase()
    .select({ value: count() })
    .from(moderationAuditTable)
    .where(eq(moderationAuditTable.correctionRequestId, createdBody.data.id));
  assert.equal(auditCount.value, 1);

  const duplicate = await moderateCorrectionApi(
    moderationRequest(createdBody.data.id, { action: 'rejected' }),
    { params: Promise.resolve({ id: createdBody.data.id }) },
  );
  assert.equal(duplicate.status, 409);

  const publicResponse = await getCommunityApi(
    new Request(`${origin}/api/communities/safra-squash-club`),
    { params: Promise.resolve({ slug: 'safra-squash-club' }) },
  );
  const publicBody = JSON.stringify(await publicResponse.json());
  assert.match(publicBody, /Court and club costs confirmed/);
  assert.doesNotMatch(publicBody, /Official source reviewed/);
  assert.doesNotMatch(publicBody, /admin@example\.com/);
});

void test('rejection is audited without changing public information', async () => {
  delete process.env.SQUASHIE_TEST_DATABASE;
  delete process.env.SQUASHIE_TEST_ADMIN;
  const [before] = await getDatabase()
    .select({ guestFee: communitiesTable.guestFee })
    .from(communitiesTable)
    .where(eq(communitiesTable.slug, 'safra-squash-club'));
  const created = await submit(
    {
      field: 'guestFee',
      proposedValue: 'Incorrect proposed guest fee',
    },
    '198.51.100.40',
  );
  const createdBody = (await created.json()) as { data: { id: string } };

  process.env.SQUASHIE_TEST_DATABASE = '1';
  process.env.SQUASHIE_TEST_ADMIN = '1';
  const rejected = await moderateCorrectionApi(
    moderationRequest(createdBody.data.id, {
      action: 'rejected',
      moderationNote: 'Source did not support the claim.',
    }),
    { params: Promise.resolve({ id: createdBody.data.id }) },
  );
  assert.equal(rejected.status, 200);

  const [afterRecord] = await getDatabase()
    .select({ guestFee: communitiesTable.guestFee })
    .from(communitiesTable)
    .where(eq(communitiesTable.slug, 'safra-squash-club'));
  assert.equal(afterRecord.guestFee, before.guestFee);
});

void test('moderation API rejects anonymous requests before processing', async () => {
  const response = await moderateCorrectionApi(
    new Request(
      `${origin}/api/admin/corrections/00000000-0000-4000-8000-000000000000`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: origin,
        },
        body: JSON.stringify({ action: 'approved' }),
      },
    ),
    {
      params: Promise.resolve({
        id: '00000000-0000-4000-8000-000000000000',
      }),
    },
  );
  assert.equal(response.status, 401);
});
