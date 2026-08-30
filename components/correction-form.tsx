'use client';

import { useState, type SyntheticEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { correctionFieldDefinitions } from '@/lib/domain/correction';

interface CommunityOption {
  slug: string;
  name: string;
}

interface CorrectionFormProps {
  communities: CommunityOption[];
  defaultCommunity?: string;
}

export function CorrectionForm({
  communities,
  defaultCommunity,
}: CorrectionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState('');

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSubmittedId('');

    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => {
      const entry = data.get(name);
      return typeof entry === 'string' ? entry : '';
    };
    const sourceUrl = value('sourceUrl').trim();
    const explanation = value('explanation').trim();
    if (!sourceUrl && !explanation) {
      setError('Add a supporting source URL or explanation.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: value('communitySlug'),
          field: value('field'),
          proposedValue: value('proposedValue'),
          sourceUrl,
          explanation,
          contactInfo: value('contactInfo'),
          website: value('website'),
        }),
      });
      const body = (await response.json()) as {
        data?: { id: string };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(
          body.error?.message ??
            'The correction could not be submitted. Try again.',
        );
        return;
      }
      setSubmittedId(body.data.id);
      form.reset();
    } catch {
      setError('The correction could not be submitted. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div className="rounded-2xl border border-[#b8d8c0] bg-[#eef8ef] p-6">
        <output className="sr-only">Correction received</output>
        <CheckCircle2 className="size-7 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">
          Correction received
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          It is pending editorial review and will not change the public listing
          unless an administrator approves it.
        </p>
        <p className="mt-3 break-all text-xs text-muted-foreground">
          Reference: {submittedId}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => setSubmittedId('')}
        >
          Submit another correction
        </Button>
      </div>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={submit}>
      <div className="grid gap-2">
        <label htmlFor="communitySlug" className="text-sm font-semibold">
          Affected community
        </label>
        <NativeSelect
          id="communitySlug"
          name="communitySlug"
          required
          defaultValue={defaultCommunity ?? ''}
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Select a community
          </NativeSelectOption>
          {communities.map((community) => (
            <NativeSelectOption
              key={community.slug}
              value={community.slug}
            >
              {community.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-2">
        <label htmlFor="field" className="text-sm font-semibold">
          Information to correct
        </label>
        <NativeSelect
          id="field"
          name="field"
          required
          defaultValue=""
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Select the affected information
          </NativeSelectOption>
          {correctionFieldDefinitions.map((field) => (
            <NativeSelectOption key={field.value} value={field.value}>
              {field.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-2">
        <label htmlFor="proposedValue" className="text-sm font-semibold">
          Proposed correction
        </label>
        <textarea
          id="proposedValue"
          name="proposedValue"
          required
          minLength={2}
          maxLength={4_000}
          rows={5}
          className="min-h-32 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Write the exact information that should appear on the listing."
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="sourceUrl" className="text-sm font-semibold">
          Supporting source URL
        </label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          maxLength={2_048}
          placeholder="https://official-source.example/..."
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Use an official club, programme, organizer, or association page where
          possible.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="explanation" className="text-sm font-semibold">
          Supporting explanation
        </label>
        <textarea
          id="explanation"
          name="explanation"
          maxLength={4_000}
          rows={4}
          className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Explain how you know the proposed information is current."
        />
        <p className="text-xs leading-5 text-muted-foreground">
          A source URL or explanation is required.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="contactInfo" className="text-sm font-semibold">
          Contact information <span className="font-normal">(optional)</span>
        </label>
        <Input
          id="contactInfo"
          name="contactInfo"
          maxLength={320}
          autoComplete="email"
          placeholder="Email or another way to follow up"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Used only if the editor needs clarification. It is never published.
        </p>
      </div>

      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <p
          className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="animate-spin" /> Submitting…
          </>
        ) : (
          'Submit for editorial review'
        )}
      </Button>
    </form>
  );
}
