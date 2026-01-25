import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Checking for foreign key dependencies on old schools table...\n');

// Check users table
const usersCheck = await client.execute(`
  SELECT COUNT(*) as count FROM users WHERE school_id IS NOT NULL;
`);
console.log(`Users with school_id: ${usersCheck.rows[0].count}`);

// Check enquiries
const enquiriesCheck = await client.execute(`
  SELECT COUNT(*) as count FROM enquiries;
`);
console.log(`Total enquiries: ${enquiriesCheck.rows[0].count}`);

// Check reviews
const reviewsCheck = await client.execute(`
  SELECT COUNT(*) as count FROM reviews;
`);
console.log(`Total reviews: ${reviewsCheck.rows[0].count}`);

// Check results
const resultsCheck = await client.execute(`
  SELECT COUNT(*) as count FROM results;
`);
console.log(`Total results: ${resultsCheck.rows[0].count}`);

// Check alumni
const alumniCheck = await client.execute(`
  SELECT COUNT(*) as count FROM alumni;
`);
console.log(`Total alumni: ${alumniCheck.rows[0].count}`);

// Check news
const newsCheck = await client.execute(`
  SELECT COUNT(*) as count FROM news;
`);
console.log(`Total news: ${newsCheck.rows[0].count}`);

// Check site_settings
const settingsCheck = await client.execute(`
  SELECT * FROM site_settings;
`);
console.log(`\nSite settings: ${JSON.stringify(settingsCheck.rows, null, 2)}`);

// Check actual foreign key constraints on schools table
console.log('\n\nChecking foreign key constraints referencing schools table:');
const fkCheck = await client.execute(`
  SELECT sql FROM sqlite_master WHERE type='table';
`);

for (const row of fkCheck.rows) {
  const sql = row.sql as string;
  if (sql && sql.includes('REFERENCES') && sql.includes('schools') && !sql.includes('schools1')) {
    console.log('\n⚠️ Found reference to old schools table:');
    console.log(sql);
  }
}

process.exit(0);
