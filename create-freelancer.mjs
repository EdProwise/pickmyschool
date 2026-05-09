import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from 'dotenv';

config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

const FreelancerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  bankDetails: {
    accountName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    upiId: { type: String },
  },
  totalLeads: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

const Freelancer = mongoose.models.Freelancer || mongoose.model('Freelancer', FreelancerSchema);

function generateReferralCode(name) {
  const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Freelancer';
  const phone = process.argv[5] || '';
  const city = process.argv[6] || '';

  if (!email || !password) {
    console.log('Usage:');
    console.log('  node create-freelancer.mjs <email> <password> [name] [phone] [city]');
    console.log('');
    console.log('Example:');
    console.log('  node create-freelancer.mjs rahul@example.com pass123 "Rahul Sharma" 9876543210 Mumbai');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Freelancer.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      console.log(`\nFreelancer with email "${email}" already exists.`);
      console.log(`  Name: ${existing.name}`);
      console.log(`  Referral Code: ${existing.referralCode}`);
      console.log(`  Status: ${existing.status}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let referralCode = generateReferralCode(name);
    let attempts = 0;
    while (await Freelancer.findOne({ referralCode }) && attempts < 10) {
      referralCode = generateReferralCode(name);
      attempts++;
    }

    const freelancer = await Freelancer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      referralCode,
      status: 'active',
      totalLeads: 0,
      totalEarnings: 0,
    });

    console.log('\nFreelancer created successfully!');
    console.log(`  Name:          ${freelancer.name}`);
    console.log(`  Email:         ${freelancer.email}`);
    console.log(`  Phone:         ${freelancer.phone || '—'}`);
    console.log(`  City:          ${freelancer.city || '—'}`);
    console.log(`  Referral Code: ${freelancer.referralCode}`);
    console.log(`  Status:        ${freelancer.status}`);
    console.log(`  ID:            ${freelancer._id}`);
    console.log('\nLogin at: /freelancer/login');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
