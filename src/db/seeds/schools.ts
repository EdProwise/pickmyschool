import { db } from '@/db';
import { createSchool } from '@/db/schoolsHelper';

async function main() {
    console.log('⚠️  This seed file is deprecated.');
    console.log('⚠️  Schools are now stored across 4 tables (schools1, schools2, schools3, schools4).');
    console.log('⚠️  Use createSchool() helper function from schoolsHelper.ts instead.');
    console.log('⚠️  Skipping seed operation.');
    
    // const sampleSchools = [
    //     // ... (commented out school data)
    // ];

    // Example of how to use the new helper:
    // await createSchool({
    //     userId: 1,
    //     name: 'Sample School',
    //     city: 'Delhi',
    //     board: 'CBSE',
    //     // ... other fields
    // });
    
    console.log('✅ Schools seeder skipped (deprecated)');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});