import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { LoginCredentials, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate email format
    if (!AuthService.isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Find user by email
    const userWithPassword = await UserService.findUserByEmail(email);
    if (!userWithPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await AuthService.comparePassword(
      password,
      userWithPassword.passwordHash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Generate token
    const authUser = UserService.toAuthUser(userWithPassword);
    const token = AuthService.generateToken(authUser);

    return NextResponse.json(
      {
        success: true,
        user: authUser,
        token,
        message: 'Login successful',
      } as AuthResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      } as AuthResponse,
      { status: 500 }
    );
  }
}
