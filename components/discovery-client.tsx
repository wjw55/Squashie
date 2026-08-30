'use client';

import { useState } from 'react';

import { CommunityResults } from '@/components/discovery/community-results';
import {
  ComparisonDialog,
  ComparisonDock,
} from '@/components/discovery/comparison';
import { DiscoveryFilters } from '@/components/discovery/discovery-filters';
import { DiscoveryHero } from '@/components/discovery/discovery-hero';
import { EditorialCallout } from '@/components/discovery/editorial-callout';
import { useDiscoveryState } from '@/components/discovery/use-discovery-state';
import type { Community } from '@/lib/communities';

export function DiscoveryClient({ communities }: { communities: Community[] }) {
  const [compareOpen, setCompareOpen] = useState(false);
  const discovery = useDiscoveryState(communities);
  const filtersActive = Boolean(
    discovery.filters.query ||
      discovery.filters.region ||
      discovery.filters.category ||
      discovery.filters.access ||
      discovery.filters.level ||
      discovery.filters.trainingOnly,
  );

  return (
    <>
      <DiscoveryHero
        query={discovery.filters.query}
        onQueryChange={(query) => discovery.setFilter('query', query)}
        onQuickFilter={discovery.applyQuickFilter}
      />

      <section
        id="communities"
        data-discovery-ready={discovery.hydrated}
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
          <DiscoveryFilters
            filters={discovery.filters}
            filtersActive={filtersActive}
            onFilterChange={discovery.setFilter}
            onReset={discovery.resetFilters}
          />
          <CommunityResults
            communities={communities}
            filtered={discovery.filtered}
            compared={discovery.compared}
            onCompare={discovery.toggleCompare}
            onReset={discovery.resetFilters}
          />
        </div>
      </section>

      <EditorialCallout />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {discovery.message}
      </div>

      <ComparisonDock
        count={discovery.compared.length}
        onClear={discovery.clearCompared}
        onOpen={() => setCompareOpen(true)}
      />
      <ComparisonDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        communities={discovery.comparedCommunities}
        onRemove={discovery.toggleCompare}
      />
    </>
  );
}
