import Link from 'next/link';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Community } from '@/lib/domain/community';
import { cn } from '@/lib/utils';

const comparisonRows: {
  label: string;
  value: (community: Community) => string;
}[] = [
  { label: 'Suitable for', value: (community) => community.suitableFor },
  { label: 'Membership', value: (community) => community.eligibility },
  { label: 'Indicative cost', value: (community) => community.indicativeCost },
  { label: 'Joining fee', value: (community) => community.joiningFee },
  { label: 'Recurring fee', value: (community) => community.recurringFee },
  { label: 'Court fee', value: (community) => community.courtFee },
  { label: 'Guest access', value: (community) => community.guestFee },
  { label: 'Courts', value: (community) => community.courtCount },
  { label: 'Social play', value: (community) => community.socialPlay },
  { label: 'Training', value: (community) => community.trainingSummary },
  { label: 'Levels', value: (community) => community.levels.join(', ') },
];

export function ComparisonDock({
  count,
  onClear,
  onOpen,
}: {
  count: number;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-12px_35px_rgba(23,52,40,0.10)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {count} {count === 1 ? 'community' : 'communities'} selected
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Choose up to three to compare side by side.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" onClick={onClear}>
            Clear
          </Button>
          <Button onClick={onOpen}>Compare now</Button>
        </div>
      </div>
    </div>
  );
}

export function ComparisonDialog({
  open,
  onOpenChange,
  communities,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communities: Community[];
  onRemove: (slug: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] gap-0 overflow-hidden p-0"
        style={{ width: 'calc(100% - 1rem)', maxWidth: '72rem' }}
      >
        <DialogHeader className="border-b border-border px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Compare your shortlist
          </DialogTitle>
          <DialogDescription>
            Costs marked “not publicly listed” should be confirmed directly
            with the organizer.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-8.5rem)] overflow-auto">
          <div className="grid gap-3 p-4 md:hidden">
            {communities.map((community) => (
              <MobileComparisonCard
                key={community.slug}
                community={community}
                onRemove={() => onRemove(community.slug)}
              />
            ))}
          </div>

          <table className="hidden w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-left md:table">
            <caption className="sr-only">
              Comparison of selected squash communities by membership, fees,
              access, facilities, social play, and training
            </caption>
            <colgroup>
              <col className="w-44 lg:w-52" />
              {communities.map((community) => (
                <col key={community.slug} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 top-0 z-30 border-b border-border bg-[#eef4ec] px-4 py-4 align-bottom"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Indicators
                  </span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
                    Compare each detail across your shortlist.
                  </span>
                </th>
                {communities.map((community) => (
                  <th
                    key={community.slug}
                    scope="col"
                    className="sticky top-0 z-20 border-b border-l border-border bg-card px-4 py-4 align-top"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Badge
                          variant="secondary"
                          className="max-w-full whitespace-normal text-left leading-4"
                        >
                          {community.category}
                        </Badge>
                        <Link
                          href={`/communities/${community.slug}`}
                          className="mt-2 block text-base font-semibold leading-snug hover:text-primary"
                        >
                          {community.shortName}
                        </Link>
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {community.neighbourhood} · {community.region}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(community.slug)}
                        aria-label={`Remove ${community.name} from comparison`}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className={cn(
                      'sticky left-0 z-10 border-b border-border px-4 py-3 align-top text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground',
                      rowIndex % 2 === 0 ? 'bg-[#f8faf6]' : 'bg-[#eef4ec]',
                    )}
                  >
                    {row.label}
                  </th>
                  {communities.map((community) => (
                    <td
                      key={community.slug}
                      className={cn(
                        'border-b border-l border-border px-4 py-3 align-top text-sm leading-6',
                        rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/35',
                      )}
                    >
                      {row.value(community)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-[#eef4ec] px-4 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                >
                  Full details
                </th>
                {communities.map((community) => (
                  <td
                    key={community.slug}
                    className="border-l border-border bg-card px-4 py-4"
                  >
                    <Link
                      href={`/communities/${community.slug}`}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'w-full',
                      )}
                    >
                      View {community.shortName}
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 leading-5">{value}</dd>
    </div>
  );
}

function MobileComparisonCard({
  community,
  onRemove,
}: {
  community: Community;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary">{community.category}</Badge>
          <h3 className="mt-3 text-lg font-semibold leading-snug">
            {community.shortName}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {community.neighbourhood} · {community.region}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${community.name} from comparison`}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <dl className="mt-5 grid gap-4 text-sm">
        {comparisonRows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            value={row.value(community)}
          />
        ))}
      </dl>
      <Link
        href={`/communities/${community.slug}`}
        className={cn(buttonVariants(), 'mt-5 w-full')}
      >
        View full listing
      </Link>
    </article>
  );
}
