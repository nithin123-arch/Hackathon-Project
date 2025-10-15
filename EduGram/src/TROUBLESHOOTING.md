# Troubleshooting Guide

## Common Errors and Solutions

### Error: "Invalid login credentials"

**Cause**: Trying to sign in with an account that doesn't exist yet.

**Solution**: 
1. Click "Sign Up" to create a new account first
2. Use one of the accepted email formats (see below)

### Error: "Please use a valid college email address (.edu)"

**Cause**: Email format not recognized by the system.

**Solution**: Use one of these email formats:
- Any `.edu` email (e.g., `student@college.edu`)
- `@test.com` (e.g., `demo@test.com`)
- `@example.com` (e.g., `user@example.com`)
- `@demo.com` (e.g., `student@demo.com`)

### Error: "Failed to get posts"

**Cause**: Backend might not be fully initialized or user is not verified.

**Solution**:
1. Make sure you've completed the verification flow
2. Wait a few seconds for backend initialization
3. Refresh the page

## Quick Start Guide

### First Time Setup

1. **Sign Up**
   - Email: `demo@test.com` (or any @test.com, @demo.com, @example.com)
   - Password: `password123` (minimum 6 characters)
   - Full Name: Your name

2. **Verification**
   - Fill in the verification form
   - Upload any image as College ID (for demo)
   - Wait 3 seconds for auto-approval

3. **Profile Completion**
   - Select your department
   - Select your year
   - Add a bio (optional)
   - Upload profile picture (optional)

4. **Start Using**
   - View posts in the home feed
   - Create posts
   - Interact with the community

## Backend Health Check

The app performs automatic health checks on startup. Check the browser console (F12) for:
- ✅ Backend Health Check: Should show version and accepted emails
- ❌ If you see errors, the backend might be initializing

## Development Notes

- The backend auto-approves verification after 3 seconds (demo mode)
- All file uploads use Supabase storage
- Session tokens are stored in localStorage
- The app uses Supabase Edge Functions for the backend

## Still Having Issues?

1. **Clear browser cache and localStorage**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear storage

2. **Check console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages

3. **Try a fresh account**
   - Use a different email
   - Make sure it ends with @test.com, @demo.com, or @example.com

4. **Wait for backend initialization**
   - The Supabase Edge Function might need a moment to start
   - Try refreshing after 5-10 seconds
