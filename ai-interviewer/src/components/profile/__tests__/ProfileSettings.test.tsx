import { render, screen } from '@testing-library/react';
import { ProfileSettings } from '../ProfileSettings';
import { User, CandidateProfile, RecruiterProfile } from '@/types';

// Mock the hooks
jest.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    loading: false,
    error: null,
    updateProfile: jest.fn(),
    uploadResume: jest.fn(),
    deleteResume: jest.fn(),
    uploadProfilePicture: jest.fn(),
    deleteProfilePicture: jest.fn(),
  }),
}));

const mockCandidateUser: User = {
  id: '1',
  email: 'candidate@test.com',
  role: 'candidate',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    skills: ['JavaScript', 'React'],
    experienceLevel: 'Mid-Level (3-5 years)',
    interviewHistory: [],
  } as CandidateProfile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRecruiterUser: User = {
  id: '2',
  email: 'recruiter@test.com',
  role: 'recruiter',
  profile: {
    firstName: 'Jane',
    lastName: 'Smith',
    companyName: 'Tech Corp',
    jobPostings: [],
    interviewReports: [],
  } as RecruiterProfile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProfileSettings', () => {
  it('renders candidate profile settings correctly', () => {
    render(<ProfileSettings user={mockCandidateUser} />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('renders recruiter profile settings correctly', () => {
    render(<ProfileSettings user={mockRecruiterUser} />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('shows profile completion card', () => {
    render(<ProfileSettings user={mockCandidateUser} />);

    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
  });
});
