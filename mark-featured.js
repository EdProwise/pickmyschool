require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function markTopSchoolsFeatured() {
  try {
    // First check if there are ANY schools
    console.log('Checking for schools...');
    const allSchools = await client.execute(`
      SELECT s1.id, s1.name, s4.rating, s4.review_count, s4.featured
      FROM schools1 s1
      INNER JOIN schools4 s4 ON s1.id = s4.id
      LIMIT 15
    `);
    
    console.log(`\nFound ${allSchools.rows.length} total schools:`);
    allSchools.rows.forEach((row) => {
      console.log(`  - ${row.name} (Rating: ${row.rating || 0}, Reviews: ${row.review_count || 0}, Featured: ${row.featured})`);
    });
    
    // Get top schools by rating (or just first 10 if no ratings)
    console.log('\n\nMarking schools as featured...');
    const schoolsToFeature = allSchools.rows.slice(0, 8); // Take first 8
    
    if (schoolsToFeature.length === 0) {
      console.log('No schools found!');
      return;
    }
    
    // Mark them as featured
    for (const row of schoolsToFeature) {
      await client.execute({
        sql: 'UPDATE schools4 SET featured = 1, updated_at = ? WHERE id = ?',
        args: [new Date().toISOString(), row.id],
      });
      console.log(`  ✓ Marked ${row.name} as featured`);
    }
    
    console.log('\n✅ Successfully marked schools as featured!');
    console.log('\n🔄 Refresh the homepage to see the featured schools.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

markTopSchoolsFeatured();