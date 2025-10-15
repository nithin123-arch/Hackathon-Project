import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { VerificationPendingScreen } from './components/VerificationPendingScreen';
import { ProfileCompletionScreen } from './components/ProfileCompletionScreen';
import { FeedScreen } from './components/FeedScreen';
import { SearchUsersScreen } from './components/SearchUsersScreen';
import { CampusConnectScreen } from './components/CampusConnectScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { MyProfileScreen } from './components/MyProfileScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AppHeader } from './components/AppHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { NotificationPanel } from './components/NotificationPanel';
import { authAPI, profileAPI, getAccessToken } from './utils/api';
import { checkBackendHealth } from './utils/debug';
import { ThemeProvider } from './utils/theme';

type AuthScreen = 'login' | 'signup' | 'verification' | 'verification-pending' | 'profile-completion';
type MainTab = 'feed' | 'search' | 'campus' | 'chat' | 'profile';
type OverlayScreen = 'user-profile' | 'settings' | null;

interface User {
  id: string;
  userId?: string;
  email: string;
  fullName?: string;
  collegeName?: string;
  collegeId?: string;
  department?: string;
  year?: string;
  bio?: string;
  profilePicture?: string;
  verified?: boolean;
  verificationStatus?: string;
  profileCompleted?: boolean;
}

export default function App() {
  // Auth state
  const [authScreen, setAuthScreen] = useState<AuthScreen | null>('login');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Main app state
  const [activeTab, setActiveTab] = useState<MainTab>('feed');
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Mock notifications
  const [notifications] = useState([
    {
      id: '1',
      type: 'verification' as const,
      title: 'Verification Approved!',
      message: 'Your college ID has been verified. Welcome to EduGram!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'like' as const,
      title: 'New Like',
      message: 'Sarah Johnson liked your post about study tips',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'comment' as const,
      title: 'New Comment',
      message: 'Mike Chen commented on your post',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ]);

  // Check for existing session on mount
  useEffect(() => {
    const initializeApp = async () => {
      await checkBackendHealth();
      
      const token = getAccessToken();
      if (token) {
        try {
          const { profile } = await profileAPI.get();
          setProfile(profile);
          
          if (profile) {
            setUser({
              id: profile.id,
              userId: profile.userId,
              email: profile.email,
              fullName: profile.fullName,
              collegeName: profile.collegeName,
              collegeId: profile.collegeId,
              department: profile.department,
              year: profile.year,
              bio: profile.bio,
              profilePicture: profile.profilePicture,
              verified: profile.verified,
              verificationStatus: profile.verificationStatus,
              profileCompleted: profile.profileCompleted,
            });

            // Determine which screen to show
            if (!profile.verificationStatus) {
              setAuthScreen('verification');
            } else if (profile.verificationStatus === 'pending') {
              setAuthScreen('verification-pending');
            } else if (profile.verified && !profile.profileCompleted) {
              setAuthScreen('profile-completion');
            } else if (profile.verified && profile.profileCompleted) {
              setAuthScreen(null); // Show main app
            }
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
          authAPI.signout();
        }
      }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = async (email: string, password: string, isSignup: boolean, fullName?: string) => {
    try {
      if (isSignup && fullName) {
        await authAPI.signup(email, password, fullName);
        await authAPI.signin(email, password);
        const { profile } = await profileAPI.get();
        
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          verified: false,
        });
        setAuthScreen('verification');
      } else {
        await authAPI.signin(email, password);
        const { profile } = await profileAPI.get();
        
        setUser({
          id: profile.id,
          userId: profile.userId,
          email: profile.email,
          fullName: profile.fullName,
          collegeName: profile.collegeName,
          collegeId: profile.collegeId,
          department: profile.department,
          year: profile.year,
          bio: profile.bio,
          profilePicture: profile.profilePicture,
          verified: profile.verified,
          verificationStatus: profile.verificationStatus,
          profileCompleted: profile.profileCompleted,
        });

        if (!profile.verificationStatus) {
          setAuthScreen('verification');
        } else if (profile.verificationStatus === 'pending') {
          setAuthScreen('verification-pending');
        } else if (profile.verified && !profile.profileCompleted) {
          setAuthScreen('profile-completion');
        } else {
          setAuthScreen(null);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleVerificationSubmit = async (collegeId: string, file: File) => {
    await profileAPI.submitVerification(collegeId, file);
    setAuthScreen('verification-pending');
  };

  const handleProfileComplete = async (data: any) => {
    await profileAPI.complete(data);
    const { profile } = await profileAPI.get();
    setUser({ ...user!, ...profile });
    setAuthScreen(null);
  };

  const handleLogout = () => {
    authAPI.signout();
    setUser(null);
    setProfile(null);
    setAuthScreen('login');
    setActiveTab('feed');
    setOverlayScreen(null);
  };

  const handleNavigateToProfile = (userId: string) => {
    setSelectedUserId(userId);
    setOverlayScreen('user-profile');
  };

  const handleStartChat = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setActiveTab('chat');
    setOverlayScreen(null);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
          <div className="text-[var(--app-blue)]">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  // Show auth screens
  if (authScreen) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[var(--app-bg)]">
          {authScreen === 'login' && (
            <LoginScreen onLogin={handleLogin} />
          )}
          {authScreen === 'signup' && (
            <LoginScreen onLogin={handleLogin} />
          )}
          {authScreen === 'verification' && (
            <VerificationScreen onSubmit={handleVerificationSubmit} />
          )}
          {authScreen === 'verification-pending' && (
            <VerificationPendingScreen 
              onBack={() => setAuthScreen('verification')} 
            />
          )}
          {authScreen === 'profile-completion' && (
            <ProfileCompletionScreen onComplete={handleProfileComplete} />
          )}
        </div>
      </ThemeProvider>
    );
  }

  // Show main app
  if (!user) return null;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--app-bg)]">
        {/* Header */}
        <AppHeader
          onNotificationClick={() => setShowNotifications(true)}
          onCreatePostClick={() => setActiveTab('feed')}
          notificationCount={notifications.filter(n => !n.read).length}
        />

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
        />

        {/* Main Content */}
        {activeTab === 'feed' && !overlayScreen && (
          <FeedScreen 
            user={user}
            onNavigateToProfile={handleNavigateToProfile}
          />
        )}

        {activeTab === 'search' && !overlayScreen && (
          <div className="pb-20 pt-20">
            <SearchUsersScreen
              onBack={() => setActiveTab('feed')}
              onUserSelect={handleNavigateToProfile}
            />
          </div>
        )}

        {activeTab === 'campus' && !overlayScreen && (
          <CampusConnectScreen
            collegeName={user.collegeName || 'Your College'}
            collegeId={user.collegeId || ''}
          />
        )}

        {activeTab === 'chat' && !overlayScreen && (
          <div className="pb-20 pt-20">
            <MessagesScreen
              onBack={() => setActiveTab('feed')}
              currentUserId={user.id}
              initialConversationId={selectedConversationId || undefined}
            />
          </div>
        )}

        {activeTab === 'profile' && !overlayScreen && (
          <div className="pb-20 pt-20">
            <MyProfileScreen
              onBack={() => setActiveTab('feed')}
              onLogout={handleLogout}
              onNavigateToSettings={() => setOverlayScreen('settings')}
            />
          </div>
        )}

        {/* Overlay Screens */}
        {overlayScreen === 'user-profile' && selectedUserId && (
          <div className="fixed inset-0 bg-[var(--app-bg)] z-50 overflow-y-auto">
            <UserProfileScreen
              userId={selectedUserId}
              onBack={() => {
                setOverlayScreen(null);
                setSelectedUserId(null);
              }}
              onStartChat={handleStartChat}
            />
          </div>
        )}

        {overlayScreen === 'settings' && (
          <div className="fixed inset-0 bg-[var(--app-bg)] z-50 overflow-y-auto">
            <SettingsScreen onBack={() => setOverlayScreen(null)} />
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setOverlayScreen(null);
            setSelectedConversationId(null);
          }}
          unreadMessages={2}
        />
      </div>
    </ThemeProvider>
  );
}
