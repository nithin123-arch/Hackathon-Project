import { Home, Search, Building2, MessageCircle, User } from 'lucide-react';

type NavigationTab = 'feed' | 'search' | 'campus' | 'chat' | 'profile';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadMessages?: number;
}

export function BottomNavigation({ activeTab, onTabChange, unreadMessages = 0 }: BottomNavigationProps) {
  const tabs = [
    { id: 'feed' as const, label: 'Feed', icon: Home },
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'campus' as const, label: 'Campus', icon: Building2 },
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle, badge: unreadMessages },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--app-surface)] border-t border-[var(--app-border)] z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[var(--app-blue)]' : 'text-[var(--app-gray)] group-hover:text-[var(--app-text-primary)]'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--app-error)] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{tab.badge > 9 ? '9+' : tab.badge}</span>
                  </div>
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive ? 'text-[var(--app-blue)] font-medium' : 'text-[var(--app-gray)] group-hover:text-[var(--app-text-primary)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
