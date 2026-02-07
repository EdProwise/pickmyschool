import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: false }, // True for the main super admin
}, { timestamps: true });

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

async function createSuperAdmin() {
  const command = process.argv[2];
  
  // If command is --reset, delete all admins and create the main super admin
  if (command === '--reset') {
    const email = process.argv[3];
    const password = process.argv[4];
    const name = process.argv[5] || 'Super Admin';

    if (!email || !password) {
      console.error('Usage: npx tsx create-super-admin.ts --reset <email> <password> [name]');
      process.exit(1);
    }

    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');

      // Delete ALL existing admins
      const deleteResult = await SuperAdmin.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing admin(s)`);

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await SuperAdmin.create({
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        isSuperAdmin: true, // Mark as the main super admin
      });

      console.log(`\nSuper admin created successfully!`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Name: ${admin.name}`);
      console.log(`  ID: ${admin._id}`);
      console.log(`  Is Super Admin: true`);

      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error);
      await mongoose.disconnect();
      process.exit(1);
    }
    return;
  }

  // Original behavior: create admin without deleting others
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Super Admin';

  if (!email || !password) {
    console.error('Usage: npx tsx create-super-admin.ts <email> <password> [name]');
    console.error('       npx tsx create-super-admin.ts --reset <email> <password> [name]  (deletes all existing admins first)');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await SuperAdmin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      console.log(`Admin with email "${email}" already exists.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await SuperAdmin.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      isSuperAdmin: false,
    });

    console.log(`Admin created successfully!`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  ID: ${admin._id}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
