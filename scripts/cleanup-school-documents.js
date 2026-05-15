#!/usr/bin/env node

/**
 * This script cleans up oversized school documents in MongoDB
 * It removes or truncates fields that are taking up too much space
 * like galleryImages and facilityImages that contain many base64 URLs
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function cleanupSchoolDocuments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const schoolsCollection = db.collection('schools');

    // Find all schools and check their size
    console.log('\nScanning schools for oversized documents...');

    const schools = await schoolsCollection.find({}).toArray();
    console.log(`Found ${schools.length} schools\n`);

    let oversizedCount = 0;
    let cleanedCount = 0;

    for (const school of schools) {
      // Estimate document size (rough approximation)
      const docSize = JSON.stringify(school).length;
      const docSizeMB = (docSize / (1024 * 1024)).toFixed(2);

      if (docSize > 14 * 1024 * 1024) { // Over 14MB (leaving margin for safety)
        oversizedCount++;
        console.log(`\n⚠️  OVERSIZED: School ID ${school.id} (${school.name})`);
        console.log(`   Size: ${docSizeMB} MB`);

        // Check field sizes
        const fieldSizes = {
          galleryImages: school.galleryImages ? JSON.stringify(school.galleryImages).length : 0,
          facilityImages: school.facilityImages ? JSON.stringify(school.facilityImages).length : 0,
          virtualTourVideos: school.virtualTourVideos ? JSON.stringify(school.virtualTourVideos).length : 0,
        };

        console.log('   Field sizes:');
        for (const [field, size] of Object.entries(fieldSizes)) {
          const sizeMB = (size / (1024 * 1024)).toFixed(2);
          if (size > 0) {
            console.log(`     - ${field}: ${sizeMB} MB (${size} bytes)`);
          }
        }

        // Truncate galleryImages to first 10 items
        if (school.galleryImages && school.galleryImages.length > 10) {
          const originalCount = school.galleryImages.length;
          const truncatedImages = school.galleryImages.slice(0, 10);

          await schoolsCollection.updateOne(
            { _id: school._id },
            { $set: { galleryImages: truncatedImages } }
          );

          console.log(`   ✓ Truncated galleryImages from ${originalCount} to 10 items`);
          cleanedCount++;
        }

        // Clear facilityImages if it's taking up too much space
        if (school.facilityImages && fieldSizes.facilityImages > 5 * 1024 * 1024) {
          await schoolsCollection.updateOne(
            { _id: school._id },
            { $set: { facilityImages: {} } }
          );

          console.log(`   ✓ Cleared facilityImages (was ${(fieldSizes.facilityImages / (1024 * 1024)).toFixed(2)} MB)`);
          cleanedCount++;
        }

        // Clear virtualTourVideos if it's too large
        if (school.virtualTourVideos && fieldSizes.virtualTourVideos > 3 * 1024 * 1024) {
          await schoolsCollection.updateOne(
            { _id: school._id },
            { $set: { virtualTourVideos: [] } }
          );

          console.log(`   ✓ Cleared virtualTourVideos (was ${(fieldSizes.virtualTourVideos / (1024 * 1024)).toFixed(2)} MB)`);
          cleanedCount++;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Found ${oversizedCount} oversized documents`);
    console.log(`Cleaned up ${cleanedCount} documents`);
    console.log(`${'='.repeat(60)}\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupSchoolDocuments();
