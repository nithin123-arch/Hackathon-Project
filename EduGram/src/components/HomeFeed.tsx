import { useState, useEffect } from 'react';
import { LogIn, Bell, MessageSquare, Plus, Building2, Search } from 'lucide-react';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { postAPI, notificationAPI, userAPI } from '../utils/api';

interface User {
  id: string;
  fullName?: string;
  profilePicture?: string;
  collegeName?: string;
}

interface HomeFeedProps {
  user: User;
  onNavigateToNotifications: () => void;
  onNavigateToMessages: () => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: (userId: string) => void;
  onNavigateToMyProfile: () => void;
  showCollegeCommunityOnly: boolean;
  onToggleCollegeCommunity: () => void;
}

export function HomeFeed({ 
  user, 
  onNavigateToNotifications, 
  onNavigateToMessages,
  onNavigateToSearch,
  onNavigateToProfile,
  onNavigateToMyProfile,
  showCollegeCommunityOnly,
  onToggleCollegeCommunity,
}: HomeFeedProps) {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount] = useState(2);

  // Load posts
  useEffect(() => {
    loadPosts();
    loadNotificationCount();
  }, [showCollegeCommunityOnly]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { posts: loadedPosts } = await postAPI.getFeed(showCollegeCommunityOnly);
      // Filter out null/undefined posts
      setPosts((loadedPosts || []).filter((p: any) => p && p.id));
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const { notifications } = await notificationAPI.getAll();
      // Filter out null/undefined notifications
      const validNotifications = (notifications || []).filter((n: any) => n && n.id);
      const unreadCount = validNotifications.filter((n: any) => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Failed to load notification count:', error);
      setNotificationCount(0);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    loadPosts();
  };

  const handleAuthorClick = async (authorId: string) => {
    try {
      // Get user profile by internal ID
      const { profile } = await userAPI.getProfileById(authorId);
      if (profile && profile.userId) {
        onNavigateToProfile(profile.userId);
      }
    } catch (error) {
      console.error('Failed to load author profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="bg-[#0d1425] border-b border-cyan-900/30 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-50"></div>
              <div className="relative bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full p-2">
                <LogIn className="w-5 h-5 text-[#0a0e1a]" />
              </div>
            </div>
            <h2 className="text-white">EduGram</h2>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            {/* Search Users */}
            <button
              onClick={onNavigateToSearch}
              className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              title="Search Users"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* College Community Toggle */}
            <button
              onClick={onToggleCollegeCommunity}
              className={`relative p-2 rounded-lg transition-all ${
                showCollegeCommunityOnly 
                  ? 'bg-cyan-400/20 text-cyan-400' 
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
              title="College Community"
            >
              {showCollegeCommunityOnly && (
                <div className="absolute inset-0 bg-cyan-400 rounded-lg blur-md opacity-30"></div>
              )}
              <Building2 className="w-6 h-6 relative" />
            </button>

            {/* Messages */}
            <button
              onClick={onNavigateToMessages}
              className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white">{messageCount}</span>
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={onNavigateToNotifications}
              className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white">{notificationCount}</span>
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={onNavigateToMyProfile}
              className="relative hover:opacity-80 transition-opacity"
              title="My Profile"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center overflow-hidden border-2 border-cyan-400/40">
                {user.profilePicture ? (
                  <ImageWithFallback src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#0a0e1a]">{user.fullName?.[0] || 'U'}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0d1425] shadow-lg shadow-green-400/50"></div>
            </button>
          </div>
        </div>

        {/* Filter Indicator */}
        {showCollegeCommunityOnly && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">Showing posts from your college community only</span>
            </div>
          </div>
        )}
      </header>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-cyan-400">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} onAuthorClick={handleAuthorClick} />
          ))
        )}
      </main>

      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-[#0a0e1a] w-16 h-16 rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-lg opacity-50"></div>
        <Plus className="w-8 h-8 relative" />
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} onPostCreated={handlePostCreated} />
      )}
    </div>
  );
}
