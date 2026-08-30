import { SiteHeader } from '@/components/site-header';

export default function LoadingCommunity() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        aria-busy="true"
      >
        <output className="sr-only">Loading community details</output>
        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-[1.7rem] bg-muted" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-52 animate-pulse rounded-2xl bg-muted" />
          <div className="h-52 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
