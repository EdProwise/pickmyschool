const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  try {
    console.log('=== Fixing School ID 3 Data ===\n');
    
    // Update schools4 with correct values
    await client.execute({
      sql: `UPDATE schools4 
            SET fees_min = ?, 
                fees_max = ?, 
                rating = ?, 
                review_count = ? 
            WHERE id = ?`,
      args: [45000, 70000, 5.0, 1, 3]
    });
    
    console.log('✅ Updated schools4 with:');
    console.log('   - fees_min: 45000');
    console.log('   - fees_max: 70000');
    console.log('   - rating: 5.0');
    console.log('   - review_count: 1');
    
    // Verify the update
    const verifyResult = await client.execute({
      sql: 'SELECT id, fees_min, fees_max, rating, review_count FROM schools4 WHERE id = ?',
      args: [3]
    });
    
    console.log('\n✅ Verified updated data:', JSON.stringify(verifyResult.rows[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
})();
