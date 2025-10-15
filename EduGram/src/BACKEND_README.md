# College Connect Backend Documentation

## Overview

College Connect uses Supabase for backend functionality including authentication, database storage, and file storage. The backend is built with:

- **Supabase Auth**: User authentication and session management
- **Supabase Storage**: File storage for profile pictures, college IDs, and post images
- **Key-Value Store**: Database storage for user profiles, posts, notifications, and messages
- **Hono Server**: Edge function handling API requests

## Architecture

```
Frontend (React) → Supabase Edge Function (Hono) → Supabase Database/Storage
```

## API Endpoints

### Authentication

#### Sign Up
- **POST** `/make-server-c0f67fb2/auth/signup`
- Body: `{ email, password, fullName }`
- Creates a new user account with college email (.edu required)
- Auto-confirms email (since email server is not configured)
- Generates unique user ID (e.g., `student_2025_ABCD`)

#### Sign In
- **POST** `/make-server-c0f67fb2/auth/signin`
- Body: `{ email, password }`
- Returns access token and user profile

### Verification

#### Submit Verification
- **POST** `/make-server-c0f67fb2/verification/submit`
- Auth: Required
- Body: FormData with `fullName`, `dob`, `collegeName`, `collegePlace`, `idCard` (File)
- Uploads college ID to storage
- Auto-approves after 3 seconds (demo mode)
- Creates verification notification

#### Get Verification Status
- **GET** `/make-server-c0f67fb2/verification/status`
- Auth: Required
- Returns current verification status

### Profile

#### Complete Profile
- **POST** `/make-server-c0f67fb2/profile/complete`
- Auth: Required
- Body: FormData with `department`, `year`, `bio`, `profilePicture` (File, optional)
- Uploads profile picture to storage
- Returns signed URL for profile picture

#### Get Profile
- **GET** `/make-server-c0f67fb2/profile`
- Auth: Required
- Returns current user's profile

### Posts

#### Create Post
- **POST** `/make-server-c0f67fb2/posts`
- Auth: Required (must be verified)
- Body: FormData with `content`, `isCollegeCommunityOnly` (boolean), `image` (File, optional)
- Creates a new post
- Uploads image to storage if provided

#### Get Posts Feed
- **GET** `/make-server-c0f67fb2/posts?collegeCommunityOnly=true`
- Auth: Required
- Query: `collegeCommunityOnly` (boolean)
- Returns posts (filtered by college if specified)

#### Like/Unlike Post
- **POST** `/make-server-c0f67fb2/posts/:postId/like`
- Auth: Required
- Toggles like status for a post
- Creates notification for post author

#### Add Comment
- **POST** `/make-server-c0f67fb2/posts/:postId/comment`
- Auth: Required
- Body: `{ content }`
- Adds comment to post
- Creates notification for post author

#### Get Comments
- **GET** `/make-server-c0f67fb2/posts/:postId/comments`
- Auth: Required
- Returns all comments for a post

### Notifications

#### Get All Notifications
- **GET** `/make-server-c0f67fb2/notifications`
- Auth: Required
- Returns all notifications for current user

#### Mark as Read
- **POST** `/make-server-c0f67fb2/notifications/:notificationId/read`
- Auth: Required
- Marks a notification as read

### Messages

#### Get Conversations
- **GET** `/make-server-c0f67fb2/messages/conversations`
- Auth: Required
- Returns all conversations for current user

#### Get Messages
- **GET** `/make-server-c0f67fb2/messages/:conversationId`
- Auth: Required
- Returns all messages in a conversation

#### Send Message
- **POST** `/make-server-c0f67fb2/messages/:conversationId`
- Auth: Required
- Body: `{ content, recipientId }`
- Sends a message in a conversation

## Storage Buckets

The backend automatically creates three private storage buckets on startup:

1. **make-c0f67fb2-profile-pictures**: User profile pictures
2. **make-c0f67fb2-college-ids**: College ID verification documents
3. **make-c0f67fb2-post-images**: Post images

All files are stored privately and accessed via signed URLs with 1-year expiration.

## Data Models

### User Profile
```typescript
{
  id: string,              // Supabase auth user ID
  userId: string,          // Display ID (e.g., student_2025_ABCD)
  email: string,
  fullName: string,
  dob: string,
  collegeName: string,
  collegePlace: string,
  department: string,
  year: string,
  bio: string,
  profilePicture: string,  // Signed URL
  verified: boolean,
  verificationStatus: 'pending' | 'approved' | 'rejected',
  profileCompleted: boolean,
  createdAt: string,
  verifiedAt: string,
  profileCompletedAt: string
}
```

### Post
```typescript
{
  id: string,
  authorId: string,
  authorName: string,
  authorDepartment: string,
  authorProfilePicture: string,
  authorCollege: string,
  content: string,
  image: string,           // Signed URL
  isCollegeCommunityOnly: boolean,
  likes: number,
  likedBy: string[],       // User IDs who liked
  comments: number,
  shares: number,
  createdAt: string
}
```

### Notification
```typescript
{
  id: string,
  userId: string,          // Recipient
  type: 'verification-approved' | 'verification-rejected' | 'like' | 'comment' | 'follow' | 'share',
  title: string,
  message: string,
  fromUser: string,        // Optional, sender name
  postId: string,          // Optional, related post
  read: boolean,
  createdAt: string
}
```

## Frontend API Client

The `/utils/api.ts` file provides a convenient API client:

```typescript
import { authAPI, profileAPI, postAPI, notificationAPI, messageAPI } from './utils/api';

// Example usage
const response = await authAPI.signup(email, password, fullName);
const { posts } = await postAPI.getFeed(false);
await postAPI.like(postId);
```

## Authentication Flow

1. User signs up with college email → `authAPI.signup()`
2. User signs in → `authAPI.signin()` → Returns access token
3. Access token stored in localStorage
4. All API calls include: `Authorization: Bearer {accessToken}`
5. Server validates token with Supabase Auth

## Security Notes

⚠️ **Important**: Figma Make is designed for prototyping and development. It is NOT intended for:
- Collecting Personally Identifiable Information (PII) in production
- Handling sensitive data without proper security audits
- Production deployment of apps requiring compliance (FERPA, GDPR, etc.)

For production use:
- Implement proper email verification
- Add rate limiting
- Implement row-level security policies
- Add data encryption
- Conduct security audits
- Ensure compliance with relevant regulations

## Development

The backend automatically:
- Creates storage buckets on startup
- Auto-approves verification after 3 seconds (demo mode)
- Generates unique user IDs for students
- Creates notifications for interactions

To modify verification timing or approval logic, edit `/supabase/functions/server/index.tsx`.
