import assert from 'node:assert/strict';
import test from 'node:test';

import { communities, notListed } from '../lib/communities.ts';
import { emptyDiscoveryFilters, filterCommunities, parseDiscoveryParams, serializeDiscoveryParams } from '../lib/discovery.ts';

test('pilot contains 10–15 source-backed communities', () => {
  assert.ok(communities.length >= 10 && communities.length <= 15);
  for (const community of communities) {
    assert.ok(community.sources.length > 0);
    assert.match(community.lastChecked, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('unknown costs use the explicit editorial label', () => {
  const unknownValues = communities.flatMap((community) => [community.joiningFee, community.recurringFee, community.courtFee, community.guestFee]).filter((value) => value.includes('Not publicly listed'));
  assert.ok(unknownValues.length > 0);
  assert.ok(unknownValues.every((value) => value === notListed));
});

test('search and every filter produce relevant records', () => {
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, query: 'Kent Ridge' }).some((item) => item.slug === 'nuss-squash-section'));
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, region: 'East' }).every((item) => item.region === 'East'));
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, category: 'Social group' }).every((item) => item.category === 'Social group'));
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, access: 'Public' }).every((item) => item.accessType === 'Public'));
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, level: 'Beginner' }).every((item) => item.levels.includes('Beginner')));
  assert.ok(filterCommunities(communities, { ...emptyDiscoveryFilters, trainingOnly: true }).every((item) => item.trainingAvailable));
});

test('URL state round-trips and comparison is capped at three valid records', () => {
  const filters = { ...emptyDiscoveryFilters, query: 'squash', region: 'Central', trainingOnly: true };
  const params = serializeDiscoveryParams(filters, communities.slice(0, 4).map((item) => item.slug));
  const parsed = parseDiscoveryParams(params, new Set(communities.map((item) => item.slug)));
  assert.equal(parsed.filters.query, 'squash');
  assert.equal(parsed.filters.region, 'Central');
  assert.equal(parsed.filters.trainingOnly, true);
  assert.equal(parsed.compared.length, 3);
});

test('combined filters can return an intentional empty state', () => {
  const results = filterCommunities(communities, { ...emptyDiscoveryFilters, region: 'North', category: 'Private club' });
  assert.deepEqual(results, []);
});
