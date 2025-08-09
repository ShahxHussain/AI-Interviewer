import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { RegisterData, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { email, password, role, firstName, lastName, companyName } = body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Missing required fields: email, password, role, firstName, lastName',
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate recruiter has company name
    if (role === 'recruiter' && !companyName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required for recruiters',
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

    // Validate password strength
    const passwordValidation = AuthService.isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message,
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Validate role
    if (!['candidate', 'recruiter'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Role must be either "candidate" or "recruiter"',
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        } as AuthResponse,
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create user
    const user = await UserService.createUser({
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      companyName,
    });

    // Generate token
    const authUser = UserService.toAuthUser(user);
    const token = AuthService.generateToken(authUser);

    return NextResponse.json(
      {
        success: true,
        user: authUser,
        token,
        message: 'User registered successfully',
      } as AuthResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      } as AuthResponse,
      { status: 500 }
    );
  }
}
