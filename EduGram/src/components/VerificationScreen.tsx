import { useState } from 'react';
import { Upload, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { verificationAPI } from '../utils/api';

interface VerificationScreenProps {
  userId: string;
  onSubmit: (data: any) => void;
}

export function VerificationScreen({ userId, onSubmit }: VerificationScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    collegeName: '',
    collegePlace: '',
  });
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile) {
      alert('Please upload your college ID card');
      return;
    }

    setLoading(true);
    try {
      await verificationAPI.submit({
        fullName: formData.fullName,
        dob: formData.dob,
        collegeName: formData.collegeName,
        collegePlace: formData.collegePlace,
        idCard: idCardFile,
      });
      onSubmit({ ...formData, idCardFile });
    } catch (error) {
      console.error('Verification submission failed:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdCardFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h1 className="text-[var(--app-text-primary)] text-3xl mb-2">Verify Your Student Status</h1>
          <p className="text-[var(--app-text-secondary)]">Complete the form below to verify your college enrollment</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Display */}
            <div className="bg-[var(--app-blue-light)] border border-[var(--app-blue)] rounded-lg p-4">
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Your User ID</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg px-4 py-3">
                  <code className="text-[var(--app-blue)] font-mono">{userId}</code>
                </div>
                <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Full Name</Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
                required
              />
            </div>

            {/* College Name */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">College Name</Label>
              <Input
                type="text"
                placeholder="Enter your college name"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
                required
              />
            </div>

            {/* College Place */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">College Place (City/State)</Label>
              <Input
                type="text"
                placeholder="Enter city and state"
                value={formData.collegePlace}
                onChange={(e) => setFormData({ ...formData, collegePlace: e.target.value })}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
                required
              />
            </div>

            {/* Upload College ID Card */}
            <div>
              <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">College ID Card</Label>
              <div className="relative">
                <input
                  type="file"
                  id="idCard"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="idCard"
                  className="flex items-center justify-center gap-3 bg-[var(--app-surface)] border-2 border-dashed border-[var(--app-border)] hover:border-[var(--app-blue)] rounded-lg px-6 py-8 cursor-pointer transition-all group"
                >
                  <Upload className="w-6 h-6 text-[var(--app-blue)] group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <p className="text-[var(--app-text-primary)] font-medium">
                      {idCardFile ? idCardFile.name : 'Upload College ID Card'}
                    </p>
                    <p className="text-[var(--app-text-tertiary)] text-sm">Click to browse or drag and drop</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-blue-dark)] hover:opacity-90 text-white shadow-lg py-6 disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
