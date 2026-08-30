import { z } from 'zod';

export const correctionSubmissionResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    status: z.literal('pending'),
    createdAt: z.iso.datetime(),
  }),
});

export const moderationResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    communitySlug: z.string(),
    status: z.enum(['approved', 'rejected']),
  }),
});
