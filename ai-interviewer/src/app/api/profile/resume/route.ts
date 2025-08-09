import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'resumes');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await UserService.findUserById(decoded.userId);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Only candidates can upload resumes' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${decoded.userId}_${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user profile with resume URL
    const resumeUrl = `/uploads/resumes/${filename}`;
    const updatedUser = await UserService.updateUser(decoded.userId, {
      ...user,
      profile: {
        ...user.profile,
        resumeUrl,
      },
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resumeUrl,
      message: 'Resume uploaded successfully',
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await UserService.findUserById(decoded.userId);
    if (!user || user.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Only candidates can delete resumes' },
        { status: 403 }
      );
    }

    // Update user profile to remove resume URL
    const updatedUser = await UserService.updateUser(decoded.userId, {
      ...user,
      profile: {
        ...user.profile,
        resumeUrl: undefined,
      },
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume removed successfully',
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
