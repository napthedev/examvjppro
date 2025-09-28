# Vercel Deployment Guide for ExamVjpPro

Quick guide to deploy your ExamVjpPro application to Vercel with proper OAuth configuration.

## Prerequisites

- [Vercel account](https://vercel.com) and [Convex account](https://convex.dev)
- OAuth apps configured (Google/GitHub)
- Repository pushed to GitHub

## Quick Deployment Steps

### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Import your GitHub repository
3. Add environment variables in **Settings** → **Environment Variables**:
   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
   CONVEX_SITE_URL=https://your-vercel-app.vercel.app
   ```
4. Click "Deploy"

### 2. Update OAuth Redirect URIs

**Google OAuth** ([Google Cloud Console](https://console.cloud.google.com/)):
- Authorized redirect URIs: `https://your-convex-deployment.convex.site/api/auth/callback/google`
- Authorized origins: `https://your-vercel-app.vercel.app`

**GitHub OAuth** ([GitHub Settings](https://github.com/settings/developers)):
- Authorization callback URL: `https://your-convex-deployment.convex.site/api/auth/callback/github`
- Homepage URL: `https://your-vercel-app.vercel.app`

### 3. 🚨 **CRUCIAL** - Run Production Setup

⚠️ **This step is essential for OAuth to work:**

```bash
npx @convex-dev/auth --prod
```

This configures Convex Auth for production and sets up JWT signing keys.

### 4. Set Convex Environment Variables

```bash
npx convex env set CONVEX_SITE_URL https://your-vercel-app.vercel.app
npx convex env set AUTH_GOOGLE_ID your_google_client_id
npx convex env set AUTH_GOOGLE_SECRET your_google_client_secret
npx convex env set AUTH_GITHUB_ID your_github_client_id
npx convex env set AUTH_GITHUB_SECRET your_github_client_secret
```

### 5. Test Authentication
Visit your deployed app and test Google/GitHub sign-in flows.

## Environment Variables Checklist

**Vercel:**
- ✅ `NEXT_PUBLIC_CONVEX_URL`
- ✅ `CONVEX_SITE_URL`

**Convex:**
- ✅ `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`
- ✅ `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`
- ✅ `CONVEX_SITE_URL`

## Custom Domain (Optional)

1. Add domain in Vercel project settings
2. Update OAuth redirect URIs with your custom domain
3. Update Convex: `npx convex env set CONVEX_SITE_URL https://your-domain.com`
4. Re-run: `npx @convex-dev/auth --prod`

## Troubleshooting

**OAuth not working?**
- ✅ Run `npx @convex-dev/auth --prod` (most common fix)
- ✅ Verify redirect URIs match exactly
- ✅ Check all environment variables are set

**Build failing?**
- Run `npm run build` locally first
- Check TypeScript errors

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Convex Auth Docs](https://labs.convex.dev/auth)

**Remember:** `npx @convex-dev/auth --prod` is essential for production OAuth!