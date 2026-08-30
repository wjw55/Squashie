import { DiscoveryClient } from '@/components/discovery-client';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { loadCommunities } from '@/lib/server/community-loaders';

export default async function Home() {
  const communities = await loadCommunities();

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <SiteHeader />
      <DiscoveryClient communities={communities} />
      <SiteFooter />
    </main>
  );
}
