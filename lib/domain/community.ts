import { z } from 'zod';

export const regions = [
  'Central',
  'East',
  'West',
  'North',
  'North-East',
  'Islandwide',
] as const;

export const communityCategories = [
  'Public programme',
  'Competitive community',
  'Alumni community',
  'Private club',
  'Social group',
  'Coaching academy',
] as const;

export const accessTypes = [
  'Public',
  'Eligibility-based',
  'Members',
  'Guests welcome',
] as const;

export const playerLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Competitive',
] as const;

export const trainingIntensities = [
  'Social',
  'Moderate',
  'Structured',
  'Competitive',
] as const;

export const verificationStatuses = [
  'Unverified',
  'Organizer verified',
  'Needs re-checking',
] as const;

export const contactKinds = [
  'website',
  'email',
  'phone',
  'form',
  'community',
] as const;

export type Region = (typeof regions)[number];
export type CommunityCategory = (typeof communityCategories)[number];
export type AccessType = (typeof accessTypes)[number];
export type PlayerLevel = (typeof playerLevels)[number];
export type TrainingIntensity = (typeof trainingIntensities)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];
export type ContactKind = (typeof contactKinds)[number];

export interface CommunityContact {
  label: string;
  href: string;
  kind: ContactKind;
}

export interface CommunitySource {
  label: string;
  url: string;
}

export interface Community {
  slug: string;
  name: string;
  shortName: string;
  category: CommunityCategory;
  region: Region;
  neighbourhood: string;
  address: string;
  suitableFor: string;
  description: string;
  accessType: AccessType;
  eligibility: string;
  accessSummary: string;
  levels: PlayerLevel[];
  courtCount: string;
  socialPlay: string;
  trainingAvailable: boolean;
  trainingIntensity: TrainingIntensity;
  trainingSummary: string;
  joiningFee: string;
  recurringFee: string;
  courtFee: string;
  guestFee: string;
  indicativeCost: string;
  joiningSteps: string[];
  contacts: CommunityContact[];
  sources: CommunitySource[];
  lastChecked: string;
  verificationStatus: VerificationStatus;
  note?: string;
}

const contactSchema = z.object({
  label: z.string().min(1),
  href: z.string().refine((value) => /^(https?:|mailto:|tel:)/.test(value), {
    message: 'Contact URL must use http, https, mailto, or tel',
  }),
  kind: z.enum(contactKinds),
});

const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

export const communitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  category: z.enum(communityCategories),
  region: z.enum(regions),
  neighbourhood: z.string().min(1),
  address: z.string().min(1),
  suitableFor: z.string().min(1),
  description: z.string().min(1),
  accessType: z.enum(accessTypes),
  eligibility: z.string().min(1),
  accessSummary: z.string().min(1),
  levels: z.array(z.enum(playerLevels)).min(1),
  courtCount: z.string().min(1),
  socialPlay: z.string().min(1),
  trainingAvailable: z.boolean(),
  trainingIntensity: z.enum(trainingIntensities),
  trainingSummary: z.string().min(1),
  joiningFee: z.string().min(1),
  recurringFee: z.string().min(1),
  courtFee: z.string().min(1),
  guestFee: z.string().min(1),
  indicativeCost: z.string().min(1),
  joiningSteps: z.array(z.string().min(1)).min(1),
  contacts: z.array(contactSchema).min(1),
  sources: z.array(sourceSchema).min(1),
  lastChecked: z.iso.date(),
  verificationStatus: z.enum(verificationStatuses),
  note: z.string().min(1).optional(),
}) satisfies z.ZodType<Community>;
