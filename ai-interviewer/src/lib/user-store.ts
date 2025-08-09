import { User, AuthUser, CandidateProfile, RecruiterProfile } from '@/types';

// In-memory user store (replace with database in production)
class UserStore {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();

  /**
   * Create a new user
   */
  async createUser(userData: {
    id: string;
    email: string;
    passwordHash: string;
    role: 'candidate' | 'recruiter';
    firstName: string;
    lastName: string;
    companyName?: string;
  }): Promise<User> {
    const now = new Date();

    let profile: CandidateProfile | RecruiterProfile;

    if (userData.role === 'candidate') {
      profile = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        skills: [],
        experienceLevel: '',
        interviewHistory: [],
      } as CandidateProfile;
    } else {
      profile = {
        companyName: userData.companyName || '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobPostings: [],
        interviewReports: [],
      } as RecruiterProfile;
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      profile,
      createdAt: now,
      updatedAt: now,
    };

    // Store user with password hash (in real app, this would be in database)
    const userWithPassword = { ...user, passwordHash: userData.passwordHash };
    this.users.set(
      userData.id,
      userWithPassword as User & { passwordHash: string }
    );
    this.emailToId.set(userData.email, userData.id);

    return user;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(
    email: string
  ): Promise<(User & { passwordHash: string }) | null> {
    const userId = this.emailToId.get(email);
    if (!userId) return null;

    const user = this.users.get(userId);
    return (user as User & { passwordHash: string }) || null;
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    // Remove password hash from returned user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user as User & {
      passwordHash: string;
    };
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);

    // Remove password hash from returned user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = updatedUser as User & {
      passwordHash: string;
    };
    return userWithoutPassword;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.emailToId.has(email);
  }

  /**
   * Convert User to AuthUser
   */
  toAuthUser(user: User): AuthUser {
    const profile = user.profile as CandidateProfile | RecruiterProfile;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName:
        user.role === 'recruiter'
          ? (profile as RecruiterProfile).companyName
          : undefined,
    };
  }
}

export const userStore = new UserStore();
