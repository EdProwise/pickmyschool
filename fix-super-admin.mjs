import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool';

async function fixSuperAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const superAdminsCollection = db.collection('superadmins');

    // Find current super admin with old email
    const currentAdmin = await superAdminsCollection.findOne({ 
      email: 'kunalshah1165@edprowise.com' 
    });
    
    console.log('Current admin with old email:', currentAdmin);

    // Also check for new email in case already updated
    const newEmailAdmin = await superAdminsCollection.findOne({ 
      email: 'kunalshah@edprowise.com' 
    });
    console.log('Admin with new email:', newEmailAdmin);

    // List all super admins
    const allAdmins = await superAdminsCollection.find({}).toArray();
    console.log('\nAll super admins:');
    allAdmins.forEach(admin => {
      console.log(`- ${admin.email} (isSuperAdmin: ${admin.isSuperAdmin}, name: ${admin.name})`);
    });

    if (currentAdmin) {
      // Update the email and ensure isSuperAdmin is true
      const result = await superAdminsCollection.updateOne(
        { email: 'kunalshah1165@edprowise.com' },
        { 
          $set: { 
            email: 'kunalshah@edprowise.com',
            isSuperAdmin: true 
          } 
        }
      );
      console.log('\nUpdate result:', result);
      
      // Verify the update
      const updatedAdmin = await superAdminsCollection.findOne({ 
        email: 'kunalshah@edprowise.com' 
      });
      console.log('\nUpdated admin:', updatedAdmin);
    } else if (newEmailAdmin) {
      // If the new email already exists, just ensure isSuperAdmin is true
      const result = await superAdminsCollection.updateOne(
        { email: 'kunalshah@edprowise.com' },
        { $set: { isSuperAdmin: true } }
      );
      console.log('\nUpdated isSuperAdmin flag:', result);
      
      const updatedAdmin = await superAdminsCollection.findOne({ 
        email: 'kunalshah@edprowise.com' 
      });
      console.log('\nUpdated admin:', updatedAdmin);
    } else {
      console.log('\nNo admin found with either email. Listing all admins:');
      allAdmins.forEach(admin => {
        console.log(`- ID: ${admin._id}, Email: ${admin.email}, isSuperAdmin: ${admin.isSuperAdmin}`);
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSuperAdmin();
