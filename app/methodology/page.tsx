import type { Metadata } from 'next';
import { ArrowLeft, CalendarCheck2, CircleAlert, ExternalLink, ShieldCheck, UsersRound } from 'lucide-react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { correctionEmail } from '@/lib/config';

export const metadata: Metadata = {
  title: 'How Squashie listings work',
  description: 'How Squashie sources, checks, labels, and updates Singapore squash community listings.',
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to discovery</a>

        <section className="mt-7 max-w-3xl">
          <Badge variant="secondary">Trust and methodology</Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Useful enough to act on. Honest about what we do not know.</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
            Squash information is often spread across club pages, membership forms, programme listings, and community platforms. Squashie brings those facts together without pretending they are permanent.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <MethodCard icon={<ShieldCheck />} title="Organizational sources" text="We use official club, association, programme, or organizer-managed pages. Personal player details are not published." />
          <MethodCard icon={<CalendarCheck2 />} title="Visible check dates" text="Every listing shows when its public information was last reviewed, so you can judge how current it is." />
          <MethodCard icon={<CircleAlert />} title="Unknown means unknown" text="If a fee or rule is not public, we say so. Missing information is never interpreted as free or unrestricted." />
        </section>

        <section className="mt-12 rounded-3xl border border-border bg-card p-5 sm:p-8">
          <p className="eyebrow">Verification labels</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">How to read each listing</h2>
          <dl className="mt-6 grid gap-5">
            <StatusRow label="Organizer verified" tone="bg-[#e2f3e5] text-[#19633e]" text="An authorized organizer has confirmed the material facts shown on the listing." />
            <StatusRow label="Unverified" tone="bg-[#fff1d9] text-[#875017]" text="Squashie has summarized current public information, but the organization has not yet confirmed it directly." />
            <StatusRow label="Needs re-checking" tone="bg-[#f4e6e2] text-[#89402e]" text="One or more important details are incomplete, old, or likely to change. Contact the organizer before relying on them." />
          </dl>
        </section>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">Included</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">What counts as a community</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground">
              {['Private club squash sections', 'Public and eligibility-based programmes', 'Competitive and recurring social groups', 'Coaching communities with a clear joining route'].map((item) => <li key={item} className="flex gap-3"><UsersRound className="mt-1 size-4 shrink-0 text-primary" />{item}</li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Not included</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">What Squashie does not guarantee</h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Squashie is an independent discovery guide, not an endorsement, booking agent, club representative, or guarantee of availability. Fees, schedules, eligibility, and programme terms remain controlled by each organization.
            </p>
            <a href="https://sgsquash.com/find-a-court/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Need a court rather than a community? Use Singapore Squash’s court directory <ExternalLink className="size-4" /></a>
          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-[#143d2f] p-6 text-white sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Help make a listing better</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
            Organizers can verify a listing or provide a source-backed correction. We review changes manually before publishing them.
          </p>
          {correctionEmail ? (
            <a href={`mailto:${correctionEmail}?subject=${encodeURIComponent('Squashie listing correction or verification')}`} className="mt-5 inline-flex rounded-xl bg-[#f2bc5b] px-4 py-2 text-sm font-semibold text-[#51300b] hover:bg-[#ffd17e]">Email a correction</a>
          ) : (
            <p className="mt-5 inline-flex rounded-xl border border-white/25 px-3 py-2 text-xs text-white/70">The correction email will be enabled before the public launch.</p>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}

function MethodCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary [&_svg]:size-5">{icon}</div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}

function StatusRow({ label, tone, text }: { label: string; tone: string; text: string }) {
  return (
    <div className="grid gap-2 border-b border-border pb-5 last:border-0 last:pb-0 sm:grid-cols-[170px_1fr] sm:items-start">
      <dt><Badge variant="secondary" className={tone}>{label}</Badge></dt>
      <dd className="text-sm leading-6 text-muted-foreground">{text}</dd>
    </div>
  );
}
