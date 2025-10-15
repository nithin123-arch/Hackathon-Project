/**
 * College Connect Backend Server
 * Version: 1.1.0
 * Last Updated: 2025-10-14
 * Accepts: .edu, @test.com, @example.com, @demo.com emails
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Initialize storage buckets
const initializeStorage = async () => {
  try {
    const buckets = [
      "make-c0f67fb2-profile-pictures",
      "make-c0f67fb2-college-ids",
      "make-c0f67fb2-post-images",
    ];

    const { data: existingBuckets } = await supabase.storage.listBuckets();

    for (const bucketName of buckets) {
      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === bucketName
      );
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
        console.log(`Created bucket: ${bucketName}`);
      }
    }
  } catch (error) {
    console.log(`Error initializing storage: ${error}`);
  }
};

// Initialize storage on startup
initializeStorage();

// Helper function to authenticate user
const authenticateUser = async (request: Request) => {
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return { error: "No authorization token provided", status: 401 };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: "Unauthorized - Invalid token", status: 401 };
  }

  return { user };
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Sign up with college email
app.post("/make-server-c0f67fb2/auth/signup", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Validate college email (basic check) - allow test emails for development
    const isValidEmail = email.endsWith(".edu") || 
                        email.endsWith("@test.com") || 
                        email.endsWith("@example.com") ||
                        email.endsWith("@demo.com");
    
    if (!isValidEmail) {
      console.log(`Email validation failed for: ${email}`);
      return c.json(
        { 
          error: "Please use a valid college email (.edu) or test email (@test.com, @example.com, @demo.com)",
          receivedEmail: email 
        },
        400
      );
    }
    
    console.log(`Email validation passed for: ${email}`);

    // Create user with auto-confirmed email (since we don't have email server configured)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server is not configured
      user_metadata: { full_name: fullName },
    });

    if (error) {
      console.error(`Signup error: ${error.message}`, error);
      return c.json({ error: error.message }, 400);
    }

    // Generate user ID
    const userId = `student_2025_${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // Create user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      userId,
      email,
      fullName,
      verified: false,
      createdAt: new Date().toISOString(),
    });

    return c.json({
      user: data.user,
      userId,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(`Signup error: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Sign in
app.post("/make-server-c0f67fb2/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`Sign in error: ${error.message}`, error);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user:${session.user.id}`);

    return c.json({
      accessToken: session.access_token,
      user: session.user,
      profile,
    });
  } catch (error) {
    console.error(`Sign in error: ${error}`);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

// ============================================================================
// VERIFICATION ROUTES
// ============================================================================

// Submit verification
app.post("/make-server-c0f67fb2/verification/submit", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const formData = await c.req.formData();
    const fullName = formData.get("fullName") as string;
    const dob = formData.get("dob") as string;
    const collegeName = formData.get("collegeName") as string;
    const collegePlace = formData.get("collegePlace") as string;
    const idCardFile = formData.get("idCard") as File;

    if (!fullName || !dob || !collegeName || !collegePlace || !idCardFile) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Upload ID card to storage
    const fileName = `${auth.user.id}_${Date.now()}_${idCardFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("make-c0f67fb2-college-ids")
      .upload(fileName, idCardFile);

    if (uploadError) {
      console.log(`ID card upload error: ${uploadError.message}`);
      return c.json({ error: "Failed to upload ID card" }, 500);
    }

    // Update user profile
    const currentProfile = await kv.get(`user:${auth.user.id}`);
    await kv.set(`user:${auth.user.id}`, {
      ...currentProfile,
      fullName,
      dob,
      collegeName,
      collegePlace,
      idCardPath: uploadData.path,
      verificationStatus: "pending",
      verificationSubmittedAt: new Date().toISOString(),
    });

    // Create verification record
    await kv.set(`verification:${auth.user.id}`, {
      userId: auth.user.id,
      status: "pending",
      submittedAt: new Date().toISOString(),
      idCardPath: uploadData.path,
    });

    // Auto-approve after 3 seconds (for demo purposes)
    setTimeout(async () => {
      const profile = await kv.get(`user:${auth.user.id}`);
      await kv.set(`user:${auth.user.id}`, {
        ...profile,
        verified: true,
        verificationStatus: "approved",
        verifiedAt: new Date().toISOString(),
      });

      await kv.set(`verification:${auth.user.id}`, {
        userId: auth.user.id,
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      // Create notification
      const notificationId = `notif_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      await kv.set(`notification:${auth.user.id}:${notificationId}`, {
        id: notificationId,
        userId: auth.user.id,
        type: "verification-approved",
        title: "Verification Approved",
        message: "Your student status has been verified successfully!",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }, 3000);

    return c.json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.log(`Verification submission error: ${error}`);
    return c.json({ error: "Failed to submit verification" }, 500);
  }
});

// Get verification status
app.get("/make-server-c0f67fb2/verification/status", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const verification = await kv.get(`verification:${auth.user.id}`);
    return c.json({ verification });
  } catch (error) {
    console.log(`Get verification status error: ${error}`);
    return c.json({ error: "Failed to get verification status" }, 500);
  }
});

// ============================================================================
// PROFILE ROUTES
// ============================================================================

// Complete profile
app.post("/make-server-c0f67fb2/profile/complete", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const formData = await c.req.formData();
    const department = formData.get("department") as string;
    const year = formData.get("year") as string;
    const bio = formData.get("bio") as string;
    const profilePicture = formData.get("profilePicture") as File | null;

    let profilePictureUrl = null;

    if (profilePicture) {
      const fileName = `${auth.user.id}_${Date.now()}_${profilePicture.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("make-c0f67fb2-profile-pictures")
        .upload(fileName, profilePicture);

      if (uploadError) {
        console.log(`Profile picture upload error: ${uploadError.message}`);
      } else {
        // Get signed URL
        const { data: signedUrlData } = await supabase.storage
          .from("make-c0f67fb2-profile-pictures")
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 year

        profilePictureUrl = signedUrlData?.signedUrl;
      }
    }

    // Update user profile
    const currentProfile = await kv.get(`user:${auth.user.id}`);
    const updatedProfile = {
      ...currentProfile,
      department,
      year,
      bio,
      profilePicture: profilePictureUrl,
      profileCompleted: true,
      profileCompletedAt: new Date().toISOString(),
    };

    await kv.set(`user:${auth.user.id}`, updatedProfile);

    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log(`Profile completion error: ${error}`);
    return c.json({ error: "Failed to complete profile" }, 500);
  }
});

// Get user profile
app.get("/make-server-c0f67fb2/profile", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const profile = await kv.get(`user:${auth.user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// ============================================================================
// POST ROUTES
// ============================================================================

// Create post
app.post("/make-server-c0f67fb2/posts", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const formData = await c.req.formData();
    const content = formData.get("content") as string;
    const isCollegeCommunityOnly = formData.get("isCollegeCommunityOnly") === "true";
    const imageFile = formData.get("image") as File | null;

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${auth.user.id}`);
    if (!userProfile.verified) {
      return c.json({ error: "Only verified users can post" }, 403);
    }

    let imageUrl = null;

    if (imageFile) {
      const fileName = `${auth.user.id}_${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("make-c0f67fb2-post-images")
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: signedUrlData } = await supabase.storage
          .from("make-c0f67fb2-post-images")
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

        imageUrl = signedUrlData?.signedUrl;
      }
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const post = {
      id: postId,
      authorId: auth.user.id,
      authorName: userProfile.fullName,
      authorDepartment: userProfile.department,
      authorProfilePicture: userProfile.profilePicture,
      authorCollege: userProfile.collegeName,
      content,
      image: imageUrl,
      isCollegeCommunityOnly,
      likes: 0,
      likedBy: [],
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`post:${postId}`, post);

    // Add to user's posts
    const userPosts = (await kv.get(`user:${auth.user.id}:posts`)) || [];
    userPosts.unshift(postId);
    await kv.set(`user:${auth.user.id}:posts`, userPosts);

    return c.json({ post });
  } catch (error) {
    console.log(`Create post error: ${error}`);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Get posts feed
app.get("/make-server-c0f67fb2/posts", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const collegeCommunityOnly = c.req.query("collegeCommunityOnly") === "true";

    // Get user profile
    const userProfile = await kv.get(`user:${auth.user.id}`);

    // Get all posts
    const allPosts = await kv.getByPrefix("post:");
    // getByPrefix returns array of values directly, filter out null/undefined
    let posts = (allPosts || []).filter((post: any) => post && post.id);

    // Filter by college community if requested
    if (collegeCommunityOnly) {
      posts = posts.filter(
        (post: any) =>
          post.isCollegeCommunityOnly &&
          post.authorCollege === userProfile?.collegeName
      );
    }

    // Sort by creation date (newest first)
    posts.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ posts });
  } catch (error) {
    console.error(`Get posts error: ${error}`);
    return c.json({ error: "Failed to get posts" }, 500);
  }
});

// Like/unlike post
app.post("/make-server-c0f67fb2/posts/:postId/like", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const postId = c.req.param("postId");
    const post = await kv.get(`post:${postId}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    const likedBy = post.likedBy || [];
    const userIndex = likedBy.indexOf(auth.user.id);

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      likedBy.push(auth.user.id);
      post.likes += 1;

      // Create notification for post author
      if (post.authorId !== auth.user.id) {
        const userProfile = await kv.get(`user:${auth.user.id}`);
        const notificationId = `notif_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        await kv.set(`notification:${post.authorId}:${notificationId}`, {
          id: notificationId,
          userId: post.authorId,
          type: "like",
          fromUser: userProfile.fullName,
          message: `liked your post`,
          postId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    post.likedBy = likedBy;
    await kv.set(`post:${postId}`, post);

    return c.json({ post });
  } catch (error) {
    console.log(`Like post error: ${error}`);
    return c.json({ error: "Failed to like post" }, 500);
  }
});

// Add comment to post
app.post("/make-server-c0f67fb2/posts/:postId/comment", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const postId = c.req.param("postId");
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: "Comment content is required" }, 400);
    }

    const post = await kv.get(`post:${postId}`);
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    const userProfile = await kv.get(`user:${auth.user.id}`);

    const commentId = `comment_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const comment = {
      id: commentId,
      postId,
      authorId: auth.user.id,
      authorName: userProfile.fullName,
      authorProfilePicture: userProfile.profilePicture,
      content,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`comment:${postId}:${commentId}`, comment);

    // Update post comment count
    post.comments += 1;
    await kv.set(`post:${postId}`, post);

    // Create notification for post author
    if (post.authorId !== auth.user.id) {
      const notificationId = `notif_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      await kv.set(`notification:${post.authorId}:${notificationId}`, {
        id: notificationId,
        userId: post.authorId,
        type: "comment",
        fromUser: userProfile.fullName,
        message: `commented on your post: "${content.substring(0, 50)}${
          content.length > 50 ? "..." : ""
        }"`,
        postId,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return c.json({ comment });
  } catch (error) {
    console.log(`Add comment error: ${error}`);
    return c.json({ error: "Failed to add comment" }, 500);
  }
});

// Get comments for post
app.get("/make-server-c0f67fb2/posts/:postId/comments", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const postId = c.req.param("postId");
    const allComments = await kv.getByPrefix(`comment:${postId}:`);
    // getByPrefix returns array of values directly, filter out null/undefined
    const comments = (allComments || []).filter((c: any) => c && c.id);

    // Sort by creation date (oldest first)
    comments.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ comments });
  } catch (error) {
    console.log(`Get comments error: ${error}`);
    return c.json({ error: "Failed to get comments" }, 500);
  }
});

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================

// Get notifications
app.get("/make-server-c0f67fb2/notifications", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const allNotifications = await kv.getByPrefix(`notification:${auth.user.id}:`);
    // getByPrefix returns array of values directly, filter out null/undefined
    const notifications = (allNotifications || []).filter((n: any) => n && n.id);

    // Sort by creation date (newest first)
    notifications.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ notifications });
  } catch (error) {
    console.log(`Get notifications error: ${error}`);
    return c.json({ error: "Failed to get notifications" }, 500);
  }
});

// Mark notification as read
app.post("/make-server-c0f67fb2/notifications/:notificationId/read", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const notificationId = c.req.param("notificationId");
    const notification = await kv.get(
      `notification:${auth.user.id}:${notificationId}`
    );

    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    notification.read = true;
    await kv.set(`notification:${auth.user.id}:${notificationId}`, notification);

    return c.json({ notification });
  } catch (error) {
    console.log(`Mark notification as read error: ${error}`);
    return c.json({ error: "Failed to mark notification as read" }, 500);
  }
});

// ============================================================================
// USER SEARCH ROUTES
// ============================================================================

// Search users by userId
app.get("/make-server-c0f67fb2/users/search", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Search query is required" }, 400);
    }

    // Get all users
    const allUsers = await kv.getByPrefix("user:");
    const users = (allUsers || []).filter((user: any) => user && user.id);

    // Search by userId or fullName (case-insensitive)
    const searchResults = users.filter((user: any) => {
      const userIdMatch = user.userId?.toLowerCase().includes(query.toLowerCase());
      const nameMatch = user.fullName?.toLowerCase().includes(query.toLowerCase());
      return (userIdMatch || nameMatch) && user.id !== auth.user.id; // Exclude current user
    });

    // Return only necessary profile info
    const results = searchResults.map((user: any) => ({
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      department: user.department,
      year: user.year,
      collegeName: user.collegeName,
      profilePicture: user.profilePicture,
      bio: user.bio,
    }));

    return c.json({ users: results });
  } catch (error) {
    console.log(`Search users error: ${error}`);
    return c.json({ error: "Failed to search users" }, 500);
  }
});

// Get user profile by userId (custom user ID)
app.get("/make-server-c0f67fb2/users/:userId", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const userId = c.req.param("userId");
    
    // Get all users to find by userId
    const allUsers = await kv.getByPrefix("user:");
    const users = (allUsers || []).filter((user: any) => user && user.id);
    
    // Try to find by custom userId first, then by internal id
    let user = users.find((u: any) => u.userId === userId);
    if (!user) {
      user = users.find((u: any) => u.id === userId);
    }

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Return user profile (excluding sensitive data)
    const profile = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      department: user.department,
      year: user.year,
      collegeName: user.collegeName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      verified: user.verified,
    };

    return c.json({ profile });
  } catch (error) {
    console.log(`Get user profile error: ${error}`);
    return c.json({ error: "Failed to get user profile" }, 500);
  }
});

// ============================================================================
// MESSAGING ROUTES
// ============================================================================

// Start or get conversation with a user
app.post("/make-server-c0f67fb2/messages/start", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const { recipientId } = await c.req.json();
    if (!recipientId) {
      return c.json({ error: "Recipient ID is required" }, 400);
    }

    // Get recipient profile
    const recipientProfile = await kv.get(`user:${recipientId}`);
    if (!recipientProfile) {
      return c.json({ error: "Recipient not found" }, 404);
    }

    // Create conversation ID (consistent for both users)
    const userIds = [auth.user.id, recipientId].sort();
    const conversationId = `conv_${userIds[0]}_${userIds[1]}`;

    // Get user profile
    const userProfile = await kv.get(`user:${auth.user.id}`);

    // Create or update conversation for current user
    await kv.set(`conversation:${auth.user.id}:${conversationId}`, {
      id: conversationId,
      userId: auth.user.id,
      otherUserId: recipientId,
      otherUserName: recipientProfile.fullName,
      otherUserProfilePicture: recipientProfile.profilePicture,
      otherUserDepartment: recipientProfile.department,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unread: false,
    });

    // Create or update conversation for recipient
    await kv.set(`conversation:${recipientId}:${conversationId}`, {
      id: conversationId,
      userId: recipientId,
      otherUserId: auth.user.id,
      otherUserName: userProfile.fullName,
      otherUserProfilePicture: userProfile.profilePicture,
      otherUserDepartment: userProfile.department,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      unread: false,
    });

    return c.json({ conversationId });
  } catch (error) {
    console.log(`Start conversation error: ${error}`);
    return c.json({ error: "Failed to start conversation" }, 500);
  }
});

// Get conversations
app.get("/make-server-c0f67fb2/messages/conversations", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const allConversations = await kv.getByPrefix(
      `conversation:${auth.user.id}:`
    );
    // getByPrefix returns array of values directly, filter out null/undefined
    const conversations = (allConversations || []).filter((c: any) => c && c.id);

    // Sort by last message time (newest first)
    conversations.sort(
      (a: any, b: any) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );

    return c.json({ conversations });
  } catch (error) {
    console.log(`Get conversations error: ${error}`);
    return c.json({ error: "Failed to get conversations" }, 500);
  }
});

// Get messages in a conversation
app.get("/make-server-c0f67fb2/messages/:conversationId", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const conversationId = c.req.param("conversationId");
    const allMessages = await kv.getByPrefix(`message:${conversationId}:`);
    // getByPrefix returns array of values directly, filter out null/undefined
    const messages = (allMessages || []).filter((m: any) => m && m.id);

    // Sort by creation date (oldest first)
    messages.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ messages });
  } catch (error) {
    console.log(`Get messages error: ${error}`);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// Send message
app.post("/make-server-c0f67fb2/messages/:conversationId", async (c) => {
  try {
    const auth = await authenticateUser(c.req.raw);
    if ("error" in auth) {
      return c.json({ error: auth.error }, auth.status);
    }

    const conversationId = c.req.param("conversationId");
    const { content, recipientId } = await c.req.json();

    if (!content) {
      return c.json({ error: "Message content is required" }, 400);
    }

    const messageId = `message_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const message = {
      id: messageId,
      conversationId,
      senderId: auth.user.id,
      recipientId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`message:${conversationId}:${messageId}`, message);

    // Update conversation for both users
    const userProfile = await kv.get(`user:${auth.user.id}`);
    const recipientProfile = await kv.get(`user:${recipientId}`);

    await kv.set(`conversation:${auth.user.id}:${conversationId}`, {
      id: conversationId,
      userId: auth.user.id,
      otherUserId: recipientId,
      otherUserName: recipientProfile.fullName,
      otherUserProfilePicture: recipientProfile.profilePicture,
      otherUserDepartment: recipientProfile.department,
      lastMessage: content,
      lastMessageAt: new Date().toISOString(),
      unread: false,
    });

    await kv.set(`conversation:${recipientId}:${conversationId}`, {
      id: conversationId,
      userId: recipientId,
      otherUserId: auth.user.id,
      otherUserName: userProfile.fullName,
      otherUserProfilePicture: userProfile.profilePicture,
      otherUserDepartment: userProfile.department,
      lastMessage: content,
      lastMessageAt: new Date().toISOString(),
      unread: true,
    });

    return c.json({ message });
  } catch (error) {
    console.log(`Send message error: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Health check
app.get("/make-server-c0f67fb2/health", (c) => {
  return c.json({ 
    status: "ok", 
    version: "1.1.0",
    acceptedEmails: [".edu", "@test.com", "@example.com", "@demo.com"],
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint to verify deployment
app.get("/make-server-c0f67fb2/test", (c) => {
  return c.json({ 
    message: "Backend is running",
    version: "1.1.0",
    deployedAt: new Date().toISOString()
  });
});

Deno.serve(app.fetch);
