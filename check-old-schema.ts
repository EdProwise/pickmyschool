import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const result = await client.execute("PRAGMA table_info(schools);");
console.log('Schools table schema:');
console.log(result.rows.map((r: any) => `${r.name} (${r.type})`).join('\n'));

process.exit(0);
