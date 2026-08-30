import { Search, Sparkles, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { QuickFilter } from '@/lib/discovery';

export function DiscoveryHero({
  query,
  onQueryChange,
  onQuickFilter,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onQuickFilter: (kind: QuickFilter) => void;
}) {
  return (
    <section className="border-b border-border/70 bg-[linear-gradient(180deg,#f1f7f1_0%,#fbfcf8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4 text-[#d88423]" />
            Your front door to squash in Singapore
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl sm:leading-[1.04] lg:text-[3.5rem]">
            Find a squash community that fits your life.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Compare who can join, what it costs, how serious the training is,
            and exactly who to contact.
          </p>
        </div>

        <div className="mt-7 max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-[0_18px_60px_rgba(18,72,50,0.08)] sm:p-4">
          <label htmlFor="community-search" className="sr-only">
            Search communities or neighbourhoods
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="community-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search a club, group, or neighbourhood"
              className="h-12 rounded-xl border-transparent bg-muted/70 pl-10 pr-10 text-base shadow-none focus-visible:bg-background sm:text-sm"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Popular filters"
          >
            <button
              type="button"
              onClick={() => onQuickFilter('campus')}
              className="filter-chip"
            >
              Near campus
            </button>
            <button
              type="button"
              onClick={() => onQuickFilter('public')}
              className="filter-chip"
            >
              Open to public
            </button>
            <button
              type="button"
              onClick={() => onQuickFilter('training')}
              className="filter-chip"
            >
              Structured training
            </button>
            <button
              type="button"
              onClick={() => onQuickFilter('beginner')}
              className="filter-chip"
            >
              Beginner friendly
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
