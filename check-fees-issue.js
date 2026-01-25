const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const client = createClient({
  url: 'libsql://db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU1Mjc1MzgsImlkIjoiZDgyYjc3YTMtZTlmYi00NjQyLWE4N2MtODBmZjM4NmJkYjA1IiwicmlkIjoiNGMwY2UwNTYtODRiZi00OThmLWIyY2EtMjEyZDk4YzEzNDEzIn0.WIyhFanHw4Vvp1bUcXuYVVG6tAuEuYWPJnSTbDctGw8_Gxm93d6_WGlbrvOH-K2vxQjEs5XtCQsYnw29LjgxBA'
});

(async () => {
  const result = await client.execute('SELECT s1.id, s1.name, s1.city, s4.feesMin, s4.feesMax FROM schools1 s1 LEFT JOIN schools4 s4 ON s1.id = s4.id LIMIT 10');
  console.log(JSON.stringify(result.rows, null, 2));
})();
