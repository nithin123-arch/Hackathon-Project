import { Clock } from 'lucide-react';

export function VerificationPendingScreen() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Animated Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-2xl flex items-center justify-center shadow-2xl">
            <Clock className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[var(--app-text-primary)] text-3xl font-bold mb-4">Verification in Progress</h1>
        
        {/* Message */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-8 shadow-xl">
          <p className="text-[var(--app-text-primary)] mb-4">
            Thank you for submitting your verification documents!
          </p>
          <p className="text-[var(--app-text-secondary)]">
            Our team is reviewing your College ID. This process typically takes up to <span className="text-[var(--app-blue)] font-semibold">24 hours</span>.
          </p>
          <p className="text-[var(--app-text-secondary)] mt-4">
            You'll receive a notification once your account has been verified.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
