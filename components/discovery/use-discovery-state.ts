'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';

import type { Community } from '@/lib/domain/community';
import {
  emptyDiscoveryFilters,
  filterCommunities,
  filtersForQuickFilter,
  parseDiscoveryParams,
  serializeDiscoveryParams,
  toggleComparedCommunity,
  type DiscoveryFilters,
  type DiscoveryState,
  type QuickFilter,
} from '@/lib/discovery';

type DiscoveryAction =
  | { type: 'hydrate'; state: DiscoveryState }
  | {
      type: 'set-filter';
      key: keyof DiscoveryFilters;
      value: DiscoveryFilters[keyof DiscoveryFilters];
    }
  | { type: 'set-filters'; filters: DiscoveryFilters }
  | { type: 'set-compared'; compared: string[] };

const initialState: DiscoveryState = {
  filters: emptyDiscoveryFilters,
  compared: [],
};

function discoveryReducer(
  state: DiscoveryState,
  action: DiscoveryAction,
): DiscoveryState {
  if (action.type === 'hydrate') return action.state;
  if (action.type === 'set-filter') {
    return {
      ...state,
      filters: { ...state.filters, [action.key]: action.value },
    };
  }
  if (action.type === 'set-filters') {
    return { ...state, filters: action.filters };
  }
  return { ...state, compared: action.compared };
}

export function useDiscoveryState(communities: Community[]) {
  const [state, dispatch] = useReducer(discoveryReducer, initialState);
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const validSlugs = useMemo(
    () => new Set(communities.map((community) => community.slug)),
    [communities],
  );

  useEffect(() => {
    const parsed = parseDiscoveryParams(
      new URLSearchParams(window.location.search),
      validSlugs,
    );
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      dispatch({ type: 'hydrate', state: parsed });
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [validSlugs]);

  useEffect(() => {
    if (!hydrated) return;
    const params = serializeDiscoveryParams(state.filters, state.compared);
    const suffix = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, '', suffix);
  }, [hydrated, state]);

  const filtered = useMemo(
    () => filterCommunities(communities, state.filters),
    [communities, state.filters],
  );
  const comparedCommunities = useMemo(
    () =>
      state.compared
        .map((slug) =>
          communities.find((community) => community.slug === slug),
        )
        .filter((community): community is Community => Boolean(community)),
    [communities, state.compared],
  );

  function setFilter<Key extends keyof DiscoveryFilters>(
    key: Key,
    value: DiscoveryFilters[Key],
  ) {
    dispatch({ type: 'set-filter', key, value });
  }

  function resetFilters() {
    dispatch({ type: 'set-filters', filters: emptyDiscoveryFilters });
  }

  function applyQuickFilter(kind: QuickFilter) {
    dispatch({ type: 'set-filters', filters: filtersForQuickFilter(kind) });
    document
      .getElementById('communities')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleCompare(slug: string) {
    const change = toggleComparedCommunity(state.compared, slug);
    if (change.status === 'limit') {
      setMessage(
        'You can compare up to three communities. Remove one to add another.',
      );
      return;
    }
    dispatch({ type: 'set-compared', compared: change.compared });
    setMessage(
      change.status === 'added'
        ? 'Added to comparison.'
        : 'Removed from comparison.',
    );
  }

  function clearCompared() {
    dispatch({ type: 'set-compared', compared: [] });
    setMessage('Comparison cleared.');
  }

  return {
    hydrated,
    filters: state.filters,
    compared: state.compared,
    filtered,
    comparedCommunities,
    message,
    setFilter,
    resetFilters,
    applyQuickFilter,
    toggleCompare,
    clearCompared,
  };
}
