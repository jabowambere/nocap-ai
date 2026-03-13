# Clerk to Supabase User Sync Setup

## How It Works

When users sign in with Clerk, they are automatically synced to Supabase in two ways:

1. **Automatic Frontend Sync** (Primary) - After successful login, the frontend automatically calls the sync endpoint
2. **Clerk Webhook** (Backup) - Clerk sends webhook events when users are created/updated/deleted

## ✅ Already Configured

- ✅ Frontend auto-sync in `ClerkAuth.js`
- ✅ Manual sync endpoint at `/api/sync/sync-user`
- ✅ Webhook endpoint at `/api/webhooks/clerk-webhook`
- ✅ First user automatically becomes admin

## 🔧 Setup Clerk Webhook (Optional but Recommended)

### Step 1: Get Your Webhook URL

**Local Development:**
```
http://localhost:3001/api/webhooks/clerk-webhook
```

**Production (Render):**
```
https://your-backend-url.onrender.com/api/webhooks/clerk-webhook
```

### Step 2: Configure in Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL
6. Select these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)

### Step 3: Add Webhook Secret to Environment

**Local (.env):**
```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

**Render:**
1. Go to your backend service
2. Environment tab
3. Add variable:
   - Key: `CLERK_WEBHOOK_SECRET`
   - Value: `whsec_your_secret_here`

### Step 4: Install Webhook Package

```bash
cd backend
npm install svix
```

## 🧪 Testing

### Test Frontend Auto-Sync

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm start`
3. Sign in with a new account
4. Check backend logs for: `✅ User synced to Supabase`
5. Check Supabase users table - new user should appear

### Test Webhook (if configured)

1. Sign up a new user in Clerk
2. Check backend logs for: `📥 Webhook received: user.created`
3. Check Supabase users table

### Verify in Supabase

```sql
-- Run in Supabase SQL Editor
SELECT * FROM users ORDER BY created_at DESC;
```

You should see:
- `clerk_id` - Clerk user ID
- `email` - User email
- `username` - User name
- `role` - 'admin' for first user, 'user' for others

## 🔍 Troubleshooting

### User Not Appearing in Supabase

**Check 1: Frontend Logs**
- Open browser console
- Look for: `✅ User synced to Supabase`
- If error, check API_URL in frontend .env

**Check 2: Backend Logs**
- Look for sync endpoint being called
- Check for any Supabase errors

**Check 3: Supabase Table**
```sql
-- Check if users table exists
SELECT * FROM users LIMIT 1;
```

**Check 4: Manual Sync**
If auto-sync fails, you can manually sync:
```javascript
// In browser console after signing in
fetch('http://localhost:3001/api/sync/sync-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clerkId: 'user_xxx',
    email: 'user@example.com',
    username: 'username'
  })
});
```

### Webhook Not Working

**Check 1: Webhook Secret**
- Verify `CLERK_WEBHOOK_SECRET` is set in .env
- Restart backend after adding

**Check 2: Webhook URL**
- Must be publicly accessible (use ngrok for local testing)
- Check Clerk dashboard webhook logs

**Check 3: Webhook Events**
- Ensure `user.created`, `user.updated`, `user.deleted` are selected

## 🚀 Production Deployment

### Render Environment Variables

Add these to your Render backend service:

```
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Netlify Environment Variables

Add these to your Netlify frontend:

```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Update Clerk Webhook URL

Change webhook URL in Clerk dashboard to:
```
https://your-backend.onrender.com/api/webhooks/clerk-webhook
```

## 📊 How Admin Sees Users

When admin views the dashboard:
1. Admin dashboard fetches from `/api/detection/all-analyses`
2. Backend joins `analyses` table with `users` table
3. Shows username/email for each analysis
4. Anonymous analyses show as "Anonymous"

## 🎯 User Flow

```
User Signs In (Clerk)
    ↓
Frontend detects sign-in
    ↓
Calls /api/sync/sync-user
    ↓
Backend checks if user exists in Supabase
    ↓
If new: Creates user (first user = admin)
    ↓
User can now analyze content
    ↓
Analyses saved with user's clerk_id
    ↓
Admin can see all analyses with usernames
```

## ✨ Features

- ✅ First user automatically becomes admin
- ✅ Subsequent users are regular users
- ✅ Admin can see all analyses with usernames
- ✅ Users can see their own analysis history
- ✅ Anonymous analyses still work (no login required)
- ✅ Automatic sync on every login (no manual action needed)

## 🔐 Security

- Clerk handles authentication
- Supabase stores user data
- JWT tokens verify requests
- Webhook signatures verify Clerk events
- Admin role checked on backend for sensitive endpoints
