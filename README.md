# My Blog

A personal literary blog built with Next.js. Posts, likes, and comments all live in
Supabase — you write and publish from a private **/admin** dashboard on your own site.
No Markdown files, no git push to publish a post.

## What changed from v1

- **Posts now live in Supabase**, not in `content/posts/*.md`. Write, edit, delete, and
  publish/unpublish from `/admin` — changes appear on the site immediately, no redeploy.
- **New `/admin` dashboard** — password protected, rich text editor (bold/italic/headings/
  quotes/lists/links/images), cover image upload, draft vs. published toggle.
- **Categories**: Poem, Chapter (novel), Essay, Note — each with its own icon, and poems
  get centered/italic typesetting suited to line breaks and stanzas.
- **Pagination**: the homepage shows 10 posts at a time (newest first), so it stays fast
  even with hundreds of posts.

## File structure

```
my-blog/
├── app/
│   ├── layout.tsx                  # Root layout, nav, toaster
│   ├── page.tsx                    # Homepage — paginated post list + category tabs
│   ├── blog/[slug]/page.tsx        # Single post page + OG meta tags
│   ├── admin/                      # Private dashboard (password protected)
│   │   ├── login/page.tsx
│   │   ├── page.tsx                 # List/manage all posts
│   │   ├── new/page.tsx
│   │   └── edit/[id]/page.tsx
│   └── api/
│       ├── likes/[slug]/route.ts
│       ├── comments/[slug]/route.ts
│       └── admin/                   # login, logout, posts CRUD, image upload
├── components/
│   ├── ShareButtons.tsx / LikeButton.tsx / CommentSection.tsx
│   ├── AdminNav.tsx
│   └── PostEditor.tsx               # The rich text editor used by New/Edit
├── lib/
│   ├── posts.ts                     # All Supabase post queries (public + admin)
│   ├── supabase.ts                  # Public client + server-only admin client
│   └── adminAuth.ts                 # Password/session check for /admin
├── middleware.ts                    # Redirects unauthenticated visitors away from /admin
├── content/posts/                   # Old markdown posts — only used once, by the
│   │                                   migration script below. Safe to delete after.
├── scripts/migrate-posts.mjs        # One-time: moves old .md posts into Supabase
├── supabase/schema.sql              # Run this in Supabase SQL editor
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at https://supabase.com (free tier is enough).
   - Go to SQL Editor → paste the contents of `supabase/schema.sql` → Run.
     (This creates the `posts`, `likes`, and `comments` tables, plus a storage bucket
     for images.)
   - Go to Project Settings → API → copy the **Project URL**, the **anon public** key,
     and the **service_role** key (click "Reveal" — treat this one like a password).

3. **Fill in `.env.local`**
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_PASSWORD=choose-something-only-you-know
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **(One-time) Migrate your old Markdown posts into Supabase**, if you have any in
   `content/posts/`:
   ```bash
   node --env-file=.env.local scripts/migrate-posts.mjs
   ```
   After this runs, `content/posts/` is no longer used — you can delete it.

5. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 for the public site, or http://localhost:3000/admin to write.

## Writing a new post

Go to `/admin`, log in with your `ADMIN_PASSWORD`, and click **New post**. Write with
the toolbar (no Markdown syntax needed), pick a category, upload a cover image if you
want one, and hit **Publish**. It appears on the homepage instantly — newest first.

Want to work on something without it going live yet? Uncheck "Published" and hit
**Save draft** — it stays private until you publish it.

**Writing a poem?** Pick the "Poem" category — it renders centered and italicized.
Press **Shift+Enter** (or the line-break button in the toolbar) to break a line within
a stanza without starting a new paragraph.

## Deploying

1. Push this project to a GitHub repo (this is only for *code* changes now — writing
   posts never requires a push or a redeploy).
2. Go to https://vercel.com → New Project → import the repo.
3. Add the same environment variables from `.env.local` in Vercel's project settings —
   including `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD`. Set `NEXT_PUBLIC_SITE_URL`
   to your real domain.
4. Deploy.
5. (Optional) Add your custom domain under Project → Settings → Domains.

## Testing social previews

After deploying, paste your post URL into:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter/X Card Validator: https://cards-dev.twitter.com/validator

WhatsApp uses the same Open Graph tags, so if Facebook's debugger shows a good preview,
WhatsApp will too. (WhatsApp caches previews aggressively — send yourself the link in a
private chat to test, not a chat you've shared the URL in before.)

## Notes on likes, comments, and admin security

- **Likes** are tracked using a random anonymous ID stored in the visitor's browser
  (`localStorage`), so no login is required and the same visitor can't like a post
  twice from the same browser.
- **Comments** are public by default (`approved = true` in the schema). If you want to
  moderate comments before they go live, change the default to `false` in
  `supabase/schema.sql` and review/approve them from the Supabase Table Editor.
- **`/admin` is protected by a single shared password** (`ADMIN_PASSWORD`), suited to a
  one-author blog. It is not a full multi-user login system. Anyone with the password
  can create/edit/delete any post — don't share it, and change it if you ever suspect
  it's leaked (just update the env var and redeploy).
- For production spam protection on comments, consider adding Cloudflare Turnstile
  (free) to the comment form.
