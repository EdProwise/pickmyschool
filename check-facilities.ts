
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

async function checkFacilities() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const result = await client.execute('SELECT s1.id, s1.name, s2.has_library, s2.has_computer_lab, s3.has_transport, s4.facilities FROM schools1 s1 LEFT JOIN schools2 s2 ON s1.id = s2.id LEFT JOIN schools3 s3 ON s1.id = s3.id LEFT JOIN schools4 s4 ON s1.id = s4.id LIMIT 10');
  console.log(JSON.stringify(result.rows, null, 2));
}

checkFacilities();
