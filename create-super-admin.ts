import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

async function createSuperAdmin() {
  const rl = createInterface();
  
  console.log('\n=== Super Admin Creation Tool ===\n');
  console.log('This tool will create a new super admin account.');
  console.log('Please provide the following information:\n');

  try {
    // Get name
    let name = '';
    while (!name) {
      name = await prompt(rl, 'Full Name: ');
      if (!name) {
        console.log('Name is required.\n');
      }
    }

    // Get and validate email
    let email = '';
    while (!email) {
      email = await prompt(rl, 'Email: ');
      if (!validateEmail(email)) {
        console.log('Please enter a valid email address.\n');
        email = '';
      }
    }

    // Get and validate password
    let password = '';
    while (!password) {
      password = await prompt(rl, 'Password (min 8 chars, uppercase, lowercase, number): ');
      const validation = validatePassword(password);
      if (!validation.valid) {
        console.log(`${validation.message}\n`);
        password = '';
      }
    }

    // Confirm password
    const confirmPassword = await prompt(rl, 'Confirm Password: ');
    if (password !== confirmPassword) {
      console.log('\nPasswords do not match. Aborting.');
      rl.close();
      process.exit(1);
    }

    rl.close();

    // Connect to MongoDB
    console.log('\nConnecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Check if admin with this email already exists
    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      console.log('\nError: An admin with this email already exists.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password and create admin
    console.log('Creating super admin...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await SuperAdmin.create({
      email,
      password: hashedPassword,
      name,
    });

    console.log('\nSuper admin created successfully!');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nError creating super admin:', error);
    rl.close();
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

createSuperAdmin();