require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkOrbitData() {
  try {
    console.log('Checking Orbit School data...\n');
    
    // Get all data for Orbit School
    const s1 = await client.execute('SELECT * FROM schools1 WHERE id = 3');
    const s2 = await client.execute('SELECT * FROM schools2 WHERE id = 3');
    const s3 = await client.execute('SELECT * FROM schools3 WHERE id = 3');
    const s4 = await client.execute('SELECT * FROM schools4 WHERE id = 3');
    
    console.log('=== SCHOOLS1 (Basic Info) ===');
    console.log(JSON.stringify(s1.rows[0], null, 2));
    
    console.log('\n=== SCHOOLS2 (Fees & Contact) ===');
    console.log(JSON.stringify(s2.rows[0], null, 2));
    
    console.log('\n=== SCHOOLS3 (Media & Details) ===');
    console.log(JSON.stringify(s3.rows[0], null, 2));
    
    console.log('\n=== SCHOOLS4 (Ratings & Reviews) ===');
    console.log(JSON.stringify(s4.rows[0], null, 2));
    
    // Check reviews
    console.log('\n=== REVIEWS ===');
    const reviews = await client.execute('SELECT * FROM reviews WHERE school_id = 3');
    console.log(`Total reviews: ${reviews.rows.length}`);
    if (reviews.rows.length > 0) {
      console.log('Sample review:', JSON.stringify(reviews.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

checkOrbitData();
