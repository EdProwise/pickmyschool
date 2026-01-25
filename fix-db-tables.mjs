import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixTables() {
  try {
    console.log('Dropping old tables with invalid foreign keys...');
    
    await client.execute('DROP TABLE IF EXISTS results');
    console.log('✓ Dropped results table');
    
    await client.execute('DROP TABLE IF EXISTS alumni');
    console.log('✓ Dropped alumni table');
    
    await client.execute('DROP TABLE IF EXISTS news');
    console.log('✓ Dropped news table');
    
    console.log('\nRecreating tables with correct foreign keys...');
    
    // Recreate results table
    await client.execute(`
      CREATE TABLE results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL REFERENCES schools1(id),
        year INTEGER NOT NULL,
        exam_type TEXT NOT NULL,
        class_level TEXT,
        pass_percentage REAL,
        total_students INTEGER,
        distinction INTEGER,
        first_class INTEGER,
        toppers TEXT,
        achievements TEXT,
        certificate_images TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✓ Created results table');
    
    // Recreate alumni table
    await client.execute(`
      CREATE TABLE alumni (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL REFERENCES schools1(id),
        name TEXT NOT NULL,
        batch_year INTEGER NOT NULL,
        class_level TEXT,
        section TEXT,
        current_position TEXT,
        company TEXT,
        achievements TEXT,
        photo_url TEXT,
        linkedin_url TEXT,
        quote TEXT,
        featured INTEGER DEFAULT 0,
        display_order INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✓ Created alumni table');
    
    // Recreate news table
    await client.execute(`
      CREATE TABLE news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_id INTEGER NOT NULL REFERENCES schools1(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        publish_date TEXT NOT NULL,
        images TEXT,
        is_published INTEGER DEFAULT 1,
        featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log('✓ Created news table');
    
    console.log('\n✅ All tables fixed successfully!');
    console.log('You can now create Results, Alumni, and News entries from the dashboard.');
    
  } catch (error) {
    console.error('Error fixing tables:', error);
  } finally {
    client.close();
  }
}

fixTables();
