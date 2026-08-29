import { DiscoveryClient } from '@/components/discovery-client';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { communities } from '@/lib/communities';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <SiteHeader />
      <DiscoveryClient communities={communities} />
      <SiteFooter />
    </main>
  );
}
