import { spawn } from 'node:child_process';

import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { seedDatabase } from '../db/seed';
import { closeDatabase, getDatabase } from '../lib/server/database-core';

const database = getDatabase();
await migrate(database, { migrationsFolder: 'db/migrations' });
const result = await seedDatabase(database);
await closeDatabase();
console.log(`Prepared isolated test database with ${result.communities} communities.`);

const command =
  process.platform === 'win32'
    ? (process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe')
    : 'npm';
const args =
  process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm run dev']
    : ['run', 'dev'];
const child = spawn(command, args, {
  env: {
    ...process.env,
    DATABASE_POOL_MAX: '1',
    SQUASHIE_TEST_DATABASE: '1',
  },
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal));
}

const exitCode = await new Promise<number>((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code) => resolve(code ?? 1));
});

process.exitCode = exitCode;
