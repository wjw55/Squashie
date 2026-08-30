import type { Community, PlayerLevel } from '@/lib/communities';

export interface DiscoveryFilters {
  query: string;
  region: string;
  category: string;
  access: string;
  level: string;
  trainingOnly: boolean;
}

export interface DiscoveryState {
  filters: DiscoveryFilters;
  compared: string[];
}

export type QuickFilter = 'campus' | 'public' | 'training' | 'beginner';

export type ComparisonChange =
  | { status: 'added' | 'removed'; compared: string[] }
  | { status: 'limit'; compared: string[] };

export const emptyDiscoveryFilters: DiscoveryFilters = {
  query: '',
  region: '',
  category: '',
  access: '',
  level: '',
  trainingOnly: false,
};

export function filtersForQuickFilter(kind: QuickFilter): DiscoveryFilters {
  if (kind === 'campus') {
    return { ...emptyDiscoveryFilters, category: 'Alumni community' };
  }
  if (kind === 'public') {
    return { ...emptyDiscoveryFilters, access: 'Public' };
  }
  if (kind === 'training') {
    return { ...emptyDiscoveryFilters, trainingOnly: true };
  }
  return { ...emptyDiscoveryFilters, level: 'Beginner' };
}

export function toggleComparedCommunity(
  compared: string[],
  slug: string,
  limit = 3,
): ComparisonChange {
  if (compared.includes(slug)) {
    return {
      status: 'removed',
      compared: compared.filter((value) => value !== slug),
    };
  }
  if (compared.length >= limit) {
    return { status: 'limit', compared };
  }
  return { status: 'added', compared: [...compared, slug] };
}

export function filterCommunities(
  records: Community[],
  filters: DiscoveryFilters,
) {
  const normalized = filters.query.trim().toLowerCase();
  return records.filter((community) => {
    const searchable = [
      community.name,
      community.shortName,
      community.neighbourhood,
      community.address,
      community.region,
      community.category,
      community.description,
    ]
      .join(' ')
      .toLowerCase();
    return (
      (!normalized || searchable.includes(normalized)) &&
      (!filters.region || community.region === filters.region) &&
      (!filters.category || community.category === filters.category) &&
      (!filters.access || community.accessType === filters.access) &&
      (!filters.level ||
        community.levels.includes(filters.level as PlayerLevel)) &&
      (!filters.trainingOnly || community.trainingAvailable)
    );
  });
}

export function parseDiscoveryParams(
  params: URLSearchParams,
  validSlugs: Set<string>,
): DiscoveryState {
  const compared = (params.get('compare') ?? '')
    .split(',')
    .filter((slug) => validSlugs.has(slug))
    .filter((slug, index, slugs) => slugs.indexOf(slug) === index)
    .slice(0, 3);

  return {
    filters: {
      query: params.get('q') ?? '',
      region: params.get('region') ?? '',
      category: params.get('category') ?? '',
      access: params.get('access') ?? '',
      level: params.get('level') ?? '',
      trainingOnly: params.get('training') === 'true',
    },
    compared,
  };
}

export function serializeDiscoveryParams(
  filters: DiscoveryFilters,
  compared: string[],
) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.region) params.set('region', filters.region);
  if (filters.category) params.set('category', filters.category);
  if (filters.access) params.set('access', filters.access);
  if (filters.level) params.set('level', filters.level);
  if (filters.trainingOnly) params.set('training', 'true');
  if (compared.length) params.set('compare', compared.slice(0, 3).join(','));
  return params;
}
