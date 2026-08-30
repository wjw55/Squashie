'use client';

import { useState } from 'react';
import { LoaderCircle, LogIn, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function AdminSignIn({ configured }: { configured: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (!configured) {
    return (
      <div className="rounded-2xl border border-[#e5c9a6] bg-[#fff7e9] p-5 text-[#704a20]">
        <ShieldAlert className="size-5" aria-hidden="true" />
        <h2 className="mt-3 font-semibold">Administrator sign-in needs setup</h2>
        <p className="mt-2 text-sm leading-6">
          Configure the documented GitHub OAuth credentials and administrator
          allowlist before using moderation in this environment.
        </p>
      </div>
    );
  }

  async function signIn() {
    setPending(true);
    setError('');
    const result = await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/admin/moderation',
      errorCallbackURL: '/admin/moderation?auth=failed',
    });
    if (result.error) {
      setError('GitHub sign-in could not be started. Try again.');
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">Administrator sign-in</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in with an allowlisted GitHub account to review corrections.
      </p>
      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      <Button className="mt-5" onClick={signIn} disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        Sign in with GitHub
      </Button>
    </div>
  );
}
