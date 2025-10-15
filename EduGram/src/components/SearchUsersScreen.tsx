import { useState } from 'react';
import { ArrowLeft, Search, User as UserIcon } from 'lucide-react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { userAPI } from '../utils/api';

interface User {
  id: string;
  userId: string;
  fullName: string;
  department?: string;
  year?: string;
  collegeName?: string;
  profilePicture?: string;
  bio?: string;
}

interface SearchUsersScreenProps {
  onBack: () => void;
  onUserSelect: (userId: string) => void;
}

export function SearchUsersScreen({ onBack, onUserSelect }: SearchUsersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const { users } = await userAPI.search(searchQuery.trim());
      setSearchResults(users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="bg-[#0d1425] border-b border-cyan-900/30 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-cyan-400">Search Users</h2>
        </div>
      </header>

      {/* Search Bar */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-[#1a1f2e] border border-cyan-900/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by User ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-[#0a0e1a] border-cyan-900/50 text-white placeholder:text-gray-500 pl-10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || loading}
              className="bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-[#0a0e1a] px-6 py-2 rounded-lg shadow-lg shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-gray-500 mt-3">
            Search for students using their unique User ID or name to connect with them
          </p>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-cyan-400">Searching...</div>
            </div>
          ) : searched && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block relative mb-4">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/30 rounded-full p-6">
                  <UserIcon className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <p className="text-gray-400">No users found. Try a different search term.</p>
            </div>
          ) : (
            searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.userId)}
                className="w-full bg-[#1a1f2e] border border-cyan-900/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center overflow-hidden border-2 border-cyan-400/40">
                      {user.profilePicture ? (
                        <ImageWithFallback
                          src={user.profilePicture}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#0a0e1a]">{user.fullName[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white group-hover:text-cyan-400 transition-colors mb-1">
                      {user.fullName}
                    </h3>
                    <p className="text-cyan-400 mb-1">
                      User ID: {user.userId}
                    </p>
                    {user.department && (
                      <p className="text-gray-400">
                        {user.department}
                        {user.year && ` • Year ${user.year}`}
                      </p>
                    )}
                    {user.collegeName && (
                      <p className="text-gray-500">{user.collegeName}</p>
                    )}
                  </div>

                  {/* View Profile Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center group-hover:bg-cyan-400/20 transition-all">
                      <UserIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
