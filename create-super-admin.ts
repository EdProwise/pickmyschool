import 'dotenv/config';
import { db } from './src/db/index.js';
import { superAdmin } from './src/db/schema.js';
import bcrypt from 'bcrypt';

async function createSuperAdmin() {
  try {
    console.log('Creating super admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const now = new Date();
    
    // Insert super admin
    const result = await db.insert(superAdmin).values({
      email: 'kunalshah@edprowise.com',
      password: hashedPassword,
      name: 'Kunal Shah',
      createdAt: now,
      updatedAt: now
    }).returning();
    
    console.log('Super admin created successfully:', result);
    console.log('\nLogin credentials:');
    console.log('Email: kunalshah@edprowise.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();