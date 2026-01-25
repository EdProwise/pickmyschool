import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  superAdminInitialized: boolean;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, superAdminInitialized: false };
}

async function initializeDefaultSuperAdmin() {
  if (cached!.superAdminInitialized) return;
  
  try {
    const { SuperAdmin } = await import('./models');
    
    const existingAdmin = await SuperAdmin.findOne({});
    
    if (!existingAdmin) {
      const defaultEmail = 'admin@pickmyschool.com';
      const defaultPassword = 'Admin@123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const now = new Date().toISOString();
      
      await SuperAdmin.create({
        email: defaultEmail,
        password: hashedPassword,
        name: 'Super Admin',
        createdAt: now,
        updatedAt: now,
      });
      
      console.log('Default Super Admin created:');
      console.log('  Email: admin@pickmyschool.com');
      console.log('  Password: Admin@123');
      console.log('  Please change the password after first login!');
    }
    
    cached!.superAdminInitialized = true;
  } catch (error) {
    console.error('Failed to initialize default super admin:', error);
  }
}

export async function connectToDatabase() {
  if (cached!.conn) {
    if (!cached!.superAdminInitialized) {
      await initializeDefaultSuperAdmin();
    }
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    await initializeDefaultSuperAdmin();
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
