import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User as UserIcon, Mail, GraduationCap, Calendar, MapPin, LogOut, Settings, Camera } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { profileAPI, authAPI } from '../utils/api';
import { Button } from './ui/button';
import { ProfilePictureChangeModal } from './ProfilePictureChangeModal';
import { ProfilePictureEditor } from './ProfilePictureEditor';

interface MyProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export function MyProfileScreen({ onBack, onLogout, onNavigateToSettings }: MyProfileScreenProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPictureEditor, setShowPictureEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile: loadedProfile } = await profileAPI.get();
      setProfile(loadedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.signout();
    onLogout();
  };

  const handleTakePhoto = () => {
    setShowPictureModal(false);
    cameraInputRef.current?.click();
  };

  const handleChooseFromGallery = () => {
    setShowPictureModal(false);
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    setShowPictureModal(false);
    // TODO: Implement remove photo API call
    setProfile({ ...profile, profilePicture: null });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setShowPictureEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedImage = async (croppedImage: Blob) => {
    setShowPictureEditor(false);
    setUploading(true);
    
    try {
      const file = new File([croppedImage], 'profile-picture.jpg', { type: 'image/jpeg' });
      await profileAPI.complete({
        department: profile.department,
        year: profile.year,
        bio: profile.bio,
        profilePicture: file,
      });
      
      // Reload profile
      await loadProfile();
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      alert('Failed to update profile picture. Please try again.');
    } finally {
      setUploading(false);
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
          <p className="text-gray-400 mb-4">Failed to load profile</p>
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
    <>
      <div className="min-h-screen bg-[var(--app-bg)]">
        {/* Header */}
        <header className="bg-[var(--app-surface)] border-b border-[var(--app-border)] sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-[var(--app-text-secondary)] hover:text-[var(--app-cyan)] transition-colors p-2 hover:bg-[var(--app-surface-elevated)] rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-[var(--app-cyan)]">My Profile</h2>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onNavigateToSettings}
                className="bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-primary)] hover:border-[var(--app-cyan)] hover:bg-[var(--app-cyan-light)] transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 shadow-lg shadow-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Profile Header Card */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden shadow-xl mb-6">
            {/* Cover Background */}
            <div className="h-32 bg-gradient-to-br from-[var(--app-cyan)]/10 via-[var(--app-cyan)]/5 to-transparent relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--app-surface)]"></div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 -mt-16 relative">
              {/* Avatar */}
              <div className="flex items-end gap-6 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--app-cyan)] rounded-full blur-lg opacity-30"></div>
                  <button
                    onClick={() => setShowPictureModal(true)}
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[var(--app-cyan)] to-[var(--app-cyan-dark)] flex items-center justify-center overflow-hidden border-4 border-[var(--app-surface)] group cursor-pointer"
                  >
                    {uploading ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/50">
                        <div className="text-white">Uploading...</div>
                      </div>
                    ) : (
                      <>
                        {profile.profilePicture ? (
                          <ImageWithFallback
                            src={profile.profilePicture}
                            alt={profile.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-16 h-16 text-[var(--app-bg)]" />
                        )}
                        {/* Camera overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </>
                    )}
                  </button>
                  {profile.verified && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-[var(--app-success)] rounded-full border-4 border-[var(--app-surface)] shadow-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <h1 className="text-[var(--app-text-primary)] mb-1">{profile.fullName}</h1>
                  <p className="text-[var(--app-cyan)] mb-2">User ID: {profile.userId}</p>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--app-success)]/10 border border-[var(--app-success)]/30 rounded-full text-[var(--app-success)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified Student
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-[var(--app-cyan)] mb-2">Bio</h3>
                  <p className="text-[var(--app-text-secondary)] leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.email && (
                  <div className="flex items-center gap-3 bg-[var(--app-bg)] rounded-lg p-4 border border-[var(--app-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--app-cyan-light)] border border-[var(--app-cyan)]/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[var(--app-cyan)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--app-text-tertiary)]">Email</p>
                      <p className="text-[var(--app-text-primary)] truncate">{profile.email}</p>
                    </div>
                  </div>
                )}

                {profile.department && (
                  <div className="flex items-center gap-3 bg-[var(--app-bg)] rounded-lg p-4 border border-[var(--app-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--app-cyan-light)] border border-[var(--app-cyan)]/30 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-[var(--app-cyan)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--app-text-tertiary)]">Department</p>
                      <p className="text-[var(--app-text-primary)] truncate">{departmentLabels[profile.department] || profile.department}</p>
                    </div>
                  </div>
                )}

                {profile.year && (
                  <div className="flex items-center gap-3 bg-[var(--app-bg)] rounded-lg p-4 border border-[var(--app-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--app-cyan-light)] border border-[var(--app-cyan)]/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[var(--app-cyan)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--app-text-tertiary)]">Year of Study</p>
                      <p className="text-[var(--app-text-primary)] truncate">{yearLabels[profile.year] || profile.year}</p>
                    </div>
                  </div>
                )}

                {profile.collegeName && (
                  <div className="flex items-center gap-3 bg-[var(--app-bg)] rounded-lg p-4 border border-[var(--app-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--app-cyan-light)] border border-[var(--app-cyan)]/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--app-cyan)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--app-text-tertiary)]">College</p>
                      <p className="text-[var(--app-text-primary)] truncate">{profile.collegeName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-[var(--app-text-primary)] mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--app-border)]">
                <span className="text-[var(--app-text-secondary)]">Account Status</span>
                <span className="text-[var(--app-success)]">Active</span>
              </div>
              {profile.verifiedAt && (
                <div className="flex justify-between items-center pb-3 border-b border-[var(--app-border)]">
                  <span className="text-[var(--app-text-secondary)]">Verified Since</span>
                  <span className="text-[var(--app-text-primary)]">{new Date(profile.verifiedAt).toLocaleDateString()}</span>
                </div>
              )}
              {profile.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[var(--app-text-secondary)]">Member Since</span>
                  <span className="text-[var(--app-text-primary)]">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[var(--app-surface)] border border-red-500/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-red-500 mb-2">Danger Zone</h3>
            <p className="text-[var(--app-text-secondary)] mb-4">
              Logging out will end your current session. You'll need to sign in again to access your account.
            </p>
            <Button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 shadow-lg shadow-red-500/20 transition-all w-full md:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout from Account
            </Button>
          </div>
        </main>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Profile Picture Change Modal */}
      {showPictureModal && (
        <ProfilePictureChangeModal
          onTakePhoto={handleTakePhoto}
          onChooseFromGallery={handleChooseFromGallery}
          onRemovePhoto={handleRemovePhoto}
          onClose={() => setShowPictureModal(false)}
          hasPhoto={!!profile.profilePicture}
        />
      )}

      {/* Profile Picture Editor */}
      {showPictureEditor && selectedImage && (
        <ProfilePictureEditor
          imageUrl={selectedImage}
          onSave={handleSaveCroppedImage}
          onCancel={() => {
            setShowPictureEditor(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
}
