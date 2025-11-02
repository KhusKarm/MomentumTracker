# Deploying Momentum to Vercel

This guide will help you deploy your Momentum task tracker app to Vercel.

## ✅ Pre-Deployment Checklist

Your app is already configured for Vercel deployment with:
- ✅ Firebase Authentication (client-side)
- ✅ Neon PostgreSQL database (already configured)
- ✅ Tone.js music player (client-side only, no SSR issues)
- ✅ Protected API routes with authentication
- ✅ Build configuration ready

## 🚀 Deployment Steps

### 1. Ensure Your Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

**Firebase Configuration (Required):**
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note:** The `VITE_FIREBASE_PROJECT_ID` is also used by Firebase Admin SDK for server-side token verification.

**Database Configuration (Already Set):**
```
DATABASE_URL=postgresql://neondb_owner:npg_SnZuqQOFTi67@ep-mute-forest-abftep9v.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Deploy to Vercel

You have two options:

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect the configuration
4. Add the environment variables listed above
5. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 3. Run Database Migrations

After deployment, your database schema is already synced. If you need to update the schema in the future:

```bash
npm run db:push
```

This command is safe and will sync your Drizzle schema to Neon without manual migrations.

## 🎯 Post-Deployment Verification

After deployment, verify these features work:

### 1. Authentication
- [ ] Can create a new account (Sign up page)
- [ ] Can log in with existing account
- [ ] Redirects to login when not authenticated
- [ ] Can log out

### 2. Tasks & Categories
- [ ] Can create a new task
- [ ] Can select existing categories
- [ ] Can create new categories
- [ ] Tasks are grouped by category
- [ ] Can expand/collapse category groups

### 3. Stats & Calendar
- [ ] Activity calendar displays
- [ ] Calendar shows completion status
- [ ] Stats metrics are accurate

### 4. Journal
- [ ] Can create journal entries
- [ ] Can view past entries
- [ ] Entries are sorted by date

### 5. Music Player
- [ ] Music player appears in navigation
- [ ] Can click to start audio (requires user interaction)
- [ ] Can switch between themes (Calm, Focus, Energize)
- [ ] Can mute/unmute
- [ ] Can pause music

## 🔒 Security Implementation

**Authentication Flow:**
- ✅ Client authenticates with Firebase and obtains ID token
- ✅ Client sends token in `Authorization: Bearer <token>` header with every API request
- ✅ Server verifies token using Firebase Admin SDK (`getAuth().verifyIdToken()`)
- ✅ Server extracts userId and email from verified token claims
- ✅ All user data is scoped by authenticated userId
- ✅ Invalid or expired tokens are rejected with 401 Unauthorized

**Security Features:**
- Server-side token verification prevents user impersonation
- No trust in client-provided headers (userId/email derived from verified token)
- Automatic user creation on first authentication
- Token expiration handled by Firebase Admin SDK
- All protected routes require valid authentication

## 🐛 Common Issues & Solutions

### Issue: Music doesn't play
**Solution:** Modern browsers require user interaction before audio can start. The music player requires clicking the play button first.

### Issue: 404 errors on refresh
**Solution:** Vercel handles this automatically with the `vercel.json` configuration. No action needed.

### Issue: Database connection errors
**Solution:** Verify your `DATABASE_URL` environment variable is set correctly in Vercel dashboard.

### Issue: Firebase authentication fails
**Solution:** 
1. Check all Firebase env variables are set in Vercel
2. Verify your Firebase project has Email/Password authentication enabled
3. Check Firebase console for error logs

### Issue: Build fails with Tone.js errors
**Solution:** This shouldn't happen as Tone.js is client-side only. If it does:
1. Verify `MusicPlayer.tsx` has no dynamic imports at top level
2. Ensure no server-side code imports Tone.js

## 📊 Performance Optimization

Your app is already optimized for Vercel with:
- Code splitting via Vite
- Lazy loading of heavy components
- Optimized database queries
- Client-side state management

## 🔄 Updating Your Deployment

To update your app:

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push

# Vercel will automatically deploy on push
```

## 🎉 Success!

Your Momentum app is now live on Vercel! All features including:
- ✅ Firebase Authentication
- ✅ Multi-user task tracking
- ✅ Category management
- ✅ Activity calendar
- ✅ Daily journal
- ✅ Ambient music player

are fully functional and ready for use.

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Neon Docs: https://neon.tech/docs
