import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Deleting old schools table...\n');

await client.execute('DROP TABLE IF EXISTS schools;');

console.log('✓ Old schools table deleted successfully\n');

// Verify
const tables = await client.execute(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='schools';
`);

if (tables.rows.length === 0) {
  console.log('✅ Confirmed: schools table no longer exists');
} else {
  console.log('⚠️ Warning: schools table still exists');
}

process.exit(0);
