import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { messageAPI } from '../utils/api';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserProfilePicture?: string;
  otherUserDepartment?: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface MessagesScreenProps {
  onBack: () => void;
  currentUserId: string;
  initialConversationId?: string;
}

// Helper to format timestamp
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export function MessagesScreen({ onBack, currentUserId, initialConversationId }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === initialConversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }
    }
  }, [initialConversationId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { conversations: loadedConversations } = await messageAPI.getConversations();
      const validConversations = (loadedConversations || []).filter((c: any) => c && c.id);
      setConversations(validConversations);
      
      if (validConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(validConversations[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { messages: loadedMessages } = await messageAPI.getMessages(conversationId);
      const validMessages = (loadedMessages || []).filter((m: any) => m && m.id);
      setMessages(validMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sendingMessage) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      setSendingMessage(true);
      await messageAPI.send(selectedConversation.id, content, selectedConversation.otherUserId);
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(content); // Restore message text
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center">
        <div className="text-[var(--app-blue)]">Loading conversations...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)]">
        <header className="bg-[var(--app-surface)] border-b border-[var(--app-border)]">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-[var(--app-text-secondary)] hover:text-[var(--app-blue)] transition-colors p-2 hover:bg-[var(--app-gray-light)] rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[var(--app-text-primary)] font-semibold">Messages</h2>
          </div>
        </header>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-[var(--app-text-secondary)] mb-4">No conversations yet</p>
            <p className="text-[var(--app-text-tertiary)]">Search for users and start chatting!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex">
      {/* Conversations List */}
      <div className="w-80 bg-[var(--app-surface)] border-r border-[var(--app-border)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="text-[var(--app-text-secondary)] hover:text-[var(--app-blue)] transition-colors p-2 hover:bg-[var(--app-gray-light)] rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[var(--app-text-primary)] font-semibold">Messages</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-text-tertiary)]" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] pl-10 focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-[var(--app-gray-light)] transition-colors border-b border-[var(--app-border)] ${
                selectedConversation?.id === conversation.id ? 'bg-[var(--app-gray-light)]' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-purple)] flex items-center justify-center overflow-hidden">
                  {conversation.otherUserProfilePicture ? (
                    <ImageWithFallback 
                      src={conversation.otherUserProfilePicture} 
                      alt={conversation.otherUserName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">{conversation.otherUserName[0]}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[var(--app-text-primary)] font-medium truncate">{conversation.otherUserName}</h3>
                  <span className="text-[var(--app-text-tertiary)] text-xs flex-shrink-0 ml-2">
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                </div>
                <p className={`truncate text-sm ${conversation.unread ? 'text-[var(--app-text-secondary)] font-medium' : 'text-[var(--app-text-tertiary)]'}`}>
                  {conversation.lastMessage || 'Start a conversation'}
                </p>
              </div>

              {/* Unread Indicator */}
              {conversation.unread && (
                <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full flex-shrink-0"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-[var(--app-surface)] border-b border-[var(--app-border)] p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-purple)] flex items-center justify-center overflow-hidden">
                  {selectedConversation.otherUserProfilePicture ? (
                    <ImageWithFallback 
                      src={selectedConversation.otherUserProfilePicture} 
                      alt={selectedConversation.otherUserName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">{selectedConversation.otherUserName[0]}</span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-[var(--app-text-primary)] font-semibold">{selectedConversation.otherUserName}</h2>
                {selectedConversation.otherUserDepartment && (
                  <p className="text-[var(--app-blue)] text-sm">{selectedConversation.otherUserDepartment}</p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[var(--app-text-tertiary)]">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isSent = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        isSent
                          ? 'bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] text-white'
                          : 'bg-[var(--app-surface)] text-[var(--app-text-primary)] border border-[var(--app-border)]'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isSent ? 'text-white/70' : 'text-[var(--app-text-tertiary)]'}`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="bg-[var(--app-surface)] border-t border-[var(--app-border)] p-4">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] focus:border-[var(--app-blue)] focus:ring-2 focus:ring-[var(--app-blue)]/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] hover:opacity-90 text-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
