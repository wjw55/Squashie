import type { Community, PlayerLevel } from '@/lib/communities';

export interface DiscoveryFilters {
  query: string;
  region: string;
  category: string;
  access: string;
  level: string;
  trainingOnly: boolean;
}

export const emptyDiscoveryFilters: DiscoveryFilters = {
  query: '',
  region: '',
  category: '',
  access: '',
  level: '',
  trainingOnly: false,
};

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
) {
  return {
    filters: {
      query: params.get('q') ?? '',
      region: params.get('region') ?? '',
      category: params.get('category') ?? '',
      access: params.get('access') ?? '',
      level: params.get('level') ?? '',
      trainingOnly: params.get('training') === 'true',
    },
    compared: (params.get('compare') ?? '')
      .split(',')
      .filter((slug) => validSlugs.has(slug))
      .slice(0, 3),
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
