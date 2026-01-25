const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  try {
    console.log('=== Checking School ID 3 Data ===\n');
    
    // Check reviews count
    const reviewsResult = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM reviews WHERE school_id = ?',
      args: [3]
    });
    console.log('✅ Actual reviews count in reviews table:', reviewsResult.rows[0].count);
    
    // Check actual reviews
    const allReviews = await client.execute({
      sql: 'SELECT id, rating, review_text FROM reviews WHERE school_id = ?',
      args: [3]
    });
    console.log('\n📝 Reviews:', JSON.stringify(allReviews.rows, null, 2));
    
    // Check schools4 data
    const school4Result = await client.execute({
      sql: 'SELECT id, fees_min, fees_max, rating, review_count FROM schools4 WHERE id = ?',
      args: [3]
    });
    console.log('\n📊 Schools4 stored values:', JSON.stringify(school4Result.rows[0], null, 2));
    
    // Check schools1 data
    const school1Result = await client.execute({
      sql: 'SELECT id, name, fees_min, fees_max FROM schools1 WHERE id = ?',
      args: [3]
    });
    console.log('\n🏫 Schools1 stored values:', JSON.stringify(school1Result.rows[0], null, 2));
    
    console.log('\n\n❌ ISSUE FOUND:');
    console.log('- Database schools4.fees_min/fees_max:', school4Result.rows[0]?.fees_min, '/', school4Result.rows[0]?.fees_max);
    console.log('- User says fees should be: 45000 / 70000');
    console.log('- Database schools4.review_count:', school4Result.rows[0]?.review_count);
    console.log('- Actual reviews in reviews table:', reviewsResult.rows[0].count);
    console.log('- Database schools4.rating:', school4Result.rows[0]?.rating);
    console.log('- User says rating should be: 5');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
})();
