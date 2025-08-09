import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Verify the current token (even if expired, we can still decode it)
    const payload = AuthService.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Verify user still exists
    const user = await UserService.findUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Generate new token
    const authUser = UserService.toAuthUser(user);
    const newToken = AuthService.generateToken(authUser);

    return NextResponse.json(
      {
        success: true,
        user: authUser,
        token: newToken,
        message: 'Token refreshed successfully',
      } as AuthResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      } as AuthResponse,
      { status: 500 }
    );
  }
}
