
import mongoose from 'mongoose';
import { Enquiry, School, User } from './src/lib/models';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const enquiryId = '6975ed75f9117cfcc5ef3120';
  const enquiry = await Enquiry.findById(enquiryId);
  console.log('Enquiry:', enquiry ? { _id: enquiry._id, schoolId: enquiry.schoolId, studentName: enquiry.studentName } : 'Not found');
  
  if (enquiry) {
    const school = await School.findOne({ id: enquiry.schoolId });
    console.log('School:', school ? { _id: school._id, id: school.id, name: school.name } : 'Not found');
    
    if (school) {
        const user = await User.findOne({ schoolId: school._id });
        console.log('User by _id:', user ? { _id: user._id, name: user.name, role: user.role, schoolId: user.schoolId } : 'Not found');
        
        const userByNum = await User.findOne({ schoolId: school.id });
        console.log('User by numeric id:', userByNum ? { _id: userByNum._id, name: userByNum.name, schoolId: userByNum.schoolId } : 'Not found');
    }
  }
  await mongoose.disconnect();
}

check().catch(console.error);
