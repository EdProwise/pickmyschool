const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || 'libsql://db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function checkFeesData() {
  try {
    console.log('Checking fees data for Orbit and Lotus schools...\n');
    
    // Check schools1 for basic info
    const schools1Result = await client.execute({
      sql: `SELECT id, name, city FROM schools1 WHERE name LIKE ? OR name LIKE ?`,
      args: ['%Orbit%', '%Lotus%']
    });
    
    console.log('Schools found in schools1:');
    console.log(schools1Result.rows);
    console.log('\n');
    
    // Check schools4 for fees data
    const schools4Result = await client.execute({
      sql: `SELECT id, feesMin, feesMax FROM schools4 WHERE id IN (SELECT id FROM schools1 WHERE name LIKE ? OR name LIKE ?)`,
      args: ['%Orbit%', '%Lotus%']
    });
    
    console.log('Fees data from schools4:');
    console.log(schools4Result.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkFeesData();
