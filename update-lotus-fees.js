require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateFees() {
  try {
    const result = await client.execute('UPDATE schools4 SET fees_min = 50000, fees_max = 85000 WHERE id = 4');
    console.log('Updated Lotus School fees. Rows affected:', result.rowsAffected);
    
    // Verify
    const check = await client.execute('SELECT id, fees_min, fees_max FROM schools4 WHERE id = 4');
    console.log('Verification:', check.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

updateFees();
