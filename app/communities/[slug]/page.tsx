import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Dumbbell,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { correctionHref } from '@/lib/config';
import { loadCommunity } from '@/lib/server/community-loaders';
import { cn } from '@/lib/utils';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (process.env.SQUASHIE_TEST_DATABASE === '1') {
    return {
      title: 'Community listing',
      description:
        'Source-backed access, cost, training, and joining information for a Singapore squash community.',
    };
  }
  const community = await loadCommunity(slug);
  if (!community) return { title: 'Community not found' };
  const description = `${community.suitableFor} Access: ${community.accessSummary}. Indicative cost: ${community.indicativeCost}.`;
  return {
    title: community.name,
    description,
    openGraph: {
      title: `${community.name} | Squashie`,
      description,
      images: [],
    },
    twitter: {
      card: 'summary',
      title: `${community.name} | Squashie`,
      description,
      images: [],
    },
  };
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const community = await loadCommunity(slug);
  if (!community) notFound();
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(community.address)}`;
  const correction = correctionHref(community.name);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <Link
          href="/#communities"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to all communities
        </Link>

        <section className="mt-6 overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-[0_24px_70px_rgba(18,72,50,0.09)]">
          <div className="bg-[linear-gradient(135deg,#173f31_0%,#245f49_70%,#2e7056_100%)] px-5 py-7 text-white sm:px-9 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/12 text-white">
                {community.category}
              </Badge>
              <Badge className="bg-[#f2bc5b] text-[#51300b]">
                {community.verificationStatus}
              </Badge>
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              {community.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/78 sm:text-lg">
              {community.suitableFor}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/76">
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-[#f2bc5b]" />{' '}
                {community.neighbourhood} · {community.region}
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4 text-[#f2bc5b]" />{' '}
                {community.accessSummary}
              </span>
              <span className="flex items-center gap-2">
                <Dumbbell className="size-4 text-[#f2bc5b]" />{' '}
                {community.trainingIntensity}
              </span>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-9 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <section>
                <p className="eyebrow">At a glance</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Who this suits
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {community.levels.map((level) => (
                    <Badge key={level} variant="outline" className="h-6 px-2.5">
                      {level}
                    </Badge>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <p className="eyebrow">Access</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  What you need to join
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={<ShieldCheck />}
                    title="Eligibility"
                    value={community.eligibility}
                  />
                  <InfoCard
                    icon={<Users />}
                    title="Guest access"
                    value={community.guestFee}
                  />
                </div>
              </section>

              <section className="mt-10">
                <p className="eyebrow">Play and improve</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Community rhythm
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={<CalendarDays />}
                    title="Social play"
                    value={community.socialPlay}
                  />
                  <InfoCard
                    icon={<Dumbbell />}
                    title="Training"
                    value={community.trainingSummary}
                  />
                  <InfoCard
                    icon={<Clock3 />}
                    title="Courts"
                    value={community.courtCount}
                  />
                  <InfoCard
                    icon={<MapPin />}
                    title="Venue"
                    value={community.address}
                  />
                </div>
              </section>

              <section className="mt-10">
                <p className="eyebrow">Joining steps</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Your next three moves
                </h2>
                <ol className="mt-5 grid gap-3">
                  {community.joiningSteps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-4 rounded-2xl border border-border bg-muted/30 p-4"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm leading-6">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-border bg-[#f3f7f1] p-5">
                <p className="eyebrow">Cost snapshot</p>
                <div className="mt-3 flex items-start gap-3">
                  <CircleDollarSign className="mt-1 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold leading-6">
                      {community.indicativeCost}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Indicative only; confirm before committing.
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm">
                  <PriceRow label="Joining fee" value={community.joiningFee} />
                  <PriceRow
                    label="Recurring fee"
                    value={community.recurringFee}
                  />
                  <PriceRow label="Court fee" value={community.courtFee} />
                  <PriceRow label="Guest fee" value={community.guestFee} />
                </dl>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-semibold">Ready to take the next step?</h2>
                <div className="mt-4 grid gap-2">
                  {community.contacts.map((contact) => (
                    <a
                      key={contact.href}
                      href={contact.href}
                      target={
                        contact.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        contact.href.startsWith('http')
                          ? 'noreferrer'
                          : undefined
                      }
                      className={cn(
                        buttonVariants({
                          variant:
                            contact.kind === 'email' || contact.kind === 'form'
                              ? 'default'
                              : 'outline',
                        }),
                        'h-auto min-h-9 justify-between px-3 py-2 text-left whitespace-normal',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {contact.kind === 'email' ? (
                          <Mail />
                        ) : contact.kind === 'phone' ? (
                          <Phone />
                        ) : (
                          <ExternalLink />
                        )}{' '}
                        {contact.label}
                      </span>
                      <ArrowUpRight />
                    </a>
                  ))}
                  <a
                    href={directions}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'h-auto min-h-9 justify-between px-3 py-2',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin /> Open directions
                    </span>
                    <ArrowUpRight />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {community.note && (
          <div className="mt-5 rounded-2xl border border-[#e5c9a6] bg-[#fff7e9] p-4 text-sm leading-6 text-[#704a20]">
            <strong>Before you go:</strong> {community.note}
          </div>
        )}

        <section className="mt-8 grid gap-5 border-t border-border pt-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="size-4 text-primary" /> Listing sources
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Last checked {community.lastChecked}. Squashie summarizes public
              organizational information; source pages remain authoritative.
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {community.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {source.label} <ExternalLink className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:text-right">
            {correction ? (
              <a
                href={correction}
                className={buttonVariants({ variant: 'outline' })}
              >
                Suggest a correction or verify
              </a>
            ) : (
              <span className="inline-flex rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                Correction email activates before public launch
              </span>
            )}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary [&_svg]:size-4">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="leading-5">{value}</dd>
    </div>
  );
}
