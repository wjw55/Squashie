import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { closeDatabase, getDatabase } from '../lib/server/database-core';

try {
  await migrate(getDatabase(), { migrationsFolder: 'db/migrations' });
  console.log('Database migrations are up to date.');
} finally {
  await closeDatabase();
}
