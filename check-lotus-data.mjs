import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schools } from './src/db/schema.ts';
import { like } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const lotusSchools = await db.select().from(schools).where(like(schools.name, '%Lotus%'));

console.log('=== Lotus School Data ===');
lotusSchools.forEach(school => {
  console.log(`\nSchool: ${school.name} (ID: ${school.id})`);
  console.log(`City: ${school.city}`);
  console.log(`Logo: ${school.logoUrl || school.logo || 'NOT SET'}`);
  console.log(`Rating: ${school.rating}`);
  console.log(`Review Count: ${school.reviewCount}`);
});

console.log('\n=== Full Data ===');
console.log(JSON.stringify(lotusSchools, null, 2));
