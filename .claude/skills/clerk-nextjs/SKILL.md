---
name: clerk-nextjs
description: Enforces correct Clerk authentication integration with Next.js App Router. Use when adding, modifying, or reviewing Clerk auth code — including middleware setup, ClerkProvider, sign-in/sign-up components, server-side auth(), and protected routes. Prevents use of deprecated patterns like authMiddleware, _app.tsx, or pages/-based auth.
---

# Clerk + Next.js App Router Integration

## Verification Checklist

Before writing or reviewing any Clerk code, verify:

1. Middleware uses `clerkMiddleware()` from `@clerk/nextjs/server` in `src/middleware.ts`
2. App is wrapped with `<ClerkProvider>` in `app/layout.tsx`
3. All imports come from `@clerk/nextjs` (client) or `@clerk/nextjs/server` (server)
4. App Router structure only — no `_app.tsx` or `pages/` references
5. Only placeholder values in code examples (e.g., `YOUR_PUBLISHABLE_KEY`)

## Required Patterns

### Middleware (`src/middleware.ts`)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Layout (`app/layout.tsx`)

```typescript
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Server Components / Server Actions

```typescript
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) redirect('/sign-in')
```

### Client Components

```typescript
import { useUser } from '@clerk/nextjs'

const { user, isLoaded, isSignedIn } = useUser()
```

### Environment Variables (`.env.local` only)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

## Forbidden Patterns

```typescript
// NEVER use:
import { authMiddleware } from '@clerk/nextjs'       // deprecated
import { withAuth } from '@clerk/nextjs'             // deprecated
// NEVER reference _app.tsx or pages/ directory for auth
```
