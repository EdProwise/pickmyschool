import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function setSpotlightSchool() {
  try {
    // First, find Orbit school ID
    console.log('Finding Orbit school...');
    const schoolResult = await client.execute(
      "SELECT id, name FROM schools1 WHERE name LIKE '%Orbit%' LIMIT 1"
    );
    
    if (schoolResult.rows.length === 0) {
      console.log('❌ Orbit school not found!');
      return;
    }
    
    const orbitSchoolId = schoolResult.rows[0].id;
    console.log(`✓ Found Orbit school (ID: ${orbitSchoolId})`);
    
    // Check if site_settings exists
    console.log('\nChecking site_settings...');
    const settingsResult = await client.execute(
      'SELECT id, spotlight_school_id FROM site_settings LIMIT 1'
    );
    
    if (settingsResult.rows.length === 0) {
      // Create new site_settings record
      console.log('Creating new site_settings record...');
      await client.execute({
        sql: 'INSERT INTO site_settings (spotlight_school_id, created_at, updated_at) VALUES (?, ?, ?)',
        args: [orbitSchoolId, new Date().toISOString(), new Date().toISOString()],
      });
      console.log('✓ Created site_settings with Orbit as spotlight school');
    } else {
      // Update existing site_settings
      console.log('Updating existing site_settings...');
      await client.execute({
        sql: 'UPDATE site_settings SET spotlight_school_id = ?, updated_at = ? WHERE id = ?',
        args: [orbitSchoolId, new Date().toISOString(), settingsResult.rows[0].id],
      });
      console.log('✓ Updated site_settings with Orbit as spotlight school');
    }
    
    // Verify
    const verifyResult = await client.execute(
      'SELECT spotlight_school_id FROM site_settings LIMIT 1'
    );
    console.log('\n✅ Spotlight school ID:', verifyResult.rows[0].spotlight_school_id);
    console.log('\n🔄 Refresh the homepage to see Orbit school in the spotlight section!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

setSpotlightSchool();
