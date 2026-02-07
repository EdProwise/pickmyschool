import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  adminId: string;
  role: string;
}

function verifySuperAdminToken(request: NextRequest): { valid: boolean; adminId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, adminId: decoded.adminId };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * DELETE - Delete an admin (only accessible by super admin with isSuperAdmin: true)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = verifySuperAdminToken(request);
    
    if (!authResult.valid) {
      return NextResponse.json({ 
        error: authResult.error || 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // Check if the requesting admin is the main super admin
    const requestingAdmin = await SuperAdmin.findById(authResult.adminId);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin) {
      return NextResponse.json({ 
        error: 'Only the main Super Admin can delete admins',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Prevent deleting the main super admin
    const adminToDelete = await SuperAdmin.findById(id);
    if (!adminToDelete) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (adminToDelete.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete the main Super Admin', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (id === authResult.adminId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account', code: 'SELF_DELETE' },
        { status: 400 }
      );
    }

    await SuperAdmin.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Admin deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
