
const mongoose = require('mongoose');
const { Enquiry, School, User } = require('./src/lib/models');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const enquiryId = '6975ed75f9117cfcc5ef3120';
  const enquiry = await Enquiry.findById(enquiryId);
  if (!enquiry) {
    console.log('Enquiry not found');
  } else {
    console.log('Enquiry found:', {
      _id: enquiry._id,
      schoolId: enquiry.schoolId,
      studentName: enquiry.studentName
    });
    
    const school = await School.findOne({ id: enquiry.schoolId });
    if (school) {
      console.log('School found for this enquiry:', {
        _id: school._id,
        id: school.id,
        name: school.name,
        userId: school.userId
      });
      
      const user = await User.findOne({ schoolId: school._id });
      if (user) {
        console.log('User associated with this school:', {
          _id: user._id,
          role: user.role,
          name: user.name,
          schoolId: user.schoolId
        });
      } else {
        console.log('No user found associated with school _id:', school._id);
        const userByNumericId = await User.findOne({ schoolId: school.id });
        if (userByNumericId) {
            console.log('User found associated with school numeric id:', userByNumericId._id);
        }
      }
    } else {
      console.log('No school found with numeric id:', enquiry.schoolId);
    }
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
