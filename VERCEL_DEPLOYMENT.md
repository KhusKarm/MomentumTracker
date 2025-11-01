# Deploying Momentum to Vercel

Your Momentum app is now ready to deploy to Vercel! The application has been adapted to work in serverless environments.

## Changes Made

✅ **Database Connection**: Switched from WebSocket to HTTP driver (serverless-compatible)
✅ **API Handler**: Created serverless function wrapper for Express backend
✅ **Configuration**: Added `vercel.json` with proper routing
✅ **Build Process**: Verified build outputs to `dist/public`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in with GitHub/GitLab/Bitbucket

2. **Connect Your Repository**
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**
   - In project settings, add:
     - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - Get your DATABASE_URL from Replit secrets or Neon dashboard

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a live URL (e.g., `momentum-tracker.vercel.app`)

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

### If the API doesn't respond:
- Check that `DATABASE_URL` is set in Vercel environment variables
- Verify the deployment logs in Vercel dashboard
- Ensure your Neon database allows connections from Vercel's IP range (usually enabled by default)

### If the frontend loads but API fails:
- Check browser console for CORS errors
- Verify API routes are prefixed with `/api/`
- Check Vercel function logs for errors

## Post-Deployment

Once deployed, your Momentum app will:
- ✅ Have a public URL accessible from anywhere
- ✅ Auto-scale based on traffic
- ✅ Work with your existing Neon PostgreSQL database
- ✅ Support custom domains
- ✅ Auto-deploy on Git pushes (if connected to GitHub)

Enjoy your deployed Momentum tracker! 🚀
