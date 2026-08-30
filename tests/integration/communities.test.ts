import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { count } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { GET as listCommunitiesApi } from '../../app/api/communities/route';
import { GET as getCommunityApi } from '../../app/api/communities/[slug]/route';
import {
  communitiesTable,
  sourceReferencesTable,
  verificationEventsTable,
} from '../../db/schema';
import { seedDatabase } from '../../db/seed';
import { communities as seedCommunities } from '../../db/seed-data';
import { PostgresCommunityRepository } from '../../lib/data/community-repository';
import {
  closeDatabase,
  getDatabase,
} from '../../lib/server/database-core';
import { parseCommunitySearchParams } from '../../lib/server/community-query';
import { CommunityService } from '../../lib/server/community-service';

const port = 55432;
let embeddedPostgres: PGlite;
let socketServer: PGLiteSocketServer;

before(async () => {
  embeddedPostgres = await PGlite.create();
  socketServer = new PGLiteSocketServer({
    db: embeddedPostgres,
    host: '127.0.0.1',
    port,
  });
  await socketServer.start();
  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;

  await migrate(getDatabase(), { migrationsFolder: 'db/migrations' });
  await seedDatabase(getDatabase());
});

after(async () => {
  await closeDatabase();
  await socketServer.stop();
  await embeddedPostgres.close();
  delete process.env.DATABASE_URL;
});

void test('migration and deterministic seed create every required record', async () => {
  await migrate(getDatabase(), { migrationsFolder: 'db/migrations' });
  await seedDatabase(getDatabase());

  const [communityCount] = await getDatabase()
    .select({ value: count() })
    .from(communitiesTable);
  const [sourceCount] = await getDatabase()
    .select({ value: count() })
    .from(sourceReferencesTable);
  const [verificationCount] = await getDatabase()
    .select({ value: count() })
    .from(verificationEventsTable);

  assert.equal(communityCount.value, seedCommunities.length);
  assert.ok(sourceCount.value >= seedCommunities.length);
  assert.equal(verificationCount.value, seedCommunities.length);
});

void test('repository lists seeded communities in editorial order with sources', async () => {
  const repository = new PostgresCommunityRepository(getDatabase());
  const records = await repository.list();

  assert.equal(records.length, seedCommunities.length);
  assert.deepEqual(
    records.map((community) => community.slug),
    seedCommunities.map((community) => community.slug),
  );
  assert.deepEqual(records[0].sources, seedCommunities[0].sources);
});

void test('service retrieves a community by slug and returns null when absent', async () => {
  const service = new CommunityService(
    new PostgresCommunityRepository(getDatabase()),
  );

  const community = await service.getBySlug('safra-squash-club');
  assert.equal(community?.name, 'SAFRA Squash Club');
  assert.equal(await service.getBySlug('missing-community'), null);
});

void test('repository applies search and every discovery filter', async () => {
  const repository = new PostgresCommunityRepository(getDatabase());

  const searched = await repository.list({ q: 'Kent Ridge' });
  assert.deepEqual(
    searched.map((community) => community.slug),
    ['nuss-squash-section'],
  );

  const filtered = await repository.list({
    region: 'East',
    category: 'Private club',
    access: 'Members',
    level: 'Competitive',
    training: true,
  });
  assert.deepEqual(
    filtered.map((community) => community.slug),
    ['chinese-swimming-club-squash'],
  );
});

void test('public query validation rejects invalid and unknown parameters', () => {
  assert.equal(
    parseCommunitySearchParams(
      new URLSearchParams('training=occasionally'),
    ).success,
    false,
  );
  assert.equal(
    parseCommunitySearchParams(new URLSearchParams('sort=price')).success,
    false,
  );
});

void test('list API returns filtered records and rejects invalid parameters', async () => {
  const validResponse = await listCommunitiesApi(
    new Request('http://localhost/api/communities?region=West&q=Kent%20Ridge'),
  );
  assert.equal(validResponse.status, 200);
  const validBody = (await validResponse.json()) as {
    data: Array<{ slug: string }>;
  };
  assert.deepEqual(
    validBody.data.map((community) => community.slug),
    ['nuss-squash-section'],
  );

  const invalidResponse = await listCommunitiesApi(
    new Request('http://localhost/api/communities?training=yes'),
  );
  assert.equal(invalidResponse.status, 400);
});

void test('detail API handles success, invalid slugs, and not found', async () => {
  const success = await getCommunityApi(
    new Request('http://localhost/api/communities/safra-squash-club'),
    { params: Promise.resolve({ slug: 'safra-squash-club' }) },
  );
  assert.equal(success.status, 200);

  const invalid = await getCommunityApi(
    new Request('http://localhost/api/communities/invalid_slug'),
    { params: Promise.resolve({ slug: 'invalid_slug' }) },
  );
  assert.equal(invalid.status, 400);

  const missing = await getCommunityApi(
    new Request('http://localhost/api/communities/missing-community'),
    { params: Promise.resolve({ slug: 'missing-community' }) },
  );
  assert.equal(missing.status, 404);
});
