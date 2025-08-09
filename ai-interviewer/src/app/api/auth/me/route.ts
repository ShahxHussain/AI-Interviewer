import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { UserService } from '@/lib/user-service';

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Get full user profile
    const fullUser = await UserService.findUserById(user.id);
    if (!fullUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: UserService.toAuthUser(fullUser),
        profile: fullUser.profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
