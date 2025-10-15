import { useState } from 'react';
import { Sparkles, Send, Image as ImageIcon, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PostComposerProps {
  userAvatar?: string;
  userName: string;
  onPost: (content: string, polished: boolean) => Promise<void>;
}

export function PostComposer({ userAvatar, userName, onPost }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async (polished: boolean) => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    try {
      await onPost(content, polished);
      setContent('');
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] p-4 shadow-sm">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <ImageWithFallback src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-medium">{userName[0]}</span>
          )}
        </div>
        <div>
          <p className="text-[var(--app-text-primary)] font-medium">{userName}</p>
          <p className="text-[var(--app-text-tertiary)] text-sm">Share your thoughts...</p>
        </div>
      </div>

      {/* Text Area */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full min-h-[120px] resize-none border-[var(--app-border)] focus:border-[var(--app-blue)] focus:ring-[var(--app-blue)] mb-3"
        disabled={isPosting}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {/* Media Options */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[var(--app-gray-light)] rounded-lg transition-colors text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[var(--app-gray-light)] rounded-lg transition-colors text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Post Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handlePost(true)}
            disabled={!content.trim() || isPosting}
            className="bg-[var(--app-purple)] hover:bg-[var(--app-purple-dark)] text-white px-4 py-2 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Polish Post
          </Button>
          <Button
            onClick={() => handlePost(false)}
            disabled={!content.trim() || isPosting}
            className="bg-[var(--app-blue)] hover:bg-[var(--app-blue-dark)] text-white px-4 py-2 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Now
          </Button>
        </div>
      </div>
    </div>
  );
}
