# Deploying Momentum to Vercel

Your Momentum app is now ready to deploy to Vercel! The application has been fully optimized for serverless deployment.

## Changes Made

✅ **Database Connection**: Uses Neon HTTP driver (serverless-compatible)
✅ **API Handler**: Created optimized serverless function wrapper at `api/index.ts`
✅ **Configuration**: Updated `vercel.json` with proper routing
✅ **Build Process**: Configured to output to `dist/public`
✅ **TypeScript Errors**: Fixed all compilation issues
✅ **Environment Variables**: Set up proper environment configuration

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in with GitHub/GitLab/Bitbucket

2. **Connect Your Repository**
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables** ⚠️ IMPORTANT
   - In project settings → Environment Variables, add:
     - **Variable Name**: `DATABASE_URL`
     - **Value**: Your Neon PostgreSQL connection string
       ```
       postgresql://username:password@host/database?sslmode=require
       ```
   - Add it for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Vercel will:
     - Run `npm run build` to build the frontend
     - Deploy the API handler from `api/index.ts`
     - Serve the frontend from `dist/public`
   - You'll get a live URL (e.g., `momentum-tracker.vercel.app`)

5. **Verify Deployment**
   - Visit your deployed URL
   - Check that the frontend loads
   - Try creating a task to verify the backend API is working
   - Check Vercel Function Logs if you encounter any errors

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variable**
   ```bash
   vercel env add DATABASE_URL
   ```
   Then paste your Neon PostgreSQL connection string

5. **Redeploy with Environment Variable**
   ```bash
   vercel --prod
   ```

## Important Notes

- **Database**: Your Neon PostgreSQL database works from anywhere, no changes needed
- **Environment Variables**: Make sure to add `DATABASE_URL` in Vercel's dashboard
- **Custom Domain**: You can add a custom domain in Vercel's project settings
- **Automatic Deployments**: Connect to GitHub for automatic deployments on push

## Troubleshooting

### If the frontend doesn't load:
- **Issue**: White screen or "Failed to load module" errors
- **Cause**: vercel.json routing was rewriting asset requests
- **Fix**: ✅ ALREADY FIXED - Updated vercel.json to use rewrites instead of routes
- **Verify**: Check browser DevTools Network tab - you should see `/assets/*.js` and `/assets/*.css` loading with 200 status

### If the API doesn't respond:
- **Check DATABASE_URL**: Ensure it's set in Vercel Environment Variables
  - Go to Project Settings → Environment Variables
  - Verify the connection string matches your Neon database
- **Check Function Logs**: Go to Deployments → Your deployment → Functions
  - Look for errors in the `/api/index.ts` function logs
- **Verify Database**: Ensure your Neon database allows connections (default: enabled)

### If tasks won't create:
- **Check Browser Console**: Look for API request errors (Network tab)
- **Verify API Route**: Requests should go to `https://your-app.vercel.app/api/tasks`
- **Check Function Logs**: See if the serverless function is receiving requests
- **Database Connection**: Ensure DATABASE_URL is correct and database is accessible

## Post-Deployment

Once deployed, your Momentum app will:
- ✅ Have a public URL accessible from anywhere
- ✅ Auto-scale based on traffic
- ✅ Work with your existing Neon PostgreSQL database
- ✅ Support custom domains
- ✅ Auto-deploy on Git pushes (if connected to GitHub)

Enjoy your deployed Momentum tracker! 🚀
