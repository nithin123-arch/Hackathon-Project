import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Heart, MessageCircle, UserPlus, Share2, XCircle } from 'lucide-react';
import { notificationAPI } from '../utils/api';

interface NotificationsScreenProps {
  onBack: () => void;
}

// Helper to format timestamp
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { notifications: loadedNotifications } = await notificationAPI.getAll();
      // Filter out null/undefined notifications
      setNotifications((loadedNotifications || []).filter((n: any) => n && n.id));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await notificationAPI.markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };
  const getIcon = (type: string, isRead: boolean) => {
    const iconClass = `w-6 h-6 ${isRead ? 'text-gray-500' : 'text-cyan-400'}`;
    
    switch (type) {
      case 'verification-approved':
        return <CheckCircle className={iconClass} />;
      case 'verification-rejected':
        return <XCircle className={iconClass} />;
      case 'like':
        return <Heart className={iconClass} />;
      case 'comment':
        return <MessageCircle className={iconClass} />;
      case 'follow':
        return <UserPlus className={iconClass} />;
      case 'share':
        return <Share2 className={iconClass} />;
      default:
        return <CheckCircle className={iconClass} />;
    }
  };

  const getIconBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-800';
    
    switch (type) {
      case 'verification-approved':
        return 'bg-green-500/20';
      case 'verification-rejected':
        return 'bg-red-500/20';
      case 'like':
        return 'bg-red-500/20';
      case 'comment':
        return 'bg-cyan-500/20';
      case 'follow':
        return 'bg-purple-500/20';
      case 'share':
        return 'bg-blue-500/20';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="bg-[#0d1425] border-b border-cyan-900/30 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white">Notifications</h1>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-cyan-400">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-[#1a1f2e] border rounded-xl p-4 transition-all hover:border-cyan-900/50 cursor-pointer ${
                  notification.read 
                    ? 'border-cyan-900/10' 
                    : 'border-cyan-900/30 bg-cyan-900/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${getIconBg(notification.type, notification.read)} p-3 rounded-full flex-shrink-0`}>
                    {getIcon(notification.type, notification.read)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {notification.fromUser && (
                          <span className="text-white">{notification.fromUser} </span>
                        )}
                        {notification.title && (
                          <h3 className="text-white mb-1">{notification.title}</h3>
                        )}
                        <p className={`${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <p className="text-gray-600 mt-1">{formatTimestamp(notification.createdAt)}</p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2 shadow-lg shadow-cyan-400/50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
