require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSchool3() {
  try {
    console.log('=== Checking School ID 3 (Orbit School) ===\n');
    
    // Get all data from schools4 (ratings & fees)
    const s4 = await client.execute('SELECT * FROM schools4 WHERE id = 3');
    console.log('SCHOOLS4 Data:');
    console.log(JSON.stringify(s4.rows[0], null, 2));
    
    // Get actual reviews count from reviews table
    console.log('\n=== REVIEWS TABLE ===');
    const reviews = await client.execute('SELECT * FROM reviews WHERE school_id = 3');
    console.log(`Total reviews in reviews table: ${reviews.rows.length}`);
    
    if (reviews.rows.length > 0) {
      console.log('\nAll reviews:');
      reviews.rows.forEach((review, i) => {
        console.log(`\nReview ${i + 1}:`);
        console.log(`  Rating: ${review.rating}`);
        console.log(`  Student: ${review.student_name}`);
        console.log(`  Date: ${review.created_at}`);
      });
      
      // Calculate average rating
      const avgRating = reviews.rows.reduce((sum, r) => sum + r.rating, 0) / reviews.rows.length;
      console.log(`\n✅ Calculated Average Rating: ${avgRating.toFixed(1)}`);
      console.log(`✅ Calculated Review Count: ${reviews.rows.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

checkSchool3();
