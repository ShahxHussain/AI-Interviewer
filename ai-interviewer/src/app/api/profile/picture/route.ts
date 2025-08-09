import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'profiles');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('picture') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Only JPEG, PNG, and WebP images are allowed',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Image size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Remove old profile picture if it exists
    if (user.profile.profilePictureUrl) {
      const oldFilePath = join(
        process.cwd(),
        'public',
        user.profile.profilePictureUrl
      );
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath);
        } catch (error) {
          console.warn('Failed to delete old profile picture:', error);
        }
      }
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

    // Update user profile with picture URL
    const pictureUrl = `/uploads/profiles/${filename}`;
    const updatedUser = await UserService.updateUser(decoded.userId, {
      ...user,
      profile: {
        ...user.profile,
        profilePictureUrl: pictureUrl,
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
      pictureUrl,
      message: 'Profile picture uploaded successfully',
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
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
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove profile picture file if it exists
    if (user.profile.profilePictureUrl) {
      const filePath = join(
        process.cwd(),
        'public',
        user.profile.profilePictureUrl
      );
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (error) {
          console.warn('Failed to delete profile picture file:', error);
        }
      }
    }

    // Update user profile to remove picture URL
    const updatedUser = await UserService.updateUser(decoded.userId, {
      ...user,
      profile: {
        ...user.profile,
        profilePictureUrl: undefined,
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
      message: 'Profile picture removed successfully',
    });
  } catch (error) {
    console.error('Profile picture delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
