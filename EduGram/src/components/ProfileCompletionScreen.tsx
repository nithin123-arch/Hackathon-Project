import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { profileAPI } from '../utils/api';

interface ProfileCompletionScreenProps {
  onComplete: (data: any) => void;
}

export function ProfileCompletionScreen({ onComplete }: ProfileCompletionScreenProps) {
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileAPI.complete({
        department: formData.department,
        year: formData.year,
        bio: formData.bio,
        profilePicture: profilePictureFile || undefined,
      });
      onComplete({ ...formData, profilePicture });
    } catch (error) {
      console.error('Profile completion failed:', error);
      alert('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-2xl flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-[var(--app-text-primary)] text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-[var(--app-text-secondary)]">Add some details to personalize your account</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--app-blue)] bg-[var(--app-gray-light)] shadow-xl">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-[var(--app-text-tertiary)]" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePic"
                  className="inline-flex items-center gap-2 bg-[var(--app-blue-light)] hover:bg-[var(--app-blue)] border border-[var(--app-blue)] text-[var(--app-blue)] hover:text-white px-6 py-2 rounded-lg cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Profile Picture
                </label>
              </div>
            </div>

            {/* Department */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })} required>
                <SelectTrigger className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--app-surface)] border-[var(--app-border)]">
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="business">Business Administration</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="literature">Literature</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year of Study */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Year of Study</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })} required>
                <SelectTrigger className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--app-surface)] border-[var(--app-border)]">
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Bio</Label>
              <Textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20 min-h-32"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-blue-dark)] hover:opacity-90 text-white shadow-lg py-6 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
