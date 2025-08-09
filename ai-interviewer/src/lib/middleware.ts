import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './auth';
import { UserService } from './user-service';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: { id: string; email: string; role: UserRole };
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');
  const token = AuthService.extractTokenFromHeader(authHeader);

  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    return { success: false, error: 'Invalid or expired token' };
  }

  // Verify user still exists
  const user = await UserService.findUserById(payload.userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (user: { role: UserRole }) => {
    return allowedRoles.includes(user.role);
  };
}

/**
 * Create a protected API route handler
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: { id: string; email: string; role: UserRole }
  ) => Promise<NextResponse>,
  options?: {
    roles?: UserRole[];
  }
) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.error || 'Authentication failed',
        },
        { status: 401 }
      );
    }

    // Check role permissions if specified
    if (options?.roles && !options.roles.includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, authResult.user);
  };
}
