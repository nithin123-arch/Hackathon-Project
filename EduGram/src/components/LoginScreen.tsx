import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginScreenProps {
  onLogin: (email: string, password: string, isSignup: boolean, fullName?: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && (!isSignUp || fullName)) {
      setLoading(true);
      try {
        await onLogin(email, password, isSignUp, fullName);
      } catch (error: any) {
        console.error('Login error in form:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-[var(--app-blue)] font-bold text-4xl">EduGram</h1>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-[var(--app-text-primary)] text-2xl mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-[var(--app-text-secondary)]">{isSignUp ? 'Join your college community' : 'Connect with students from your college'}</p>
          {!isSignUp && (
            <div className="mt-3 bg-[var(--app-blue-light)] border border-[var(--app-blue)] rounded-lg p-3">
              <p className="text-[var(--app-text-primary)] text-sm">Demo: Sign up with any @test.com, @demo.com, or @example.com email</p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="flex items-center gap-2 text-[var(--app-text-primary)] font-medium mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20 transition-all"
                  required
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="flex items-center gap-2 text-[var(--app-text-primary)] font-medium mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20 transition-all"
                required
              />
              {isSignUp && (
                <p className="text-[var(--app-text-tertiary)] text-sm mt-1">
                  Accepted: .edu emails, @test.com, @example.com, @demo.com
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-[var(--app-text-primary)] font-medium mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20 transition-all"
                required
                minLength={6}
              />
            </div>

            {/* Forgot Password (Login Only) */}
            {!isSignUp && (
              <div className="text-right">
                <button type="button" className="text-[var(--app-blue)] hover:text-[var(--app-blue-dark)] text-sm transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-blue-dark)] hover:opacity-90 text-white shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--app-border)]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--app-surface)] px-4 text-[var(--app-text-tertiary)] text-sm">or</span>
              </div>
            </div>

            {/* Toggle Sign Up/Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-[var(--app-surface)] hover:bg-[var(--app-gray-light)] text-[var(--app-text-primary)] border-[var(--app-border)] transition-all"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Login' : 'Sign Up'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--app-text-tertiary)] text-sm mt-8">
          © 2025 EduGram. All rights reserved.
        </p>
      </div>
    </div>
  );
}
