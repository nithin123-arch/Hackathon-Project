import { useState, useEffect } from 'react';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { postAPI } from '../utils/api';

interface User {
  id: string;
  fullName: string;
  profilePicture?: string;
  department?: string;
  year?: string;
}

interface FeedScreenProps {
  user: User;
  onNavigateToProfile: (userId: string) => void;
}

export function FeedScreen({ user, onNavigateToProfile }: FeedScreenProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { posts: loadedPosts } = await postAPI.getFeed();
      setPosts(loadedPosts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async (content: string, polished: boolean) => {
    try {
      // If polished, you could add AI enhancement here
      const finalContent = polished ? `✨ ${content}` : content;
      
      await postAPI.create({
        content: finalContent,
        isCollegeCommunityOnly: false,
      });
      
      // Reload posts
      await loadPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  return (
    <div className="pb-20 pt-20">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {/* Post Composer */}
        <PostComposer
          userAvatar={user.profilePicture}
          userName={user.fullName}
          onPost={handleCreatePost}
        />

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-[var(--app-blue)] hover:text-[var(--app-blue-dark)] text-sm font-medium disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[var(--app-text-secondary)]">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] p-8 text-center">
            <p className="text-[var(--app-text-secondary)] mb-2">No posts yet</p>
            <p className="text-[var(--app-text-tertiary)] text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={loadPosts}
                onAuthorClick={onNavigateToProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
