'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Dumbbell,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { AccessType, Community, CommunityCategory, PlayerLevel, Region } from '@/lib/communities';
import { emptyDiscoveryFilters, filterCommunities, parseDiscoveryParams, serializeDiscoveryParams } from '@/lib/discovery';
import { cn } from '@/lib/utils';

const regions: Region[] = ['Central', 'East', 'West', 'North', 'North-East', 'Islandwide'];
const categories: CommunityCategory[] = [
  'Public programme',
  'Competitive community',
  'Alumni community',
  'Private club',
  'Social group',
  'Coaching academy',
];
const accessTypes: AccessType[] = ['Public', 'Eligibility-based', 'Members', 'Guests welcome'];
const levels: PlayerLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];

const verificationTone: Record<Community['verificationStatus'], string> = {
  'Organizer verified': 'bg-[#e2f3e5] text-[#19633e]',
  Unverified: 'bg-[#fff1d9] text-[#875017]',
  'Needs re-checking': 'bg-[#f4e6e2] text-[#89402e]',
};

function checkedLabel(date: string) {
  return new Intl.DateTimeFormat('en-SG', { month: 'short', year: 'numeric', timeZone: 'Asia/Singapore' }).format(
    new Date(`${date}T00:00:00+08:00`),
  );
}

export function DiscoveryClient({ communities }: { communities: Community[] }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [access, setAccess] = useState('');
  const [level, setLevel] = useState('');
  const [trainingOnly, setTrainingOnly] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const parsed = parseDiscoveryParams(
      new URLSearchParams(window.location.search),
      new Set(communities.map((community) => community.slug)),
    );
    setQuery(parsed.filters.query);
    setRegion(parsed.filters.region);
    setCategory(parsed.filters.category);
    setAccess(parsed.filters.access);
    setLevel(parsed.filters.level);
    setTrainingOnly(parsed.filters.trainingOnly);
    setCompared(parsed.compared);
    setHydrated(true);
  }, [communities]);

  useEffect(() => {
    if (!hydrated) return;
    const params = serializeDiscoveryParams({ query, region, category, access, level, trainingOnly }, compared);
    const suffix = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', suffix);
  }, [access, category, compared, hydrated, level, query, region, trainingOnly]);

  const filtered = useMemo(
    () => filterCommunities(communities, { query, region, category, access, level, trainingOnly }),
    [access, category, communities, level, query, region, trainingOnly],
  );

  const comparedCommunities = compared
    .map((slug) => communities.find((community) => community.slug === slug))
    .filter((community): community is Community => Boolean(community));

  function resetFilters() {
    setQuery(emptyDiscoveryFilters.query);
    setRegion(emptyDiscoveryFilters.region);
    setCategory(emptyDiscoveryFilters.category);
    setAccess(emptyDiscoveryFilters.access);
    setLevel(emptyDiscoveryFilters.level);
    setTrainingOnly(emptyDiscoveryFilters.trainingOnly);
  }

  function quickFilter(kind: 'campus' | 'public' | 'training' | 'beginner') {
    resetFilters();
    if (kind === 'campus') setCategory('Alumni community');
    if (kind === 'public') setAccess('Public');
    if (kind === 'training') setTrainingOnly(true);
    if (kind === 'beginner') setLevel('Beginner');
    document.getElementById('communities')?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleCompare(slug: string) {
    if (compared.includes(slug)) {
      setCompared((current) => current.filter((value) => value !== slug));
      setMessage('Removed from comparison.');
      return;
    }
    if (compared.length === 3) {
      setMessage('You can compare up to three communities. Remove one to add another.');
      return;
    }
    setCompared((current) => [...current, slug]);
    setMessage('Added to comparison.');
  }

  const filtersActive = Boolean(query || region || category || access || level || trainingOnly);

  return (
    <>
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
              Compare who can join, what it costs, how serious the training is, and exactly who to contact.
            </p>
          </div>

          <div className="mt-7 max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-[0_18px_60px_rgba(18,72,50,0.08)] sm:p-4">
            <label htmlFor="community-search" className="sr-only">Search communities or neighbourhoods</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="community-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a club, group, or neighbourhood"
                className="h-12 rounded-xl border-transparent bg-muted/70 pl-10 pr-10 text-base shadow-none focus-visible:bg-background sm:text-sm"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Popular filters">
              <button onClick={() => quickFilter('campus')} className="filter-chip">Near campus</button>
              <button onClick={() => quickFilter('public')} className="filter-chip">Open to public</button>
              <button onClick={() => quickFilter('training')} className="filter-chip">Structured training</button>
              <button onClick={() => quickFilter('beginner')} className="filter-chip">Beginner friendly</button>
            </div>
          </div>
        </div>
      </section>

      <section id="communities" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit" aria-label="Community filters">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <SlidersHorizontal className="size-4 text-primary" /> Filters
                </div>
                {filtersActive && (
                  <button onClick={resetFilters} className="text-xs font-semibold text-primary hover:underline">Reset</button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <FilterSelect label="Region" value={region} onChange={setRegion} options={regions} />
                <FilterSelect label="Community type" value={category} onChange={setCategory} options={categories} />
                <FilterSelect label="Access" value={access} onChange={setAccess} options={accessTypes} />
                <FilterSelect label="Playing level" value={level} onChange={setLevel} options={levels} />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/55 p-3 text-sm">
                  <Checkbox checked={trainingOnly} onCheckedChange={(checked) => setTrainingOnly(checked === true)} className="mt-0.5" />
                  <span>
                    <span className="block font-medium">Structured training</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Show communities with coaching or regular training.</span>
                  </span>
                </label>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">{filtered.length} of {communities.length} communities</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">A clearer place to start</h2>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Facts checked 29 Aug 2026 · Always confirm before paying</p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
                <Search className="mx-auto size-8 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No exact match yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try a nearby region, remove one filter, or browse all communities.</p>
                <Button onClick={resetFilters} variant="outline" className="mt-5">Clear filters</Button>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filtered.map((community) => (
                  <CommunityCard
                    key={community.slug}
                    community={community}
                    selected={compared.includes(community.slug)}
                    onCompare={() => toggleCompare(community.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[1.6rem] bg-[#143d2f] text-white shadow-[0_25px_70px_rgba(18,61,45,0.16)]">
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <Badge className="mb-5 bg-white/10 text-white">Built for the handover after university</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your squash community should not disappear after graduation.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
                Squashie makes the informal knowledge around access, fees, training, and club culture visible—so your next game can happen closer to home.
              </p>
              <a href="/methodology" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f2bc5b] hover:text-[#ffd17e]">
                See how we check listings <ArrowRight className="size-4" />
              </a>
            </div>
            <img
              src="/og.png"
              alt="Two young adult squash players sharing a relaxed moment after a game"
              width="1734"
              height="908"
              className="h-full min-h-64 w-full object-cover object-center lg:min-h-96"
            />
          </div>
        </div>
      </section>

      <div className="sr-only" aria-live="polite">{message}</div>

      {compared.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-12px_35px_rgba(23,52,40,0.10)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{compared.length} {compared.length === 1 ? 'community' : 'communities'} selected</p>
              <p className="truncate text-xs text-muted-foreground">Choose up to three to compare side by side.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" onClick={() => setCompared([])}>Clear</Button>
              <Button onClick={() => setCompareOpen(true)}>Compare now</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">Compare your shortlist</DialogTitle>
            <DialogDescription>Costs marked “not publicly listed” should be confirmed directly with the organizer.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-3">
            {comparedCommunities.map((community) => (
              <div key={community.slug} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{community.category}</Badge>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">{community.shortName}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{community.neighbourhood}</p>
                  </div>
                  <button onClick={() => toggleCompare(community.slug)} aria-label={`Remove ${community.name} from comparison`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </div>
                <dl className="mt-5 grid gap-4 text-sm">
                  <CompareRow label="Membership" value={community.eligibility} />
                  <CompareRow label="Joining fee" value={community.joiningFee} />
                  <CompareRow label="Recurring fee" value={community.recurringFee} />
                  <CompareRow label="Court fee" value={community.courtFee} />
                  <CompareRow label="Guest access" value={community.guestFee} />
                  <CompareRow label="Courts" value={community.courtCount} />
                  <CompareRow label="Social play" value={community.socialPlay} />
                  <CompareRow label="Training" value={community.trainingSummary} />
                  <CompareRow label="Levels" value={community.levels.join(', ')} />
                </dl>
                <a href={`/communities/${community.slug}`} className={cn(buttonVariants(), 'mt-5 w-full')}>View full listing</a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <NativeSelect value={value} onChange={(event) => onChange(event.target.value)} className="w-full">
        <NativeSelectOption value="">All {label.toLowerCase()}</NativeSelectOption>
        {options.map((option) => <NativeSelectOption key={option} value={option}>{option}</NativeSelectOption>)}
      </NativeSelect>
    </label>
  );
}

function CommunityCard({ community, selected, onCompare }: { community: Community; selected: boolean; onCompare: () => void }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_10px_35px_rgba(23,52,40,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(23,52,40,0.09)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary">{community.category}</Badge>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            <a href={`/communities/${community.slug}`} className="hover:text-primary">{community.name}</a>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" /> {community.neighbourhood} · {community.region}</p>
        </div>
        <Badge variant="secondary" className={cn('shrink-0', verificationTone[community.verificationStatus])}>
          {community.verificationStatus}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{community.suitableFor}</p>
      <dl className="mt-4 grid gap-3 rounded-xl bg-muted/55 p-3.5 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Users className="size-3.5" /> Access</dt>
          <dd className="mt-1 text-sm font-medium leading-5">{community.accessSummary}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Dumbbell className="size-3.5" /> Training</dt>
          <dd className="mt-1 text-sm font-medium leading-5">{community.trainingIntensity}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {community.levels.map((item) => <Badge key={item} variant="outline" className="font-normal">{item}</Badge>)}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/75 pt-5">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleDollarSign className="size-3.5" /> Indicative cost</span>
          <span className="mt-1 block text-sm font-semibold leading-5">{community.indicativeCost}</span>
          <span className="mt-1 block text-[11px] text-muted-foreground">Checked {checkedLabel(community.lastChecked)}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
            <Checkbox checked={selected} onCheckedChange={onCompare} /> Compare
          </label>
          <a href={`/communities/${community.slug}`} className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}>Details <ArrowRight className="size-4" /></a>
        </div>
      </div>
    </article>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-5">{value}</dd>
    </div>
  );
}
