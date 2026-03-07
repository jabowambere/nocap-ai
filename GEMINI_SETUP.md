# Google Gemini API Setup Guide

## ✅ Migration Complete!

Your NoCap AI app now uses **Google Gemini** instead of OpenAI.

## 🔑 Get Your Free Gemini API Key

1. **Visit**: https://aistudio.google.com/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key"
4. **Copy** the generated key

## 📝 Configure Your App

### Backend (.env file)

Replace `your-gemini-api-key-here` with your actual key:

```env
GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

### Render Deployment

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
5. Save changes (service will auto-redeploy)

## 🎯 Free Tier Limits

- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per minute**

This is MORE than enough for your app!

## 🚀 Test It

1. Restart your backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Analyze some content - you should see:
   ```
   ✅ Gemini AI initialized
   🤖 Calling Gemini AI for comprehensive analysis...
   ✅ Gemini response: {...}
   ```

## 💡 Benefits Over OpenAI

- ✅ **Free tier** (OpenAI charges after $5 credit)
- ✅ **Faster** responses
- ✅ **Higher limits** (1,500/day vs OpenAI's 200/day on free tier)
- ✅ **Better multilingual** support
- ✅ **No credit card** required

## 🔧 What Changed

- Replaced `openai` package with `@google/generative-ai`
- Using `gemini-1.5-flash` model (fast & accurate)
- Updated indicator text to show "Google Gemini AI"
- Same analysis quality, better pricing!

## 📊 Model Details

**Model**: gemini-1.5-flash
- Fast inference
- High quality analysis
- Optimized for fact-checking tasks
- JSON output support

## ⚠️ Troubleshooting

**Error: "Gemini not available"**
- Check your API key is set in .env
- Restart your backend server
- Verify key at https://aistudio.google.com/apikey

**Error: "Quota exceeded"**
- You've hit the 1,500/day limit
- Wait 24 hours or upgrade to paid tier
- Paid tier: $0.075 per 1M tokens (very cheap!)

## 🎉 You're All Set!

Your app now uses Google Gemini for AI-powered fake news detection with a generous free tier.
