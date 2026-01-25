import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as dotenv from 'dotenv';
import * as schema from './src/db/schema';

dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const db = drizzle(client, { schema });

  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND (name='enquiries' OR name='enquiry_form_settings');");
    console.log('Tables found:', result.rows.map(row => row.name));
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    client.close();
  }
}

main();
