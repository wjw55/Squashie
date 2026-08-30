'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, ExternalLink, LoaderCircle, LogOut, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import {
  correctionFieldLabel,
  type CorrectionRequest,
} from '@/lib/domain/correction';

const subscribeToHydration = () => () => {};

export function ModerationDashboard({
  initialRequests,
  administrator,
}: {
  initialRequests: CorrectionRequest[];
  administrator: { name: string; email: string };
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState('');
  const [message, setMessage] = useState('');
  const isInteractive = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  async function decide(id: string, action: 'approved' | 'rejected') {
    setPendingId(id);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/corrections/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          moderationNote: notes[id] ?? '',
        }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        setMessage(
          body.error?.message ?? 'The moderation decision could not be saved.',
        );
        return;
      }
      setRequests((current) => current.filter((request) => request.id !== id));
      setMessage(
        action === 'approved'
          ? 'Correction approved and the public listing was updated.'
          : 'Correction rejected. The public listing was not changed.',
      );
    } catch {
      setMessage('The moderation decision could not be saved.');
    } finally {
      setPendingId('');
    }
  }

  async function signOut() {
    await authClient.signOut();
    window.location.assign('/admin/moderation');
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">{administrator.name}</p>
          <p className="text-xs text-muted-foreground">{administrator.email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={signOut}
          disabled={!isInteractive}
        >
          <LogOut /> Sign out
        </Button>
      </div>

      {message && (
        <output className="mt-5 block rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          {message}
        </output>
      )}

      {requests.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <Check className="mx-auto size-7 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">No pending corrections</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New public submissions will appear here for review.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {requests.map((request) => (
            <article key={request.id} className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{correctionFieldLabel(request.field)}</p>
                  <h2 className="mt-2 text-xl font-semibold">{request.communityName}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(request.createdAt).toLocaleString('en-SG')}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff1d9] px-3 py-1 text-xs font-semibold text-[#875017]">Pending</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/35 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current public information</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{request.currentValue}</p>
                  {request.currentValue !== request.submittedCurrentValue && (
                    <p className="mt-3 text-xs leading-5 text-[#875017]">The public value changed after this request was submitted. Submitted snapshot: {request.submittedCurrentValue}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-[#b8d8c0] bg-[#eef8ef] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Proposed information</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{request.proposedValue}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Supporting source</dt>
                  <dd className="mt-1 leading-6 text-muted-foreground">
                    {request.sourceUrl ? (
                      <a href={request.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        Open submitted source <ExternalLink className="size-3.5" />
                      </a>
                    ) : 'No URL supplied'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Submitter contact</dt>
                  <dd className="mt-1 break-words leading-6 text-muted-foreground">{request.contactInfo ?? 'Not supplied'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold">Explanation</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-6 text-muted-foreground">{request.explanation ?? 'No additional explanation supplied'}</dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-2">
                <label htmlFor={`note-${request.id}`} className="text-sm font-semibold">Moderation note <span className="font-normal text-muted-foreground">(optional, internal)</span></label>
                <textarea
                  id={`note-${request.id}`}
                  maxLength={2_000}
                  rows={3}
                  value={notes[request.id] ?? ''}
                  onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" onClick={() => decide(request.id, 'approved')} disabled={!isInteractive || pendingId === request.id}>
                  {pendingId === request.id ? <LoaderCircle className="animate-spin" /> : <Check />}
                  Approve and publish
                </Button>
                <Button type="button" variant="destructive" onClick={() => decide(request.id, 'rejected')} disabled={!isInteractive || pendingId === request.id}>
                  <X /> Reject
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
