import { Bell, Plus, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';

interface AppHeaderProps {
  onNotificationClick: () => void;
  onCreatePostClick: () => void;
  notificationCount?: number;
}

export function AppHeader({ onNotificationClick, onCreatePostClick, notificationCount = 0 }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[var(--app-surface)] border-b border-[var(--app-border)] z-40">
      <div className="flex items-center justify-between h-16 max-w-screen-xl mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[var(--app-blue)] font-bold text-xl">EduGram</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-[var(--app-gray-light)] rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-[var(--app-text-primary)]" />
            {notificationCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--app-error)] rounded-full"></div>
            )}
          </button>

          {/* Create Post Button */}
          <Button
            onClick={onCreatePostClick}
            className="bg-[var(--app-blue)] hover:bg-[var(--app-blue-dark)] text-white rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
