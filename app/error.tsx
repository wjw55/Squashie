'use client';

import { useEffect } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page render failed', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-20 sm:px-6">
        <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-[0_18px_55px_rgba(23,52,40,0.08)] sm:p-10">
          <p className="eyebrow">Temporary problem</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            We could not load the community listings
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            The source-backed directory is temporarily unavailable. Try again;
            if the problem continues, please return shortly.
          </p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
