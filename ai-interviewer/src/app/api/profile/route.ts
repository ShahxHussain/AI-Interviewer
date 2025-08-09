import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { User } from '@/types';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Validate profile data based on user role
    const currentUser = await UserService.findUserById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await UserService.updateUser(decoded.userId, {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        ...profile,
      },
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
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

    // Clean up user files
    const cleanupTasks = [];

    // Remove profile picture if exists
    if (user.profile.profilePictureUrl) {
      const profilePicPath = join(
        process.cwd(),
        'uploads',
        'profiles',
        user.profile.profilePictureUrl.split('/').pop() || ''
      );
      if (existsSync(profilePicPath)) {
        cleanupTasks.push(unlink(profilePicPath).catch(console.warn));
      }
    }

    // Remove resume if exists (for candidates)
    if (user.role === 'candidate') {
      const candidateProfile = user.profile as any;
      if (candidateProfile.resumeUrl) {
        const resumePath = join(
          process.cwd(),
          'uploads',
          'resumes',
          candidateProfile.resumeUrl.split('/').pop() || ''
        );
        if (existsSync(resumePath)) {
          cleanupTasks.push(unlink(resumePath).catch(console.warn));
        }
      }
    }

    // Execute cleanup tasks
    await Promise.allSettled(cleanupTasks);

    // Delete user from database
    const deleted = await UserService.deleteUser(decoded.userId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
