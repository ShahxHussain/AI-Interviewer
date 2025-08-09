import connectDB from './mongodb';
import User, { IUser } from './models/User';
import {
  User as UserType,
  AuthUser,
  CandidateProfile,
  RecruiterProfile,
} from '@/types';

export class UserService {
  /**
   * Create a new user in MongoDB
   */
  static async createUser(userData: {
    email: string;
    passwordHash: string;
    role: 'candidate' | 'recruiter';
    firstName: string;
    lastName: string;
    companyName?: string;
  }): Promise<UserType> {
    await connectDB();

    const user = new User({
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        skills: userData.role === 'candidate' ? [] : undefined,
        experienceLevel: userData.role === 'candidate' ? '' : undefined,
      },
    });

    const savedUser = await user.save();
    return this.mongoUserToAppUser(savedUser);
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(
    email: string
  ): Promise<(UserType & { passwordHash: string }) | null> {
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return null;

    const appUser = this.mongoUserToAppUser(user);
    return { ...appUser, passwordHash: user.passwordHash };
  }

  /**
   * Find user by ID
   */
  static async findUserById(id: string): Promise<UserType | null> {
    await connectDB();

    const user = await User.findById(id);
    if (!user) return null;

    return this.mongoUserToAppUser(user);
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updates: Partial<UserType>
  ): Promise<UserType | null> {
    await connectDB();

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return null;

    return this.mongoUserToAppUser(user);
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(id: string): Promise<boolean> {
    await connectDB();

    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Convert MongoDB user to app user format
   */
  private static mongoUserToAppUser(mongoUser: IUser): UserType {
    let profile: CandidateProfile | RecruiterProfile;

    if (mongoUser.role === 'candidate') {
      profile = {
        firstName: mongoUser.profile.firstName,
        lastName: mongoUser.profile.lastName,
        profilePictureUrl: mongoUser.profile.profilePictureUrl || undefined,
        resumeUrl: mongoUser.profile.resumeUrl || undefined,
        skills: mongoUser.profile.skills || [],
        experienceLevel: mongoUser.profile.experienceLevel || '',
        interviewHistory: [], // This would be populated from a separate collection
      } as CandidateProfile;
    } else {
      profile = {
        companyName: mongoUser.profile.companyName || '',
        firstName: mongoUser.profile.firstName,
        lastName: mongoUser.profile.lastName,
        profilePictureUrl: mongoUser.profile.profilePictureUrl || undefined,
        jobPostings: [], // This would be populated from a separate collection
        interviewReports: [], // This would be populated from a separate collection
      } as RecruiterProfile;
    }

    return {
      id: mongoUser._id?.toString() || mongoUser.id,
      email: mongoUser.email,
      role: mongoUser.role,
      profile,
      createdAt: mongoUser.createdAt,
      updatedAt: mongoUser.updatedAt,
    };
  }

  /**
   * Convert User to AuthUser
   */
  static toAuthUser(user: UserType): AuthUser {
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
