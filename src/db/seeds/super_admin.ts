import { db } from '@/db';
import { superAdmin } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    
    const superAdminData = {
        email: 'edprowise@pickmyschool.com',
        name: 'EdProwise Admin',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(superAdmin).values(superAdminData);
    
    console.log('✅ Super Admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});