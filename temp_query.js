const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU1Mjc1MzgsImlkIjoiZDgyYjc3YTMtZTlmYi00NjQyLWE4N2MtODBmZjM4NmJkYjA1IiwicmlkIjoiNGMwY2UwNTYtODRiZi00OThmLWIyY2EtMjEyZDk4YzEzNDEzIn0.WIyhFanHw4Vvp1bUcXuYVVG6tAuEuYWPJnSTbDctGw8_Gxm93d6_WGlbrvOH-K2vxQjEs5XtCQsYnw29LjgxBA'
});

async function main() {
  // Get school user IDs
  const schoolUsers = await client.execute("SELECT id, name FROM users WHERE role = 'school'");
  console.log('School users to delete:', schoolUsers.rows);
  
  const schoolUserIds = schoolUsers.rows.map(r => r.id);
  console.log('School user IDs:', schoolUserIds);
  
  // Get school IDs linked to these users
  const schools = await client.execute('SELECT id, user_id, name FROM schools1');
  console.log('\nSchools:', schools.rows);
  
  // Get school IDs
  const schoolIds = schools.rows.map(r => r.id);
  console.log('School IDs:', schoolIds);
}

main().catch(console.error);
