# Fix: Authentication Access Control Error

## Problem

Users were seeing "Error Loading Mindmaps - You are not allowed to perform this action" error on the home page even when authenticated.

![Error Screenshot](../screenshot-error.png)

## Root Cause

The issue was in how Next.js Server Components handle authentication cookies when making API requests to the backend.

### Technical Details

1. **Server Components vs Client Components**:
   - `apps/mindmap-web/app/page.tsx` is a **Server Component** (runs on the server)
   - When Server Components call `fetch()`, they run on the Node.js server, not in the browser
   - The `credentials: 'include'` option only works in browser contexts

2. **Cookie Forwarding**:
   - Browser cookies are NOT automatically forwarded from Server Components to backend APIs
   - The authentication cookies from the user's browser session were not being sent to Payload CMS
   - Payload CMS saw the request as unauthenticated and returned 403 Forbidden

3. **Error Flow**:
   ```
   Browser → Next.js Server (Server Component) → Payload CMS API
                                                   ↑
                                                   No cookies!
   ```

## Solution

Forward cookies manually from the incoming request to the backend API in Server Components.

### Changes Made

1. **Updated `lib/api.ts`** - Added optional `cookies` parameter to API functions:
   - `getMindmaps(cookies?: string)`
   - `getMindmap(id: string, cookies?: string)`
   - `getMindmapNodes(mindmapId: string, cookies?: string)`

2. **Updated `app/page.tsx`** - Forward cookies from the request:
   ```typescript
   import { cookies } from 'next/headers'
   
   export default async function Home() {
     const cookieStore = await cookies()
     const cookieHeader = cookieStore.toString()
     
     const result = await getMindmaps(cookieHeader)
     // ...
   }
   ```

3. **Added `cache: 'no-store'`** - Prevent caching of authenticated requests

### Code Changes

**Before:**
```typescript
export async function getMindmaps(): Promise<ApiResult<Mindmap[]>> {
  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ❌ Doesn't work in Server Components
  })
  // ...
}
```

**After:**
```typescript
export async function getMindmaps(cookies?: string): Promise<ApiResult<Mindmap[]>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // ✅ Forward cookies from Server Component
  if (cookies) {
    headers['Cookie'] = cookies
  }

  const response = await fetch(`${CMS_URL}/api/mindmaps`, {
    method: 'GET',
    headers,
    credentials: 'include', // Still needed for client-side calls
    cache: 'no-store', // Don't cache authenticated requests
  })
  // ...
}
```

## Testing

Created comprehensive e2e tests in `e2e/auth-access-control.spec.ts`:

- ✅ Redirect to login when not authenticated
- ✅ Show error when accessing mindmaps without authentication
- ✅ Authenticated user should see mindmap list
- ✅ Should NOT show access denied error for authenticated user
- ✅ Should create mindmap and see it in list
- ✅ Handle API errors gracefully
- ✅ Handle network errors gracefully
- ✅ Maintain authentication across page reloads
- ✅ Send credentials with API requests

## Key Learnings

1. **Server Components and Cookies**:
   - Always use `cookies()` from `next/headers` in Server Components
   - Forward cookies manually to backend APIs
   - Use `cache: 'no-store'` for authenticated requests

2. **Client Components**:
   - Client Components (with `'use client'`) run in the browser
   - `credentials: 'include'` works automatically in Client Components
   - No need to forward cookies manually

3. **Hybrid Approach**:
   - Make API functions accept optional `cookies` parameter
   - Server Components pass cookies explicitly
   - Client Components omit the parameter (uses browser cookies)

## Related Files

- `apps/mindmap-web/lib/api.ts` - API functions with cookie forwarding
- `apps/mindmap-web/app/page.tsx` - Home page Server Component
- `e2e/auth-access-control.spec.ts` - E2E tests for authentication
- `apps/mindmap-cms/src/collections/Mindmaps.ts` - Access control configuration

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Payload CMS Access Control](https://payloadcms.com/docs/access-control/overview)

