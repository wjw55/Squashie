import { SiteHeader } from '@/components/site-header';

export default function LoadingModeration() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true">
        <output className="sr-only">Loading moderation workspace</output>
        <div className="h-6 w-52 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-72 animate-pulse rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
