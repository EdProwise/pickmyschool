import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    
    const superAdmin = {
        role: 'super_admin',
        email: 'edprowise@pickmyschool.com',
        password: hashedPassword,
        name: 'EdProwise Admin',
        phone: null,
        city: null,
        class: null,
        schoolId: null,
        savedSchools: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(users).values(superAdmin);
    
    console.log('✅ Super admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});