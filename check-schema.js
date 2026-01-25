const { createClient } = require('@libsql/client');
const client = createClient({
  url: 'libsql://db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU1Mjc1MzgsImlkIjoiZDgyYjc3YTMtZTlmYi00NjQyLWE4N2MtODBmZjM4NmJkYjA1IiwicmlkIjoiNGMwY2UwNTYtODRiZi00OThmLWIyY2EtMjEyZDk4YzEzNDEzIn0.WIyhFanHw4Vvp1bUcXuYVVG6tAuEuYWPJnSTbDctGw8_Gxm93d6_WGlbrvOH-K2vxQjEs5XtCQsYnw29LjgxBA'
});

(async () => {
  console.log('Checking schools4 table schema...');
  const schema = await client.execute('PRAGMA table_info(schools4)');
  console.log(JSON.stringify(schema.rows, null, 2));
  
  console.log('\nChecking sample data...');
  const data = await client.execute('SELECT id, fees_min, fees_max FROM schools4 LIMIT 5');
  console.log(JSON.stringify(data.rows, null, 2));
})();
