import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
console.log('Existing tables:', result.rows);
process.exit(0);
