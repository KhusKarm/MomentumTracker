# Vercel Deployment Fix Guide

## Issues Fixed

### 1. ✅ Missing Authentication in Vercel API Handler
**Problem**: The old `api/index.js` was missing authentication middleware and several routes (categories, journal).

**Solution**: Rebuilt `api/index.js` using the build script to include:
- Firebase Admin authentication middleware (`requireAuth`)
- All API routes: categories, tasks, journal, check-ins, stats
- Proper error handling

### 2. ✅ SPA Routing (404 on Page Refresh)
**Problem**: Refreshing pages in Vercel resulted in 404 errors because client-side routes weren't being handled.

**Solution**: Updated `vercel.json` to include catch-all route:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

This ensures all non-API routes serve `index.html`, allowing `wouter` to handle client-side routing.

### 3. ✅ Environment Variables Setup
**Problem**: Firebase credentials and database URL weren't configured as environment variables.

**Solution**: Added all required environment variables to Replit Secrets (also need to be added to Vercel).

## Deployment Steps for Vercel

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
VITE_FIREBASE_API_KEY=AIzaSyATO48K78AzF4Bo17156xFsa0OBBdkN0yM
VITE_FIREBASE_AUTH_DOMAIN=build-momentum-ec9b8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=build-momentum-ec9b8
VITE_FIREBASE_STORAGE_BUCKET=build-momentum-ec9b8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=694119249183
VITE_FIREBASE_APP_ID=1:694119249183:web:8dd0cee17e6d00f6ad2c2a
DATABASE_URL=postgresql://neondb_owner:npg_SnZuqQOFTi67@ep-mute-forest-abftep9v.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Important**: Add these to all environments (Production, Preview, Development).

### Step 2: Verify Database Schema

Make sure your Neon database has all the required tables:

```bash
npm run db:push
```

This will sync your database schema with the definitions in `shared/schema.ts`.

### Step 3: Commit and Push Changes

The following files have been updated and need to be committed:

1. `vercel.json` - Added SPA routing catch-all
2. `api/index.js` - Rebuilt with authentication and all routes
3. `.gitignore` - Added `.env` and `.env.local` to prevent accidental commits

```bash
git add vercel.json api/index.js .gitignore
git commit -m "Fix: Add authentication to Vercel API handler and SPA routing"
git push
```

### Step 4: Redeploy on Vercel

After pushing, Vercel will automatically redeploy. You can also manually redeploy from the Vercel dashboard.

## Testing After Deployment

1. **Login/Signup**: Visit your Vercel URL and test login/signup
2. **Create Category**: Try creating a new category
3. **Create Task**: Create a task in a category
4. **Create Journal Entry**: Add a journal entry
5. **Page Refresh**: Refresh the page on different routes (should not 404)
6. **Check-ins**: Test the check-in functionality

## Common Issues and Solutions

### Issue: "Failed to save task/journal/category"

**Cause**: Authentication token not being sent or verified properly.

**Check**:
1. Browser console for errors
2. Network tab to see if Authorization header is present
3. Vercel function logs for authentication errors

### Issue: "404 on page refresh"

**Cause**: Missing catch-all route in `vercel.json`.

**Solution**: Already fixed - make sure the updated `vercel.json` is deployed.

### Issue: "Firebase auth error"

**Cause**: Environment variables not set in Vercel.

**Solution**: Double-check all VITE_FIREBASE_* variables are set in Vercel project settings.

### Issue: "Database connection error"

**Cause**: DATABASE_URL not set or incorrect.

**Solution**:
1. Verify DATABASE_URL is set in Vercel environment variables
2. Check that the Neon database is accessible (not paused)
3. Ensure SSL mode is set to `require`

## Architecture Notes

### Authentication Flow

1. **Client** (Firebase Auth) → User logs in via Firebase
2. **Client** → Gets ID token from Firebase
3. **Client** → Sends API requests with `Authorization: Bearer <token>` header
4. **Server** (Vercel Function) → Validates token using Firebase Admin SDK
5. **Server** → Extracts userId from token and attaches to request
6. **Server** → Proceeds with database operations using userId

### Key Files

- `server/api-handler/index.ts` - Source for Vercel function (builds to `api/index.js`)
- `server/middleware/auth.ts` - Firebase Admin authentication middleware
- `server/routes.ts` - All API route definitions
- `server/storage.ts` - Database operations using Drizzle ORM
- `shared/schema.ts` - Database schema and Zod validation schemas

### Build Process

The build command runs three steps:
1. `vite build` - Builds the frontend React app
2. `esbuild server/index.ts` - Bundles the Express server (for traditional hosting)
3. `esbuild server/api-handler/index.ts` - Bundles the Vercel serverless function

## Maintenance

### Updating API Routes

When you add new routes in `server/routes.ts`:

1. Run `npm run build` to rebuild `api/index.js`
2. Commit the updated `api/index.js`
3. Push to trigger Vercel deployment

### Database Schema Changes

When you modify `shared/schema.ts`:

1. Run `npm run db:push` to sync with database
2. Test locally first
3. Deploy changes to Vercel
4. Vercel will use the same DATABASE_URL to connect to your Neon database
