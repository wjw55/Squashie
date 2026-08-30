import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import * as schema from '@/db/schema';

export type Database = PostgresJsDatabase<typeof schema>;

let client: Sql | undefined;
let database: Database | undefined;

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error(
      'DATABASE_URL is required. Run migrations and seed the database before starting Squashie.',
    );
  }
  return value;
}

function createClient() {
  const configuredPoolSize = Number(process.env.DATABASE_POOL_MAX ?? '5');
  const poolSize =
    Number.isInteger(configuredPoolSize) && configuredPoolSize > 0
      ? configuredPoolSize
      : 5;

  const nextClient = postgres(databaseUrl(), {
    max: poolSize,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false,
  });
  return nextClient;
}

export function isRequestScopedDatabase() {
  return (
    process.env.SQUASHIE_TEST_DATABASE === '1' ||
    process.env.DATABASE_CONNECTION_SCOPE === 'request'
  );
}

export function createDatabaseConnection() {
  const nextClient = createClient();
  return {
    database: drizzle(nextClient, { schema }),
    close: () => nextClient.end(),
  };
}

export function getDatabase(): Database {
  if (database) return database;

  const nextClient = createClient();
  client = nextClient;
  database = drizzle(nextClient, { schema });
  return database;
}

export async function closeDatabase() {
  await client?.end();
  client = undefined;
  database = undefined;
}
