import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0f67fb2`;

// Store access token
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('college_connect_token', token);
  } else {
    localStorage.removeItem('college_connect_token');
  }
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('college_connect_token');
  }
  return accessToken;
};

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  useAuth: boolean = true
) => {
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (useAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${endpoint}):`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed (${endpoint}):`, error);
    throw error;
  }
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  signup: async (email: string, password: string, fullName: string) => {
    const response = await apiCall(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      },
      false
    );
    return response;
  },

  signin: async (email: string, password: string) => {
    const response = await apiCall(
      '/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }
    return response;
  },

  signout: () => {
    setAccessToken(null);
  },
};

// ============================================================================
// VERIFICATION API
// ============================================================================

export const verificationAPI = {
  submit: async (data: {
    fullName: string;
    dob: string;
    collegeName: string;
    collegePlace: string;
    idCard: File;
  }) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('dob', data.dob);
    formData.append('collegeName', data.collegeName);
    formData.append('collegePlace', data.collegePlace);
    formData.append('idCard', data.idCard);

    return await apiCall('/verification/submit', {
      method: 'POST',
      body: formData,
    });
  },

  getStatus: async () => {
    return await apiCall('/verification/status', {
      method: 'GET',
    });
  },
};

// ============================================================================
// PROFILE API
// ============================================================================

export const profileAPI = {
  submitVerification: async (collegeId: string, file: File) => {
    return await verificationAPI.submit({
      fullName: '',
      dob: '',
      collegeName: collegeId,
      collegePlace: '',
      idCard: file,
    });
  },

  complete: async (data: {
    department: string;
    year: string;
    bio: string;
    profilePicture?: File;
  }) => {
    const formData = new FormData();
    formData.append('department', data.department);
    formData.append('year', data.year);
    formData.append('bio', data.bio);
    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture);
    }

    return await apiCall('/profile/complete', {
      method: 'POST',
      body: formData,
    });
  },

  get: async () => {
    return await apiCall('/profile', {
      method: 'GET',
    });
  },
};

// ============================================================================
// POST API
// ============================================================================

export const postAPI = {
  create: async (data: {
    content: string;
    isCollegeCommunityOnly: boolean;
    image?: File;
  }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('isCollegeCommunityOnly', data.isCollegeCommunityOnly.toString());
    if (data.image) {
      formData.append('image', data.image);
    }

    return await apiCall('/posts', {
      method: 'POST',
      body: formData,
    });
  },

  getFeed: async (collegeCommunityOnly: boolean = false) => {
    const query = collegeCommunityOnly ? '?collegeCommunityOnly=true' : '';
    return await apiCall(`/posts${query}`, {
      method: 'GET',
    });
  },

  like: async (postId: string) => {
    return await apiCall(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  comment: async (postId: string, content: string) => {
    return await apiCall(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  getComments: async (postId: string) => {
    return await apiCall(`/posts/${postId}/comments`, {
      method: 'GET',
    });
  },
};

// ============================================================================
// NOTIFICATION API
// ============================================================================

export const notificationAPI = {
  getAll: async () => {
    return await apiCall('/notifications', {
      method: 'GET',
    });
  },

  markAsRead: async (notificationId: string) => {
    return await apiCall(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// MESSAGE API
// ============================================================================

export const messageAPI = {
  getConversations: async () => {
    return await apiCall('/messages/conversations', {
      method: 'GET',
    });
  },

  getMessages: async (conversationId: string) => {
    return await apiCall(`/messages/${conversationId}`, {
      method: 'GET',
    });
  },

  send: async (conversationId: string, content: string, recipientId: string) => {
    return await apiCall(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content, recipientId }),
    });
  },

  startConversation: async (recipientId: string) => {
    return await apiCall('/messages/start', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  },
};

// ============================================================================
// USER SEARCH API
// ============================================================================

export const userAPI = {
  search: async (query: string) => {
    return await apiCall(`/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },

  getProfile: async (userId: string) => {
    return await apiCall(`/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },

  getProfileById: async (id: string) => {
    return await apiCall(`/users/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  },
};
