import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function updateOrbitFeatured() {
  try {
    // First, find Orbit school in schools1 table
    console.log('Searching for Orbit school...');
    const result = await client.execute(
      "SELECT id, name FROM schools1 WHERE name LIKE '%Orbit%'"
    );
    
    if (result.rows.length === 0) {
      console.log('No Orbit school found!');
      return;
    }
    
    console.log('Found schools:');
    result.rows.forEach((row: any) => {
      console.log(`  ID: ${row.id}, Name: ${row.name}`);
    });
    
    // Update featured status in schools4 table
    const schoolId = result.rows[0].id;
    console.log(`\nUpdating school ID ${schoolId} to featured in schools4...`);
    
    await client.execute({
      sql: 'UPDATE schools4 SET featured = 1, updated_at = ? WHERE id = ?',
      args: [new Date().toISOString(), schoolId],
    });
    
    console.log('✓ Successfully updated Orbit school to featured!');
    
    // Verify
    const verify = await client.execute({
      sql: 'SELECT id, featured FROM schools4 WHERE id = ?',
      args: [schoolId],
    });
    
    console.log('\nVerified:');
    console.log(verify.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

updateOrbitFeatured();