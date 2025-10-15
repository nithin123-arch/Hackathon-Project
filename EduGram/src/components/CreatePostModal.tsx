import { useState } from 'react';
import { X, Image as ImageIcon, Users, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { postAPI } from '../utils/api';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const [postContent, setPostContent] = useState('');
  const [isCollegeCommunityOnly, setIsCollegeCommunityOnly] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim()) return;

    setLoading(true);
    try {
      await postAPI.create({
        content: postContent,
        isCollegeCommunityOnly,
        image: imageFile || undefined,
      });
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-900/20">
          <h2 className="text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Textarea */}
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="bg-[#0a0e1a] border-cyan-900/50 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 min-h-32 resize-none"
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-cyan-900/30">
              <img src={imagePreview} alt="Upload preview" className="w-full h-auto" />
              <button
                onClick={() => setImagePreview('')}
                className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-lg hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Audience Toggle */}
          <div className="bg-[#0a0e1a] border border-cyan-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isCollegeCommunityOnly ? (
                  <Users className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Globe className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Label className="text-white cursor-pointer">
                    {isCollegeCommunityOnly ? 'College Community Only' : 'Global Feed'}
                  </Label>
                  <p className="text-gray-500">
                    {isCollegeCommunityOnly 
                      ? 'Only verified students from your college can see this' 
                      : 'All users can see this post'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isCollegeCommunityOnly}
                onCheckedChange={setIsCollegeCommunityOnly}
                className="data-[state=checked]:bg-cyan-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image Upload Button */}
              <input
                type="file"
                id="postImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="postImage"
                className="flex items-center gap-2 bg-[#0a0e1a] hover:bg-gray-800 border border-cyan-900/50 text-cyan-400 px-4 py-2 rounded-lg cursor-pointer transition-all"
              >
                <ImageIcon className="w-5 h-5" />
                Add Photo
              </label>
            </div>

            {/* Post Button */}
            <Button
              onClick={handlePost}
              disabled={!postContent.trim() || loading}
              className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-[#0a0e1a] shadow-lg shadow-cyan-500/50 transition-all hover:shadow-cyan-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
