import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import type {
  CommunityContact,
  PlayerLevel,
  VerificationStatus,
} from '@/lib/domain/community';

export const communitiesTable = pgTable(
  'communities',
  {
    slug: text('slug').primaryKey(),
    displayOrder: integer('display_order').notNull(),
    name: text('name').notNull(),
    shortName: text('short_name').notNull(),
    category: text('category').notNull(),
    region: text('region').notNull(),
    neighbourhood: text('neighbourhood').notNull(),
    address: text('address').notNull(),
    suitableFor: text('suitable_for').notNull(),
    description: text('description').notNull(),
    accessType: text('access_type').notNull(),
    eligibility: text('eligibility').notNull(),
    accessSummary: text('access_summary').notNull(),
    levels: text('levels').array().$type<PlayerLevel[]>().notNull(),
    courtCount: text('court_count').notNull(),
    socialPlay: text('social_play').notNull(),
    trainingAvailable: boolean('training_available').notNull(),
    trainingIntensity: text('training_intensity').notNull(),
    trainingSummary: text('training_summary').notNull(),
    joiningFee: text('joining_fee').notNull(),
    recurringFee: text('recurring_fee').notNull(),
    courtFee: text('court_fee').notNull(),
    guestFee: text('guest_fee').notNull(),
    indicativeCost: text('indicative_cost').notNull(),
    joiningSteps: jsonb('joining_steps').$type<string[]>().notNull(),
    contacts: jsonb('contacts').$type<CommunityContact[]>().notNull(),
    lastChecked: date('last_checked', { mode: 'string' }).notNull(),
    verificationStatus: text('verification_status')
      .$type<VerificationStatus>()
      .notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('communities_display_order_unique').on(table.displayOrder),
    index('communities_region_idx').on(table.region),
    index('communities_category_idx').on(table.category),
    index('communities_access_type_idx').on(table.accessType),
    index('communities_training_available_idx').on(table.trainingAvailable),
  ],
);

export const sourceReferencesTable = pgTable('source_references', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const communitySourcesTable = pgTable(
  'community_sources',
  {
    communitySlug: text('community_slug')
      .notNull()
      .references(() => communitiesTable.slug, { onDelete: 'cascade' }),
    sourceId: integer('source_id')
      .notNull()
      .references(() => sourceReferencesTable.id, { onDelete: 'restrict' }),
    label: text('label').notNull(),
    position: integer('position').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.communitySlug, table.sourceId] }),
    index('community_sources_position_idx').on(
      table.communitySlug,
      table.position,
    ),
  ],
);

export const verificationEventsTable = pgTable(
  'verification_events',
  {
    id: serial('id').primaryKey(),
    communitySlug: text('community_slug')
      .notNull()
      .references(() => communitiesTable.slug, { onDelete: 'cascade' }),
    status: text('status').$type<VerificationStatus>().notNull(),
    checkedAt: date('checked_at', { mode: 'string' }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('verification_events_snapshot_unique').on(
      table.communitySlug,
      table.status,
      table.checkedAt,
    ),
    index('verification_events_community_idx').on(table.communitySlug),
  ],
);

export type CommunityRecord = typeof communitiesTable.$inferSelect;
