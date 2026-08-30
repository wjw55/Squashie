import { SiteHeader } from '@/components/site-header';

export default function LoadingCorrections() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true">
        <output className="sr-only">Loading correction form</output>
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
          <div className="h-[640px] animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
