import { db } from './src/db/index.js';

async function checkTable() {
  try {
    // Check results table structure
    const tableInfo = await db.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='results'`);
    console.log('Results table structure:');
    console.log(JSON.stringify(tableInfo.rows, null, 2));
    
    // Check for foreign key info
    const fkInfo = await db.execute(`PRAGMA foreign_key_list(results)`);
    console.log('\nForeign keys for results table:');
    console.log(JSON.stringify(fkInfo.rows, null, 2));
    
    // Check if schools1 table exists
    const schools1 = await db.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='schools1'`);
    console.log('\nSchools1 table exists:',  schools1.rows.length > 0);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTable();
