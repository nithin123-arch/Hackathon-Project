import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { postAPI, getAccessToken } from '../utils/api';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorDepartment: string;
  authorProfilePicture?: string;
  authorCollege: string;
  content: string;
  image?: string;
  likes: number;
  likedBy: string[];
  comments: number;
  shares: number;
  isCollegeCommunityOnly: boolean;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
  onAuthorClick?: (authorId: string) => void;
}

// Helper to format timestamp
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export function PostCard({ post, onUpdate, onAuthorClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    const wasLiked = liked;
    const newLikeCount = liked ? likeCount - 1 : likeCount + 1;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(newLikeCount);

    try {
      setLoading(true);
      await postAPI.like(post.id);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(likeCount);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = () => {
    if (onAuthorClick && post.authorId) {
      onAuthorClick(post.authorId);
    }
  };

  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <button 
            onClick={handleAuthorClick}
            className="relative hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] flex items-center justify-center overflow-hidden">
              {post.authorProfilePicture ? (
                <ImageWithFallback src={post.authorProfilePicture} alt={post.authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-medium">{post.authorName[0]}</span>
              )}
            </div>
          </button>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <button onClick={handleAuthorClick} className="text-left hover:opacity-80 transition-opacity">
              <h3 className="text-[var(--app-text-primary)] font-semibold">{post.authorName}</h3>
            </button>
            <p className="text-[var(--app-text-secondary)] text-sm">{post.authorDepartment}</p>
            <p className="text-[var(--app-text-tertiary)] text-xs">{formatTimestamp(post.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-[var(--app-text-primary)] leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden border border-[var(--app-border)]">
            <ImageWithFallback 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-[var(--app-border)] flex items-center gap-4">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 group transition-all"
        >
          <Heart className={`w-5 h-5 transition-colors ${
            liked 
              ? 'fill-[var(--app-error)] text-[var(--app-error)]' 
              : 'text-[var(--app-text-secondary)] group-hover:text-[var(--app-error)]'
          }`} />
          <span className={`text-sm ${liked ? 'text-[var(--app-error)]' : 'text-[var(--app-text-secondary)]'}`}>{likeCount}</span>
        </button>

        {/* Comment Button */}
        <button className="flex items-center gap-1.5 group">
          <MessageCircle className="w-5 h-5 text-[var(--app-text-secondary)] group-hover:text-[var(--app-blue)] transition-colors" />
          <span className="text-sm text-[var(--app-text-secondary)] group-hover:text-[var(--app-blue)]">{post.comments}</span>
        </button>

        {/* Share Button */}
        <button className="flex items-center gap-1.5 group">
          <Share2 className="w-5 h-5 text-[var(--app-text-secondary)] group-hover:text-[var(--app-blue)] transition-colors" />
          <span className="text-sm text-[var(--app-text-secondary)] group-hover:text-[var(--app-blue)]">{post.shares}</span>
        </button>
      </div>
    </div>
  );
}
