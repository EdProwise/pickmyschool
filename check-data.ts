import { db } from './src/db';
import { schools1, schools4 } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    const s1 = await db.select().from(schools1).limit(3);
    console.log('Schools1 samples:');
    s1.forEach(s => {
      console.log(`ID: ${s.id}, Name: ${s.name}, City: ${s.city}, LogoUrl: ${s.logoUrl}`);
    });

    const s4 = await db.select().from(schools4).limit(3);
    console.log('\nSchools4 samples:');
    s4.forEach(s => {
      console.log(`ID: ${s.id}, Logo: ${s.logo}, Rating: ${s.rating}, ReviewCount: ${s.reviewCount}`);
    });
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkData();
