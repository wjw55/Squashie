import { Badge } from '@/components/ui/badge';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#f2bc5b] shadow-[0_0_0_3px_rgba(242,188,91,0.16)]" />
          </span>
          <span className="text-lg">Squashie</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">Singapore pilot</Badge>
        </a>
        <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-6">
          <a href="/#communities" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Explore</a>
          <a href="/methodology" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How listings work</a>
        </nav>
      </div>
    </header>
  );
}
