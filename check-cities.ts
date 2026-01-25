import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Checking city data for Top Cities section...\n');

// Count schools by city
const result = await client.execute(`
  SELECT city, COUNT(*) as count 
  FROM schools1 
  GROUP BY city 
  ORDER BY count DESC
`);

console.log('Schools by city:');
result.rows.forEach((row: any) => {
  console.log(`  ${row.city}: ${row.count} schools`);
});

console.log('\nTop cities needed for homepage:');
const topCities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
for (const city of topCities) {
  const cityResult = await client.execute(`
    SELECT COUNT(*) as count FROM schools1 WHERE city = ?
  `, [city]);
  console.log(`  ${city}: ${cityResult.rows[0].count} schools`);
}

process.exit(0);
