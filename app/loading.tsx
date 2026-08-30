import { SiteHeader } from '@/components/site-header';

export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        aria-busy="true"
        aria-label="Loading community listings"
      >
        <div className="h-4 w-52 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-14 max-w-2xl animate-pulse rounded-2xl bg-muted" />
        <div className="mt-10 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-72 animate-pulse rounded-3xl bg-muted" />
            <div className="h-72 animate-pulse rounded-3xl bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
