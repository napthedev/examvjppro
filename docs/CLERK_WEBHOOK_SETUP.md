# Clerk Webhook Setup Guide

## Overview

This project automatically stores user data from Clerk into the Convex database using webhooks. When users sign up, update their profile, or delete their account in Clerk, this data is automatically synchronized with your Convex database.

## Setup Instructions

### 1. Deploy Your Convex Functions

First, make sure your Convex functions are deployed:

```bash
npx convex deploy
```

### 2. Configure Webhook in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Webhooks** in the left sidebar
3. Click **+ Add Endpoint**

### 3. Set Webhook URL

Set the **Endpoint URL** to: 
```
https://YOUR_DEPLOYMENT_NAME.convex.site/clerk-users-webhook
```

Replace `YOUR_DEPLOYMENT_NAME` with your actual Convex deployment name. You can find this:
- In your `.env.local` file as part of `NEXT_PUBLIC_CONVEX_URL`
- On your [Convex Dashboard](https://dashboard.convex.dev/) under deployment settings

**Example:** `https://happy-horse-123.convex.site/clerk-users-webhook`

### 4. Configure Message Filtering

In the **Message Filtering** section:
1. Select **user** for all user events
2. Make sure the following events are selected:
   - `user.created`
   - `user.updated` 
   - `user.deleted`

### 5. Save and Get Signing Secret

1. Click **Create** to save the endpoint
2. Copy the **Signing Secret** (starts with `whsec_`)

### 6. Set Environment Variable in Convex

1. Go to your [Convex Dashboard](https://dashboard.convex.dev/)
2. Navigate to **Settings** > **Environment Variables**
3. Add a new environment variable:
   - **Name:** `CLERK_WEBHOOK_SECRET`
   - **Value:** The signing secret you copied from Clerk (starts with `whsec_`)

### 7. Test the Integration

1. Deploy your changes: `npx convex deploy`
2. Sign up with a new user or update an existing user profile in Clerk
3. Check your Convex database to see if the user data was automatically stored

## How It Works

### Database Schema

The user data is stored in a `users` table with the following structure:

```typescript
users: defineTable({
  name: v.string(),
  externalId: v.string(), // Clerk user ID
  email: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("byExternalId", ["externalId"])
```

### Available Functions

- **`api.users.current`** - Query to get the current authenticated user
- **`getCurrentUser(ctx)`** - Helper function to get current user in mutations/queries
- **`getCurrentUserOrThrow(ctx)`** - Helper function that throws if user not found

### Using User Data in Your Functions

```typescript
import { getCurrentUserOrThrow } from "./users";

export const createSomething = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    return await ctx.db.insert("items", {
      title: args.title,
      userId: user._id, // Reference to the user
      createdAt: Date.now(),
    });
  },
});
```

### Using the Custom Hook in React

Use the `useCurrentUser` hook instead of Clerk's `useUser` to ensure the user is stored in Convex:

```typescript
import { useCurrentUser } from "@/hooks/use-current-user";

export function MyComponent() {
  const { isLoading, isAuthenticated, user } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome {user.name}!</div>;
}
```

## Troubleshooting

### User Data Not Appearing

1. Check that the webhook URL is correct
2. Verify the `CLERK_WEBHOOK_SECRET` environment variable is set correctly
3. Check Convex function logs for any errors
4. Ensure all required events are selected in Clerk webhook settings

### Authentication Issues

The `useCurrentUser` hook will show `isLoading: true` until:
1. Clerk authentication is complete
2. User data is successfully stored in Convex

This ensures your app only renders authenticated content after the user is properly stored in your database.

## Security Notes

- The webhook endpoint validates all requests using the signing secret
- Only properly signed requests from Clerk will be processed
- The webhook is an internal mutation, not accessible from client code
- User data is automatically cleaned up when accounts are deleted in Clerk