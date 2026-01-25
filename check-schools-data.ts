import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const result = await client.execute("SELECT COUNT(*) as count FROM schools;");
console.log('Total schools:', result.rows[0]);

const sample = await client.execute("SELECT id, name, city FROM schools LIMIT 5;");
console.log('\nSample schools:', sample.rows);

process.exit(0);
