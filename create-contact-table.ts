import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function createContactSubmissionsTable() {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        school_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'new' NOT NULL,
        notes TEXT,
        assigned_to INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    console.log('✅ contact_submissions table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createContactSubmissionsTable();
