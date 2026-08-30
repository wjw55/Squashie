import { z } from 'zod';

import {
  accessTypes,
  communityCategories,
  playerLevels,
  regions,
} from '@/lib/domain/community';

export const communityQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100).optional(),
    region: z.enum(regions).optional(),
    category: z.enum(communityCategories).optional(),
    access: z.enum(accessTypes).optional(),
    level: z.enum(playerLevels).optional(),
    training: z.boolean().optional(),
  })
  .strict();

export type CommunityQuery = z.infer<typeof communityQuerySchema>;

export const communitySlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function parseCommunitySearchParams(params: URLSearchParams) {
  const known = new Set([
    'q',
    'region',
    'category',
    'access',
    'level',
    'training',
  ]);
  const unknown = [...params.keys()].filter((key) => !known.has(key));
  if (unknown.length) {
    return communityQuerySchema.safeParse({
      [unknown[0]]: params.get(unknown[0]),
    });
  }

  const training = params.get('training');
  return communityQuerySchema.safeParse({
    q: params.get('q') || undefined,
    region: params.get('region') || undefined,
    category: params.get('category') || undefined,
    access: params.get('access') || undefined,
    level: params.get('level') || undefined,
    training:
      training === null
        ? undefined
        : training === 'true'
          ? true
          : training === 'false'
            ? false
            : training,
  });
}
