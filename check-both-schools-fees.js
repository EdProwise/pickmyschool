require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function verify() {
  try {
    // First get all schools to find Orbit and Lotus
    const allSchools = await client.execute('SELECT id, name, city FROM schools1 ORDER BY id');
    console.log('All schools in schools1:');
    allSchools.rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, City: ${row.city}`);
    });
    console.log('\n---\n');

    // Now check fees data for all schools in schools4
    const fees = await client.execute('SELECT id, fees_min, fees_max FROM schools4 ORDER BY id');
    console.log('Fees data in schools4:');
    fees.rows.forEach(row => {
      console.log(`ID: ${row.id}, fees_min: ${row.fees_min}, fees_max: ${row.fees_max}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

verify();