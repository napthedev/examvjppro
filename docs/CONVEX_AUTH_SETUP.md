# Convex Auth Setup Guide

This project uses [Convex Auth](https://labs.convex.dev/auth) for authentication, supporting both Google OAuth and GitHub OAuth authentication.

## Features

- **Google OAuth**: Quick sign-in with Google accounts
- **GitHub OAuth**: Secure authentication via GitHub accounts
- **Account Linking**: Users can link multiple providers to the same account if they use the same email
- **Next.js Integration**: Server-side authentication support with middleware
- **Automatic User Management**: User profiles are automatically created and managed

## Authentication Providers

### 1. Google OAuth
- Users can sign in with their Google accounts
- Requires `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` environment variables
- Accounts are automatically linked if the same email is used

### 2. GitHub OAuth
- Users can sign in with their GitHub accounts
- Requires `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` environment variables
- Accounts are automatically linked if the same email is used

## Environment Variables

Set up these environment variables in your Convex deployment:

```bash
# Google OAuth Configuration
npx convex env set AUTH_GOOGLE_ID your_google_client_id
npx convex env set AUTH_GOOGLE_SECRET your_google_client_secret

# GitHub OAuth Configuration  
npx convex env set AUTH_GITHUB_ID your_github_client_id
npx convex env set AUTH_GITHUB_SECRET your_github_client_secret
```

## Setting up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your authorized redirect URIs:
   - For development: `https://your-deployment.convex.site/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your Convex environment variables

## Setting up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: ExamVjpPro
   - **Homepage URL**: `https://your-domain.com` (or `http://localhost:3000` for development)
   - **Authorization callback URL**: `https://your-deployment.convex.site/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and Client Secret to your Convex environment variables

## Account Linking

The system automatically links accounts when:
- A user signs in with Google using email A
- Later signs in with GitHub using the same email A
- Both accounts will be linked to the same user profile

This allows users to use either authentication method interchangeably.

## Usage in Components

### Check Authentication Status
```tsx
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function MyComponent() {
  return (
    <>
      <AuthLoading>Loading...</AuthLoading>
      <Authenticated>
        <p>User is signed in!</p>
      </Authenticated>
      <Unauthenticated>
        <p>Please sign in</p>
      </Unauthenticated>
    </>
  );
}
```

### Get Current User
```tsx
import { useCurrentUser } from "@/hooks/use-current-user";

function UserProfile() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not signed in</div>;
  
  return <div>Hello {user?.name}!</div>;
}
```

### Sign In/Out Actions
```tsx
import { useAuthActions } from "@convex-dev/auth/react";

function AuthButtons() {
  const { signIn, signOut } = useAuthActions();
  
  return (
    <>
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
      <button onClick={() => signIn("github")}>
        Sign in with GitHub
      </button>
      <button onClick={() => signOut()}>
        Sign out
      </button>
    </>
  );
}
```

## Server-Side Authentication

Access user data in Convex functions:

```ts
import { getAuthUserId } from "@convex-dev/auth/server";

export const myQuery = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db.get(userId);
    return user;
  },
});
```

## Middleware Protection

Routes are protected using Next.js middleware in `app/middleware.ts`:

- `/dashboard/*` - Protected (requires authentication)
- `/signin` - Redirects to dashboard if already authenticated
- Other routes - Public

## Migration from Clerk

This project was migrated from Clerk to Convex Auth. Key changes:

1. **Database Schema**: Users table now uses Convex Auth's `authTables`
2. **Authentication Flow**: New sign-in page with Google OAuth and GitHub OAuth
3. **User Management**: No more webhooks - users are managed directly by Convex Auth
4. **API Changes**: Updated to use `getAuthUserId()` instead of Clerk's user ID
5. **Frontend**: Replaced Clerk components with Convex Auth hooks

## Security Features

- **JWT Tokens**: Secure authentication using industry-standard JWTs
- **Rate Limiting**: Built-in protection against brute force attacks
- **Secure Sessions**: Sessions are managed securely with proper expiration
- **OAuth Security**: Secure OAuth 2.0 flows for Google and GitHub authentication
- **CSRF Protection**: Protected against cross-site request forgery

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure your OAuth redirect URIs match exactly
2. **GitHub OAuth not working**: Verify your GitHub OAuth app callback URL configuration  
3. **Authentication not persisting**: Verify your JWT configuration in Convex
4. **Account linking not working**: Ensure both providers use the same email address

### Debug Mode

Enable debug logging by checking your Convex function logs in the dashboard.

## Further Reading

- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Google OAuth Setup](https://labs.convex.dev/auth/config/oauth/google)
- [GitHub OAuth Setup](https://labs.convex.dev/auth/config/oauth/github)
- [Next.js Integration](https://labs.convex.dev/auth/authz/nextjs)