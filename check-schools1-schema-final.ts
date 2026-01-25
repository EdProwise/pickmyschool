import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  try {
    const res = await client.execute('PRAGMA table_info(schools1)');
    console.log('SCHOOLS1 SCHEMA:');
    console.log(JSON.stringify(res.rows, null, 2));
    
    // Also check if there are any schools with gender or total_students set
    const sample = await client.execute('SELECT id, gender, total_students FROM schools1 WHERE gender IS NOT NULL OR total_students IS NOT NULL LIMIT 5');
    console.log('SAMPLE DATA:');
    console.log(JSON.stringify(sample.rows, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
