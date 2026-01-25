import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    // Hash passwords
    const studentPassword = await bcrypt.hash('student123', 10);
    const schoolPassword = await bcrypt.hash('school123', 10);

    const testUsers = [
        // Test Student Account
        {
            role: 'student' as const,
            email: 'student@test.com',
            password: studentPassword,
            name: 'Test Student',
            phone: '+91-9876543210',
            city: 'Delhi',
            class: 'Class 10',
            savedSchools: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        // Test School Account
        {
            role: 'school' as const,
            email: 'school@test.com',
            password: schoolPassword,
            name: 'Test School',
            phone: '+91-9876543211',
            city: 'Delhi',
            schoolId: 1, // Links to first school in schools table
            savedSchools: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(users).values(testUsers);
    
    console.log('✅ Test users seeder completed successfully');
    console.log('📧 Student Login: student@test.com / student123');
    console.log('📧 School Login: school@test.com / school123');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
