import Link from 'next/link';
import {
  ArrowRight,
  CircleDollarSign,
  Dumbbell,
  MapPin,
  Search,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Community } from '@/lib/domain/community';
import { cn } from '@/lib/utils';

const verificationTone: Record<Community['verificationStatus'], string> = {
  'Organizer verified': 'bg-[#e2f3e5] text-[#19633e]',
  Unverified: 'bg-[#fff1d9] text-[#875017]',
  'Needs re-checking': 'bg-[#f4e6e2] text-[#89402e]',
};

function checkedLabel(date: string) {
  return new Intl.DateTimeFormat('en-SG', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  }).format(new Date(`${date}T00:00:00+08:00`));
}

function latestCheckedDate(communities: Community[]) {
  return communities.reduce(
    (latest, community) =>
      community.lastChecked > latest ? community.lastChecked : latest,
    '',
  );
}

export function CommunityResults({
  communities,
  filtered,
  compared,
  onCompare,
  onReset,
}: {
  communities: Community[];
  filtered: Community[];
  compared: string[];
  onCompare: (slug: string) => void;
  onReset: () => void;
}) {
  const latestChecked = latestCheckedDate(communities);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            {filtered.length} of {communities.length} communities
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            A clearer place to start
          </h2>
        </div>
        {latestChecked && (
          <p className="text-xs leading-5 text-muted-foreground">
            Facts checked {checkedLabel(latestChecked)} · Always confirm before
            paying
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
          <Search className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {communities.length === 0
              ? 'No published listings yet'
              : 'No exact match yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {communities.length === 0
              ? 'The directory is connected, but there are currently no published communities.'
              : 'Try a nearby region, remove one filter, or browse all communities.'}
          </p>
          {communities.length > 0 && (
            <Button onClick={onReset} variant="outline" className="mt-5">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((community) => (
            <CommunityCard
              key={community.slug}
              community={community}
              selected={compared.includes(community.slug)}
              onCompare={() => onCompare(community.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommunityCard({
  community,
  selected,
  onCompare,
}: {
  community: Community;
  selected: boolean;
  onCompare: () => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_10px_35px_rgba(23,52,40,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(23,52,40,0.09)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary">{community.category}</Badge>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            <Link
              href={`/communities/${community.slug}`}
              className="hover:text-primary"
            >
              {community.name}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {community.neighbourhood} ·{' '}
            {community.region}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'shrink-0',
            verificationTone[community.verificationStatus],
          )}
        >
          {community.verificationStatus}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {community.suitableFor}
      </p>
      <dl className="mt-4 grid gap-3 rounded-xl bg-muted/55 p-3.5 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5" /> Access
          </dt>
          <dd className="mt-1 text-sm font-medium leading-5">
            {community.accessSummary}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Dumbbell className="size-3.5" /> Training
          </dt>
          <dd className="mt-1 text-sm font-medium leading-5">
            {community.trainingIntensity}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {community.levels.map((item) => (
          <Badge key={item} variant="outline" className="font-normal">
            {item}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/75 pt-5">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleDollarSign className="size-3.5" /> Indicative cost
          </span>
          <span className="mt-1 block text-sm font-semibold leading-5">
            {community.indicativeCost}
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Checked {checkedLabel(community.lastChecked)}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Checkbox
              id={`compare-${community.slug}`}
              aria-labelledby={`compare-${community.slug}-label`}
              checked={selected}
              onCheckedChange={onCompare}
            />
            <label
              id={`compare-${community.slug}-label`}
              htmlFor={`compare-${community.slug}`}
              className="cursor-pointer"
            >
              Compare
            </label>
          </div>
          <Link
            href={`/communities/${community.slug}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}
          >
            Details <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
