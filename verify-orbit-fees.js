require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function verify() {
  try {
    const result = await client.execute('SELECT id, fees_min, fees_max, rating, review_count, featured FROM schools4 WHERE id = 3');
    console.log('Orbit School (ID: 3) data:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

verify();
