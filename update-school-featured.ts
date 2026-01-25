import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Updating school to be featured...\n');

// Update the school to be featured
await client.execute(`
  UPDATE schools4 
  SET featured = 1 
  WHERE id = 27
`);

console.log('✓ School updated to featured');

// Verify
const result = await client.execute(`
  SELECT id, featured FROM schools4 WHERE id = 27
`);

console.log('Verification:', result.rows[0]);

process.exit(0);
