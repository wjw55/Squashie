import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { AdminSignIn } from '@/components/admin-sign-in';
import { ModerationDashboard } from '@/components/moderation-dashboard';
import { SiteHeader } from '@/components/site-header';
import {
  AdminAuthConfigurationError,
  AdminForbiddenError,
  getAdminIdentity,
  isAdminAuthConfigured,
} from '@/lib/server/admin-auth';
import { withCorrectionService } from '@/lib/server/correction-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Correction moderation',
  robots: { index: false, follow: false },
};

export default async function ModerationPage() {
  let identity = null;
  let forbidden = false;
  try {
    identity = await getAdminIdentity(await headers());
  } catch (error) {
    if (error instanceof AdminForbiddenError) forbidden = true;
    else if (!(error instanceof AdminAuthConfigurationError)) throw error;
  }

  const requests = identity
    ? await withCorrectionService((service) => service.listPending())
    : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Back to public listings
        </Link>
        <section className="mt-7 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Protected editorial workspace
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Correction moderation</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Review submitted evidence, compare current and proposed information, and record an auditable decision.</p>
        </section>

        <div className="mt-8">
          {forbidden ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/8 p-5">
              <h2 className="font-semibold text-destructive">Access denied</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">This signed-in account is not on Squashie’s administrator allowlist.</p>
            </div>
          ) : identity ? (
            <ModerationDashboard initialRequests={requests} administrator={{ name: identity.name, email: identity.email }} />
          ) : (
            <AdminSignIn configured={isAdminAuthConfigured()} />
          )}
        </div>
      </div>
    </main>
  );
}
