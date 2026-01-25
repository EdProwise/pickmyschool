import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

try {
  const result = await client.execute(
    'SELECT id, name, website, facebook_url, instagram_url, linkedin_url, youtube_url, contact_number, contact_phone, email, whatsapp_number FROM schools1 WHERE id = 4'
  );
  
  if (result.rows.length > 0) {
    const school = result.rows[0];
    console.log('School ID 4 (Lotus School) Data:');
    console.log('=====================================');
    console.log('Name:', school.name);
    console.log('\nWebsite & Social Media:');
    console.log('  Website:', school.website || 'NOT SET');
    console.log('  Facebook:', school.facebook_url || 'NOT SET');
    console.log('  Instagram:', school.instagram_url || 'NOT SET');
    console.log('  LinkedIn:', school.linkedin_url || 'NOT SET');
    console.log('  YouTube:', school.youtube_url || 'NOT SET');
    console.log('\nContact Info:');
    console.log('  Phone:', school.contact_phone || school.contact_number || 'NOT SET');
    console.log('  Email:', school.email || 'NOT SET');
    console.log('  WhatsApp:', school.whatsapp_number || 'NOT SET');
  } else {
    console.log('School ID 4 not found');
  }
} catch (error) {
  console.error('Error:', error);
}
