import { z } from 'zod';

export const correctionStatuses = [
  'pending',
  'approved',
  'rejected',
] as const;
export type CorrectionStatus = (typeof correctionStatuses)[number];

export const correctionFieldDefinitions = [
  { value: 'name', label: 'Community name' },
  { value: 'neighbourhood', label: 'Neighbourhood' },
  { value: 'address', label: 'Venue or address' },
  { value: 'suitableFor', label: 'Who this community suits' },
  { value: 'description', label: 'Community description' },
  { value: 'eligibility', label: 'Eligibility' },
  { value: 'accessSummary', label: 'Access summary' },
  { value: 'courtCount', label: 'Courts' },
  { value: 'socialPlay', label: 'Social play' },
  { value: 'trainingSummary', label: 'Training information' },
  { value: 'joiningFee', label: 'Joining fee' },
  { value: 'recurringFee', label: 'Recurring fee' },
  { value: 'courtFee', label: 'Court fee' },
  { value: 'guestFee', label: 'Guest fee' },
  { value: 'indicativeCost', label: 'Indicative cost' },
  { value: 'note', label: 'Before-you-go note' },
] as const;

export const correctionFields = correctionFieldDefinitions.map(
  ({ value }) => value,
) as [CorrectionField, ...CorrectionField[]];
export type CorrectionField =
  (typeof correctionFieldDefinitions)[number]['value'];

const optionalTrimmedText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

export const correctionSubmissionSchema = z
  .object({
    communitySlug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    field: z.enum(correctionFields),
    proposedValue: z.string().trim().min(2).max(4_000),
    sourceUrl: z
      .string()
      .trim()
      .max(2_048)
      .optional()
      .transform((value) => value || undefined)
      .pipe(z.url().optional()),
    explanation: optionalTrimmedText(4_000),
    contactInfo: optionalTrimmedText(320),
    website: z.string().max(0).optional().default(''),
  })
  .strict()
  .refine((value) => value.sourceUrl || value.explanation, {
    message: 'Add a supporting source URL or explanation.',
    path: ['sourceUrl'],
  });

export const moderationDecisionSchema = z
  .object({
    action: z.enum(['approved', 'rejected']),
    moderationNote: optionalTrimmedText(2_000),
  })
  .strict();

export type CorrectionSubmission = z.infer<
  typeof correctionSubmissionSchema
>;
export type ModerationDecision = z.infer<typeof moderationDecisionSchema>;

export interface CorrectionRequest {
  id: string;
  communitySlug: string;
  communityName: string;
  field: CorrectionField;
  currentValue: string;
  submittedCurrentValue: string;
  proposedValue: string;
  sourceUrl?: string;
  explanation?: string;
  contactInfo?: string;
  status: CorrectionStatus;
  moderationNote?: string;
  resolvedByEmail?: string;
  createdAt: string;
  resolvedAt?: string;
}

export function correctionFieldLabel(field: CorrectionField) {
  return (
    correctionFieldDefinitions.find((definition) => definition.value === field)
      ?.label ?? field
  );
}
