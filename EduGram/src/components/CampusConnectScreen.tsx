import { Building2, Users, Calendar, BookOpen, Check, Plus, Search, UserPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';

interface CampusGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  joined: boolean;
  members?: GroupMember[];
  createdBy?: string;
}

interface GroupMember {
  id: string;
  name: string;
  profilePicture?: string;
  department?: string;
  role: 'admin' | 'member';
}

interface CampusConnectScreenProps {
  collegeName: string;
  collegeId: string;
}

export function CampusConnectScreen({ collegeName, collegeId }: CampusConnectScreenProps) {
  const [groups, setGroups] = useState<CampusGroup[]>([
    {
      id: '1',
      name: 'Computer Science Society',
      description: 'Connect with fellow CS students, share projects, and learn together',
      memberCount: 234,
      category: 'Academic',
      joined: true,
      createdBy: 'current-user',
      members: [
        { id: '1', name: 'John Doe', department: 'Computer Science', role: 'admin' },
        { id: '2', name: 'Jane Smith', department: 'Computer Science', role: 'member' },
      ],
    },
    {
      id: '2',
      name: 'Campus Events',
      description: 'Stay updated on all campus events, festivals, and activities',
      memberCount: 567,
      category: 'Events',
      joined: true,
      members: [],
    },
    {
      id: '3',
      name: 'Study Groups',
      description: 'Find study partners and join collaborative learning sessions',
      memberCount: 189,
      category: 'Academic',
      joined: false,
      members: [],
    },
    {
      id: '4',
      name: 'Sports & Fitness',
      description: 'Join sports teams, fitness challenges, and wellness activities',
      memberCount: 321,
      category: 'Recreation',
      joined: false,
      members: [],
    },
    {
      id: '5',
      name: 'Career Development',
      description: 'Get career advice, internship tips, and job opportunities',
      memberCount: 445,
      category: 'Professional',
      joined: false,
      members: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<CampusGroup | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: '',
  });

  // Mock available users to add as members
  const availableUsers: GroupMember[] = [
    { id: '3', name: 'Alice Johnson', department: 'Engineering', role: 'member' },
    { id: '4', name: 'Bob Wilson', department: 'Computer Science', role: 'member' },
    { id: '5', name: 'Carol Davis', department: 'Mathematics', role: 'member' },
    { id: '6', name: 'David Brown', department: 'Physics', role: 'member' },
  ];

  const handleJoinToggle = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, joined: !group.joined } : group
    ));
  };

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.category) {
      alert('Please fill in all required fields');
      return;
    }

    const group: CampusGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      memberCount: 1,
      category: newGroup.category,
      joined: true,
      createdBy: 'current-user',
      members: [
        { id: 'current-user', name: 'You', role: 'admin' },
      ],
    };

    setGroups([group, ...groups]);
    setNewGroup({ name: '', description: '', category: '' });
    setCreateDialogOpen(false);
  };

  const handleAddMember = (user: GroupMember, groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        const members = group.members || [];
        const alreadyMember = members.some(m => m.id === user.id);
        
        if (alreadyMember) {
          alert('User is already a member');
          return group;
        }

        return {
          ...group,
          members: [...members, user],
          memberCount: group.memberCount + 1,
        };
      }
      return group;
    }));
  };

  const handleRemoveMember = (userId: string, groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: (group.members || []).filter(m => m.id !== userId),
          memberCount: Math.max(1, group.memberCount - 1),
        };
      }
      return group;
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic':
        return BookOpen;
      case 'Events':
        return Calendar;
      case 'Recreation':
        return Users;
      case 'Professional':
        return Building2;
      default:
        return Users;
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 pt-20">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Campus Connect Header Card */}
        <div className="bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-blue-dark)] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Campus Connect</h1>
              <p className="text-white/90 text-sm">Your exclusive college community</p>
            </div>
            
            {/* Create Group Button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-primary)]">
                <DialogHeader>
                  <DialogTitle className="text-[var(--app-text-primary)]">Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Group Name *</Label>
                    <Input
                      placeholder="Enter group name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Category *</Label>
                    <Select value={newGroup.category} onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}>
                      <SelectTrigger className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--app-surface)] border-[var(--app-border)]">
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Events">Events</SelectItem>
                        <SelectItem value="Recreation">Recreation</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[var(--app-text-primary)] font-medium mb-2 block">Description</Label>
                    <Textarea
                      placeholder="Describe your group..."
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] min-h-24"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateGroup}
                    className="w-full bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-blue-dark)] hover:opacity-90 text-white"
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-sm mb-1">Connected to</p>
            <h2 className="text-xl font-bold">{collegeName}</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--app-text-tertiary)]" />
          <Input
            type="text"
            placeholder="Search groups by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] pl-10 py-6 rounded-xl"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)] text-center">
            <p className="text-2xl font-bold text-[var(--app-blue)]">{groups.filter(g => g.joined).length}</p>
            <p className="text-[var(--app-text-secondary)] text-sm">Joined</p>
          </div>
          <div className="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)] text-center">
            <p className="text-2xl font-bold text-[var(--app-blue)]">{groups.length}</p>
            <p className="text-[var(--app-text-secondary)] text-sm">Total Groups</p>
          </div>
          <div className="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)] text-center">
            <p className="text-2xl font-bold text-[var(--app-blue)]">
              {groups.reduce((sum, g) => sum + g.memberCount, 0)}
            </p>
            <p className="text-[var(--app-text-secondary)] text-sm">Members</p>
          </div>
        </div>

        {/* Groups List */}
        <div>
          <h2 className="text-[var(--app-text-primary)] font-semibold mb-4">
            {searchQuery ? `Search Results (${filteredGroups.length})` : 'Your Campus Groups'}
          </h2>
          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const CategoryIcon = getCategoryIcon(group.category);
              
              return (
                <div
                  key={group.id}
                  className="bg-[var(--app-surface)] rounded-xl p-4 border border-[var(--app-border)] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      group.joined 
                        ? 'bg-[var(--app-blue-light)] text-[var(--app-blue)]'
                        : 'bg-[var(--app-gray-light)] text-[var(--app-text-secondary)]'
                    }`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-[var(--app-text-primary)] font-semibold">{group.name}</h3>
                          <p className="text-[var(--app-text-secondary)] text-sm">{group.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-sm text-[var(--app-text-tertiary)]">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.memberCount} members
                          </span>
                          <span className="px-2 py-1 bg-[var(--app-gray-light)] rounded-md text-xs">
                            {group.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Add Members Button - Only show if user created the group and has joined */}
                          {group.joined && group.createdBy === 'current-user' && (
                            <Button
                              onClick={() => {
                                setSelectedGroupForMembers(group);
                                setAddMemberDialogOpen(true);
                              }}
                              className="bg-[var(--app-purple-light)] hover:bg-[var(--app-purple)] text-[var(--app-purple)] hover:text-white border border-[var(--app-purple)] px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Members
                            </Button>
                          )}

                          {/* Join/Joined Button */}
                          {group.joined ? (
                            <Button
                              onClick={() => handleJoinToggle(group.id)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 px-4 py-1.5 rounded-lg text-sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Joined
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleJoinToggle(group.id)}
                              className="bg-transparent hover:bg-[var(--app-blue-light)] text-[var(--app-blue)] border border-[var(--app-blue)] px-4 py-1.5 rounded-lg text-sm"
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Members List - Show if group is joined and has members */}
                      {group.joined && group.members && group.members.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--app-border)]">
                          <p className="text-[var(--app-text-secondary)] text-sm mb-2">Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {group.members.slice(0, 5).map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 bg-[var(--app-gray-light)] rounded-lg px-3 py-1.5"
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-purple)] flex items-center justify-center text-white text-xs">
                                  {member.name[0]}
                                </div>
                                <span className="text-[var(--app-text-primary)] text-sm">{member.name}</span>
                                {member.role === 'admin' && (
                                  <span className="text-[var(--app-blue)] text-xs font-semibold">Admin</span>
                                )}
                                {group.createdBy === 'current-user' && member.id !== 'current-user' && (
                                  <button
                                    onClick={() => handleRemoveMember(member.id, group.id)}
                                    className="text-[var(--app-text-tertiary)] hover:text-red-500 ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {group.members.length > 5 && (
                              <div className="flex items-center px-3 py-1.5 text-[var(--app-text-tertiary)] text-sm">
                                +{group.members.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGroups.length === 0 && (
            <div className="bg-[var(--app-surface)] rounded-xl p-8 border border-[var(--app-border)] text-center">
              <Search className="w-12 h-12 text-[var(--app-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--app-text-primary)] font-semibold mb-1">No groups found</p>
              <p className="text-[var(--app-text-secondary)] text-sm">Try adjusting your search query</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-[var(--app-blue-light)] border border-[var(--app-blue)] rounded-xl p-4">
          <p className="text-[var(--app-text-primary)] text-sm">
            <strong>💡 Campus Connect</strong> lets you join verified college-specific groups. Only students from {collegeName} can access these communities!
          </p>
        </div>
      </div>

      {/* Add Members Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-primary)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--app-text-primary)]">
              Add Members to {selectedGroupForMembers?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Users */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--app-text-tertiary)]" />
              <Input
                type="text"
                placeholder="Search users..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--app-border)] text-[var(--app-text-primary)] placeholder:text-[var(--app-text-tertiary)] pl-10"
              />
            </div>

            {/* Users List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => {
                const alreadyMember = selectedGroupForMembers?.members?.some(m => m.id === user.id);
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-[var(--app-gray-light)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-purple)] flex items-center justify-center text-white">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-[var(--app-text-primary)] font-medium">{user.name}</p>
                        {user.department && (
                          <p className="text-[var(--app-text-secondary)] text-sm">{user.department}</p>
                        )}
                      </div>
                    </div>
                    
                    {alreadyMember ? (
                      <span className="text-[var(--app-text-tertiary)] text-sm">Already a member</span>
                    ) : (
                      <Button
                        onClick={() => {
                          if (selectedGroupForMembers) {
                            handleAddMember(user, selectedGroupForMembers.id);
                          }
                        }}
                        className="bg-[var(--app-blue)] hover:bg-[var(--app-blue-dark)] text-white px-3 py-1.5 text-sm"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[var(--app-text-secondary)]">No users found</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
