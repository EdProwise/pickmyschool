import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const S = new mongoose.Schema({ email: String, password: String, name: String }, { timestamps: true });
const M = mongoose.model('SuperAdmin', S);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  await M.updateOne({ email: 'kunalshah@edprowise.com' }, { name: 'Kunal Shah' });
  const a = await M.findOne({ email: 'kunalshah@edprowise.com' });
  console.log('Verified:', JSON.stringify({ email: a?.email, name: a?.name, id: a?._id }));
  await mongoose.disconnect();
}
run();
