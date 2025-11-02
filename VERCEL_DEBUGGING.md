# Debugging Your Vercel Deployment

## 🔍 How to See the Actual Error

Now that I've added better error logging, here's how to see what's **really** going wrong on Vercel:

### Step 1: Check Vercel Function Logs

1. Go to your Vercel dashboard: https://vercel.com
2. Click on your project
3. Click on "Deployments" tab
4. Click on your most recent deployment
5. Click on "Functions" tab
6. Click on `/api/index.ts`
7. You'll see the **actual error message** with details

### Step 2: Check Browser Network Tab

1. Open your deployed app
2. Open browser DevTools (F12)
3. Go to "Network" tab
4. Try to create a task
5. Click on the failed request
6. Look at the "Response" tab
7. You'll see the error with `details` field showing the real error

## 🔧 Common Errors and Solutions

### Error: "DATABASE_URL must be set"

**Cause**: Environment variable not set in Vercel

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon PostgreSQL connection string (format: `postgresql://user:password@host/database?sslmode=require`)
3. Select all environments (Production, Preview, Development)
4. Click "Save"
5. **IMPORTANT**: Redeploy your app (Vercel → Deployments → Three dots → Redeploy)

### Error: "relation 'tasks' does not exist"

**Cause**: Database schema not pushed to your Neon database

**Solution**:
You need to push the schema to your Neon database. Do this **once**:

```bash
# Option 1: Push from Replit (if DATABASE_URL points to Neon)
npm run db:push

# Option 2: Push with your Neon connection string
DATABASE_URL="your_neon_connection_string" npm run db:push
```

This creates the `tasks` and `check_ins` tables in your Neon database.

### Error: "Invalid task data" with validation details

**Cause**: The request body doesn't match the expected schema

**Solution**:
Check the `details` field in the error response. It will tell you exactly what's wrong:
- Missing required fields
- Wrong data types
- Invalid values

Common issues:
- `name` is required
- `category` is required
- `metricType` must be "duration" or "count"
- `target` must be a number
- `intervalMinutes` must be a number

### Error: Function timeout

**Cause**: Database query taking too long or connection issues

**Solution**:
1. Check your Neon database is accessible
2. Verify the connection string is correct
3. Check if there are any network issues

## ✅ Verification Checklist

Before troubleshooting, verify:

- [ ] `DATABASE_URL` is set in Vercel Environment Variables
- [ ] Database schema has been pushed to Neon (`npm run db:push`)
- [ ] The Neon database connection string is correct
- [ ] You've redeployed after adding environment variables
- [ ] Your Neon database is active (not sleeping/paused)

## 🎯 Quick Test

To verify everything works:

1. **Test locally first**:
   ```bash
   # Make sure it works on Replit
   npm run dev
   # Try creating a task
   ```

2. **Push schema to Neon**:
   ```bash
   DATABASE_URL="your_neon_url" npm run db:push
   ```

3. **Deploy to Vercel**:
   - Push code to Git
   - Vercel auto-deploys
   - Add DATABASE_URL in settings
   - Redeploy

4. **Check it works**:
   - Visit your Vercel URL
   - Open DevTools → Network tab
   - Try creating a task
   - Check the request/response

## 📞 Still Having Issues?

If you're still stuck, share:
1. The error message from Vercel Function Logs (screenshot or text)
2. The error details from browser Network tab
3. Whether you've pushed the schema to Neon
4. Whether DATABASE_URL is set in Vercel

This will help identify the exact issue!
