import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileCheck2, ShieldCheck } from 'lucide-react';

import { CorrectionForm } from '@/components/correction-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { loadCommunities } from '@/lib/server/community-loaders';

export const metadata: Metadata = {
  title: 'Suggest a listing correction',
  description:
    'Submit a source-backed correction for a Squashie community listing.',
};

type PageProps = {
  searchParams: Promise<{ community?: string }>;
};

export default async function CorrectionsPage({ searchParams }: PageProps) {
  const [{ community }, communities] = await Promise.all([
    searchParams,
    loadCommunities(),
  ]);
  const options = communities.map(({ slug, name }) => ({ slug, name }));
  const defaultCommunity = options.some((option) => option.slug === community)
    ? community
    : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
        <Link
          href="/methodology"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to how listings work
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section>
            <Badge variant="secondary">Public correction form</Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Help keep a community listing accurate.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Tell Squashie what changed and how it can be verified. Every
              submission is reviewed before anything becomes public.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <FileCheck2 className="size-5 text-primary" />
                <h2 className="mt-3 font-semibold">Specific and sourced</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Identify one field and provide the exact replacement text,
                  plus a source URL or explanation.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="mt-3 font-semibold">Reviewed, never automatic</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Public submissions remain pending until an authorized editor
                  approves or rejects them.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_70px_rgba(18,72,50,0.08)] sm:p-7">
            <h2 className="text-xl font-semibold">Correction details</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Required fields are checked again securely on the server.
            </p>
            <div className="mt-6">
              <CorrectionForm
                communities={options}
                defaultCommunity={defaultCommunity}
              />
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
