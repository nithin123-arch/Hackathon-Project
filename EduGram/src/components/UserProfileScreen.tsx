import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, User as UserIcon, Mail, GraduationCap, Calendar, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { userAPI, messageAPI } from '../utils/api';
import { Button } from './ui/button';

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  department?: string;
  year?: string;
  collegeName?: string;
  profilePicture?: string;
  bio?: string;
  verified?: boolean;
}

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onStartChat: (conversationId: string) => void;
}

export function UserProfileScreen({ userId, onBack, onStartChat }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile: loadedProfile } = await userAPI.getProfile(userId);
      setProfile(loadedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!profile || startingChat) return;

    try {
      setStartingChat(true);
      const { conversationId } = await messageAPI.startConversation(profile.id);
      onStartChat(conversationId);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-cyan-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">User not found</p>
          <Button onClick={onBack} className="bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-[#0a0e1a]">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const yearLabels: Record<string, string> = {
    '1': 'First Year',
    '2': 'Second Year',
    '3': 'Third Year',
    '4': 'Fourth Year',
    'graduate': 'Graduate Student',
  };

  const departmentLabels: Record<string, string> = {
    'computer-science': 'Computer Science',
    'engineering': 'Engineering',
    'business': 'Business Administration',
    'mathematics': 'Mathematics',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'literature': 'Literature',
    'arts': 'Arts',
    'other': 'Other',
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="bg-[#0d1425] border-b border-cyan-900/30 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-cyan-400">User Profile</h2>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded-2xl overflow-hidden shadow-xl mb-6">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-br from-cyan-900/20 via-cyan-800/10 to-[#1a1f2e] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1f2e]"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 -mt-16 relative">
            {/* Avatar */}
            <div className="flex items-end gap-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-lg opacity-30"></div>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center overflow-hidden border-4 border-[#1a1f2e]">
                  {profile.profilePicture ? (
                    <ImageWithFallback
                      src={profile.profilePicture}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-[#0a0e1a]" />
                  )}
                </div>
                {profile.verified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-[#1a1f2e] shadow-lg shadow-green-400/50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-white mb-1">{profile.fullName}</h1>
                <p className="text-cyan-400 mb-2">User ID: {profile.userId}</p>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-400/10 border border-green-400/30 rounded-full text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified Student
                  </span>
                )}
              </div>

              <Button
                onClick={handleStartChat}
                disabled={startingChat}
                className="bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-[#0a0e1a] shadow-lg shadow-cyan-500/50 transition-all disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {startingChat ? 'Starting...' : 'Message'}
              </Button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.department && (
                <div className="flex items-center gap-3 bg-[#0a0e1a] rounded-lg p-4 border border-cyan-900/20">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500">Department</p>
                    <p className="text-white truncate">{departmentLabels[profile.department] || profile.department}</p>
                  </div>
                </div>
              )}

              {profile.year && (
                <div className="flex items-center gap-3 bg-[#0a0e1a] rounded-lg p-4 border border-cyan-900/20">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500">Year of Study</p>
                    <p className="text-white truncate">{yearLabels[profile.year] || profile.year}</p>
                  </div>
                </div>
              )}

              {profile.collegeName && (
                <div className="flex items-center gap-3 bg-[#0a0e1a] rounded-lg p-4 border border-cyan-900/20 md:col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500">College</p>
                    <p className="text-white truncate">{profile.collegeName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded-2xl p-6">
          <h3 className="text-white mb-4">About</h3>
          <p className="text-gray-400">
            Connect with {profile.fullName.split(' ')[0]} to collaborate, study together, or just chat about college life!
          </p>
        </div>
      </main>
    </div>
  );
}
