import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerLead, Freelancer } from '@/lib/models';
import jwt from 'jsonwebtoken';

function getFreelancerFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      freelancerId: string;
      role: string;
    };
    if (decoded.role !== 'freelancer') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const leads = await FreelancerLead.find({ freelancerId: decoded.freelancerId }).sort({ createdAt: -1 });
    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { parentName, studentName, phone, email, city, grade, schoolInterested, notes } = body;

    if (!parentName || !studentName || !phone || !city || !grade) {
      return NextResponse.json(
        { error: 'Parent name, student name, phone, city and grade are required' },
        { status: 400 }
      );
    }

    const lead = new FreelancerLead({
      freelancerId: decoded.freelancerId,
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      city: city.trim(),
      grade: grade.trim(),
      schoolInterested: schoolInterested?.trim(),
      notes: notes?.trim(),
      status: 'new',
      earnings: 0,
    });

    await lead.save();

    // Increment total leads count
    await Freelancer.findByIdAndUpdate(decoded.freelancerId, { $inc: { totalLeads: 1 } });

    return NextResponse.json({ lead, message: 'Lead submitted successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
