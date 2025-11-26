import { db } from '@/db';
import { siteSettings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            spotlightSchoolId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(siteSettings).values(sampleSettings);
    
    console.log('✅ Site settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});