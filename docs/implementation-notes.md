# Implementation Notes

## 2025-10-03 Backend OpenAPI snapshot

- Access to `http://localhost:8787/openapi.json` via curl (Chrome not available in sandbox).
- Available tags: Bookings, Users, Auth, Admin, Gacha, Schedules, Bands, Videos.
- Security schemes: session cookie (`authjs.session-token` or `__Secure-authjs.session-token`) and `X-API-Key` header (for some endpoints).
- Core paths discovered:
  - `GET /booking` (range query), `POST /booking` (requires session cookie), `GET /booking/{bookingId}`, `POST /booking/{bookingId}/verify`, `GET /booking/logs`, admin booking ban endpoints.
  - `GET /users/select`, `GET /users/{userId}/profile` for user data.
  - Auth flows: `/auth/signin`, `/auth/{provider}` callback, `/auth/session`, `/auth/signout`, `/auth/padlock`.
  - Admin management: `/admin/users`, `/admin/users/{userId}`, role updates, padlocks endpoints.
  - Domain-specific: `/gacha/users/{userId}`, schedules (`/schedule`, `/schedule/{scheduleId}`), band management, and video search/playlists endpoints.
- Many mutating endpoints require authenticated session via cookie; ensure frontend fetch wrappers forward cookies and handle 401.


## 2025-10-03 FRONTEND PROJECT_OVERVIEW highlights

- Next.js 15.3.2 App Router with TypeScript, Tailwind/daisyUI, NextAuth LINE auth, Prisma (legacy) with PostgreSQL.
- Features: booking system (`/booking`), user profile (`/user`), video archive (`/video`), gacha gamification, schedule coordination (`/schedule`), admin console (`/admin`).
- Previous architecture relied on server actions (`actions.ts`) and `lib/repository.ts` within each feature (`booking`, `gacha`, `schedule`, `user`, `video`) for Prisma access.
- New goal: replace these with thin `/api` BFF handlers backed by backend service, using SWR on client pages/components.
- Authentication: NextAuth.js session cookies; some admin/booking flows require padlock password gating.
- Integrations: Cloudflare R2 signed URLs, YouTube Data API, LIFF, analytics. Some endpoints not yet implemented in backend; placeholder routes required on frontend.
## 2025-10-03 TypeScript baseline

`npm run ts` currently fails with numerous missing module errors due to removal of legacy server actions:
- Pages under `src/app` still import `@/lib/r2`, `@/core/actions`, feature `components/actions` modules, `next-auth/react` client helpers, etc.
- Several files now violate `noImplicitAny` because former helper types were removed (`src/app/schedule/new/page.tsx`, `src/app/sitemap.ts`, `src/components/interactive/UserSelectPopup.tsx`).
- Admin components rely on `./action` modules that no longer exist.
The refactor must introduce new thin `/api` fetch utilities and SWR hooks to replace these imports.

## 2025-10-03 Next.js v15 research (Context7)

- Client data fetching should prefer `useSWR` for caching, revalidation, and suspense-friendly loading states.
- Route Handlers (`route.ts`) act as lightweight BFF endpoints for Client Components; avoid calling them from Server Components unnecessarily.
- Server Components default to cached `fetch` (`force-cache`), but can opt into dynamic data via `{ cache: 'no-store' }` or `next: { revalidate: seconds }`.
- `SWRConfig` fallback in `layout.tsx` enables server-prefetched data for initial render without blocking.
- `fetch` requests can be tagged for selective revalidation (`next: { tags: [...] }`) aligning with backend invalidation.
- Using dynamic APIs like `cookies()` opts route into dynamic rendering; wrap dynamic sections in `<Suspense>` or isolate as needed.
