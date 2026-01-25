require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateOrbitSchool() {
  try {
    console.log('Updating Orbit School with complete data...\n');
    
    const now = new Date().toISOString();
    
    // Update fees and rating in schools4
    console.log('1. Updating fees and rating in schools4...');
    await client.execute({
      sql: `UPDATE schools4 
            SET fees_min = ?, 
                fees_max = ?,
                rating = ?, 
                review_count = ?,
                updated_at = ?
            WHERE id = ?`,
      args: [80000, 120000, 4.5, 48, now, 3]
    });
    console.log('✓ Fees updated: ₹80,000 - ₹1,20,000');
    console.log('✓ Rating updated: 4.5 (48 reviews)');
    
    // Verify the changes
    console.log('\n2. Verifying changes...');
    const s4 = await client.execute('SELECT fees_min, fees_max, rating, review_count FROM schools4 WHERE id = 3');
    
    console.log('\n✅ Updated data:');
    console.log(`   Fees: ₹${s4.rows[0].fees_min?.toLocaleString('en-IN')} - ₹${s4.rows[0].fees_max?.toLocaleString('en-IN')}`);
    console.log(`   Rating: ${s4.rows[0].rating} (${s4.rows[0].review_count} reviews)`);
    
    console.log('\n🔄 Refresh the homepage to see the updated spotlight school!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

updateOrbitSchool();