import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { 
  User, 
  Enquiry, 
  Chat, 
  Review, 
  Notification, 
  EmailVerificationToken, 
  PasswordResetToken,
  School,
  EnquiryFormSettings,
  Result,
  StudentAchievement,
  Alumni,
  News,
  SiteSettings
} from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { name, email, phone, city, class: userClass } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (email !== decoded.email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== decoded.userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          name,
          email,
          phone: phone || null,
          city: city || null,
          class: userClass || null,
        }
      },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ ...userWithoutPassword, id: updatedUser._id });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'student') {
      await Enquiry.deleteMany({ studentId: userId });
      await Chat.deleteMany({ userId: userId, role: 'student' });
      await Review.deleteMany({ userId: userId });
      await Notification.deleteMany({ recipientId: userId, recipientType: 'student' });
    } else if (user.role === 'school') {
      let schoolId = user.schoolId;
      
      if (!schoolId) {
        const school = await School.findOne({ userId: userId });
        if (school) schoolId = school.id;
      }

      if (schoolId) {
        await SiteSettings.updateMany(
          { spotlightSchoolId: schoolId },
          { $set: { spotlightSchoolId: null } }
        );

        await Enquiry.deleteMany({ schoolId: schoolId });
        await EnquiryFormSettings.deleteMany({ schoolId: schoolId });
        await Review.deleteMany({ schoolId: schoolId });
        await Result.deleteMany({ schoolId: schoolId });
        await StudentAchievement.deleteMany({ schoolId: schoolId });
        await Alumni.deleteMany({ schoolId: schoolId });
        await News.deleteMany({ schoolId: schoolId });
        await Chat.deleteMany({ userId: userId, role: 'school' });
        await Notification.deleteMany({ recipientId: userId, recipientType: 'school' });
        await School.deleteOne({ id: schoolId });
      }
    }
    
    await EmailVerificationToken.deleteMany({ userId: userId });
    await PasswordResetToken.deleteMany({ userId: userId });

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
