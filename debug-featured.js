
require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkFeaturedSchools() {
  try {
    console.log('Checking featured schools data...');
    const result = await client.execute('SELECT id, facilities, featured, rating FROM schools4 WHERE featured = 1 OR featured = "true"');
    console.log('Total featured schools found:', result.rows.length);
    result.rows.forEach(row => {
      console.log('Row:', JSON.stringify(row, null, 2));
      if (row.facilities) {
        try {
          console.log('Parsed facilities:', JSON.parse(row.facilities));
        } catch (e) {
          console.log('Failed to parse facilities JSON:', row.facilities);
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

checkFeaturedSchools();
