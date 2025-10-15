import { X, Check, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'verification' | 'like' | 'comment' | 'follow' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'verification':
      return Check;
    case 'like':
      return Heart;
    case 'comment':
      return MessageCircle;
    case 'follow':
      return UserPlus;
    default:
      return Bell;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);

  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead }: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 max-h-[60vh] bg-[var(--app-surface)] shadow-2xl z-50 rounded-b-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--app-blue)] text-white px-4 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Notifications {unreadCount > 0 && `(${unreadCount} New)`}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(60vh-64px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="w-12 h-12 text-[var(--app-text-tertiary)] mb-3" />
                  <p className="text-[var(--app-text-secondary)]">No notifications yet</p>
                  <p className="text-[var(--app-text-tertiary)] text-sm">We'll notify you when something happens</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--app-border)]">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    
                    return (
                      <button
                        key={notification.id}
                        onClick={() => onMarkAsRead?.(notification.id)}
                        className={`w-full p-4 hover:bg-[var(--app-gray-light)] transition-colors text-left ${
                          !notification.read ? 'bg-[var(--app-blue-light)]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'verification' ? 'bg-green-100 text-green-600' :
                            notification.type === 'like' ? 'bg-red-100 text-red-600' :
                            notification.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'follow' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[var(--app-text-primary)] font-medium mb-0.5">
                              {notification.title}
                            </p>
                            <p className="text-[var(--app-text-secondary)] text-sm mb-1">
                              {notification.message}
                            </p>
                            <p className="text-[var(--app-text-tertiary)] text-xs">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>

                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
