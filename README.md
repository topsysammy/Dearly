# Dearly — Put your thoughts on paper

A sketchbook-style letter app: sign up, write handwritten-style letters on customisable digital stationery,
export them as PNG/JPG/PDF, or send a link that opens as a sealed, animated envelope.

**Flow:** `/` → first visit: `/welcome` (onboarding) → `/signup` or `/login` → `/home`.
Signed-in screens: Home (`/home`), Letters (`/letters`, saved + sent), Profile (`/profile`), Templates, the editor
(`/write/[id]`) and Preview/Send (`/preview/[id]`). Recipient links (`/letter/[token]`) stay public — no account needed.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Without `DATABASE_URL`, `next dev` uses an **embedded on-disk PostgreSQL (PGlite)** in `./.data/pglite`
so the full share → open → revoke flow works locally. This fallback never runs in production.

## Database (required in production)

Accounts, drafts and share links all live in a PostgreSQL-compatible database (Neon, Railway, RDS, self-hosted…).
Without `DATABASE_URL` in production, the app shows a "not connected yet" screen instead of the login.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection string. Add `?sslmode=require` for hosted providers. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public origin used to build share URLs, e.g. `https://dearly.app`. |
| `DATABASE_POOL_MAX` | No | Connection pool size (default 5). |
| `DEARLY_DISABLE_DEV_DB` | No | Set to `1` to disable the dev PGlite fallback. |

The table is created automatically on first use, or run `DATABASE_URL=… npm run db:migrate` (schema: `db/schema.sql`).
Tables: `users`, `sessions`, `letters`, `shared_letters`.

## Architecture

- **One renderer** — `src/components/paper/Paper.tsx` renders the letter at true logical size (A4 794×1123, A5 559×794 CSS px).
  The editor, previews, thumbnails, exports and the recipient view all use it; `FittedPaper` scales it to fit.
- **Letter document** — `src/lib/letter/types.ts`, validated server-side by `src/lib/letter/schema.ts` (zod).
- **Accounts** — `src/lib/server/auth.ts`: scrypt password hashes, 30-day httpOnly `SameSite=Lax` session cookies
  (only a SHA-256 of the session token is stored). Route groups `(app)` and `(studio)` check the session server-side.
- **Drafts** — stored per account (`/api/letters`), autosaved from the editor. Drafts left in IndexedDB by the earlier
  device-only version are imported into the account automatically on first sign-in.
- **Exports** — `src/lib/export.ts`: html-to-image at 3× (~300 dpi) after fonts load; jsPDF at true paper size.
- **Envelope** — `src/components/envelope/`: separate layers (back, letter, pocket, 3D flap, split wax seal) choreographed with
  Framer Motion; touch/mouse/keyboard, reduced-motion fade, failsafe reveal, replay.

### API
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` · `/login` · `/logout` | Create account / sign in / sign out (sets or clears the session cookie) |
| GET / PATCH | `/api/auth/me` | Current user / change display name |
| POST | `/api/auth/delete` | Delete the account (password required); revokes all of its links first |
| GET | `/api/letters` | The account's drafts |
| GET / PUT / DELETE | `/api/letters/[id]` | Read / save / delete one draft (scoped to the owner) |
| POST | `/api/share` | Seal an immutable snapshot owned by the account; returns `url` |
| GET | `/api/shares` | The account's links with live status and open counts |
| POST | `/api/share/revoke` | Revoke — allowed for the owning account (or with a legacy revoke key) |
| POST | `/api/share/claim` | Attach a link made before accounts existed (proved by its revoke key) |
| GET | `/api/letter/[token]` | Recipient fetch: 200 / 404 invalid / 410 revoked or expired |
| POST | `/api/letter/[token]/opened` | Counts envelope openings (no content, no personal data) |

### Security & privacy
- 192-bit public tokens and separate 256-bit revoke keys; only SHA-256 hashes are stored. No sequential IDs exposed.
- The public token can't revoke; only the owning account can. The owner's copy of each link is stored so it shows on all
  their devices (the snapshot itself is already in the database, so this adds no new exposure).
- Cookie-authenticated writes require `application/json` and a same-origin `Origin`, which blocks cross-site form posts.
- `/letter/*` and `/api/*` send `noindex` and `no-referrer`; link previews reveal nothing about the letter.
- Letter contents and tokens are never logged. Inputs are size-limited and schema-validated; light per-instance rate limiting
  (use your platform's limiter for hard guarantees).
