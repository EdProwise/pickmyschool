import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Force deleting old schools table by disabling foreign keys...\n');

// Disable foreign key enforcement
await client.execute('PRAGMA foreign_keys = OFF;');
console.log('✓ Foreign keys disabled');

// Drop the old schools table
await client.execute('DROP TABLE IF EXISTS schools;');
console.log('✓ Old schools table dropped');

// Re-enable foreign keys
await client.execute('PRAGMA foreign_keys = ON;');
console.log('✓ Foreign keys re-enabled');

// Verify deletion
const checkTable = await client.execute(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='schools';
`);

if (checkTable.rows.length === 0) {
  console.log('\n✅ SUCCESS: Old schools table has been deleted!');
} else {
  console.log('\n⚠️ WARNING: schools table still exists');
}

// Show remaining tables
const allTables = await client.execute(`
  SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'schools%' ORDER BY name;
`);
console.log('\nRemaining school tables:');
allTables.rows.forEach((row) => {
  console.log(`  - ${row.name}`);
});

process.exit(0);
