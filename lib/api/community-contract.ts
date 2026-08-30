import { z } from 'zod';

import {
  communitySchema,
  type Community,
} from '@/lib/domain/community';

export const communityResponseSchema = communitySchema;
export type CommunityResponse = z.infer<typeof communityResponseSchema>;

export const communityListResponseSchema = z.object({
  data: z.array(communityResponseSchema),
});

export const communityDetailResponseSchema = z.object({
  data: communityResponseSchema,
});

export const publicErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export function toCommunityResponse(
  community: Community,
): CommunityResponse {
  return communityResponseSchema.parse({ ...community });
}
