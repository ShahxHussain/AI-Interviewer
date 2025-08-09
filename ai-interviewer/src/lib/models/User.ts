import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string; // Profile picture for all users
    companyName?: string; // Only for recruiters
    skills?: string[]; // Only for candidates
    experienceLevel?: string; // Only for candidates
    resumeUrl?: string; // Only for candidates
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['candidate', 'recruiter'],
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      profilePictureUrl: {
        type: String,
        default: '',
      },
      companyName: {
        type: String,
        trim: true,
        required: function (this: IUser) {
          return this.role === 'recruiter';
        },
      },
      skills: {
        type: [String],
        default: [],
      },
      experienceLevel: {
        type: String,
        default: '',
      },
      resumeUrl: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ role: 1 });

// Export the model
export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
