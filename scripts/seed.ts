import { seedDatabase } from '../db/seed';
import { closeDatabase, getDatabase } from '../lib/server/database-core';

try {
  const result = await seedDatabase(getDatabase());
  console.log(`Seeded ${result.communities} communities.`);
} finally {
  await closeDatabase();
}
