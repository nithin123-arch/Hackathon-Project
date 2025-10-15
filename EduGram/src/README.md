# College Connect

A modern, dark-themed social networking app exclusively for verified university students.

## Quick Start

### Sign Up
1. Use an accepted email format:
   - College email: `student@college.edu`
   - Test email: `demo@test.com`, `user@example.com`, `student@demo.com`
2. Password: minimum 6 characters
3. Enter your full name

### Verification
1. Fill in your college details
2. Upload a College ID (any image for demo)
3. Wait 3 seconds for auto-approval ✅

### Start Using
- Create posts (Global or College Community only)
- Like and comment on posts
- Receive notifications
- Message other students

## Features

### 🎓 College Verification System
- College ID upload
- Auto-verification (demo mode)
- Unique student IDs (e.g., `student_2025_ABCD`)

### 📱 Social Feed
- Global feed or College Community filter
- Post with text and images
- Like and comment functionality

### 🔔 Notifications
- Verification status updates
- Post interactions (likes, comments)
- Real-time updates

### 💬 Messaging
- Direct messaging between verified students
- Active status indicators

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **Storage**: Supabase Storage (for images)
- **Auth**: Supabase Auth

## Documentation

- [Backend Documentation](./BACKEND_README.md) - API endpoints and data models
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common errors and solutions
- [Deployment Notes](./DEPLOYMENT_NOTES.md) - Latest changes and deployment info
- [Bug Fixes](./FIXES.md) - Recent bug fixes applied

## Development

### Backend Health Check
Open browser console (F12) to see:
```
✅ Backend Health Check: {
  status: "ok",
  version: "1.1.0",
  acceptedEmails: [".edu", "@test.com", "@example.com", "@demo.com"]
}
```

### Testing Accounts
Create test accounts with these emails:
- `demo@test.com`
- `student@example.com`
- `user@demo.com`

## Design

- **Theme**: Dark mode with cyan/aqua accents
- **Colors**: 
  - Background: `#0a0e1a`, `#0d1425`, `#1a1f2e`
  - Accent: `#00D9FF` (cyan/aqua)
- **Typography**: Clean sans-serif (Inter/Poppins)
- **Effects**: Glowing buttons and icons

## Security Notes

⚠️ **Important**: This is a prototype/demo application. For production use:
- Implement proper email verification
- Add rate limiting
- Enable row-level security
- Conduct security audits
- Ensure compliance (FERPA, GDPR, etc.)

## Credits

Created by Team Compile Squad from KITS

## Version

Current Version: **1.1.0**

### What's New in 1.1.0
- ✅ Fixed email validation (now accepts test emails)
- ✅ Fixed null reference errors in posts/notifications
- ✅ Improved error handling throughout
- ✅ Added backend health checks
- ✅ Better user feedback and error messages
