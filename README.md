# MRIGA

Electric scooter site: home, collection, model pages, customer and retailer login, dealer applications, and an admin desk at `/admin`.

## Run locally

The database is Supabase Postgres. Create a project first (see [DEPLOY.md](DEPLOY.md) step 1), then:

```bash
npm install
cp .env.example .env      # paste the Supabase URLs and fill the rest
npm run db:migrate
npm run dev
```

Open http://localhost:3000. The admin desk is at `/admin/login`.

## Admin account

`ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters, a letter and a number) create the admin the first time `/admin/login` loads. Changing the env value later does **not** change the password. To set or reset it, and sign that admin out everywhere:

```bash
npm run admin:password
```

## Going to production

Step by step in [DEPLOY.md](DEPLOY.md): Supabase, Vercel, domain, Cloudflare, Google sign-in.

## How it holds up under load

- Public pages are static and served from the CDN. They revalidate every 5 minutes, and immediately when an admin saves website text.
- `/media/*` photos are cached at the CDN for a minute (ETag + stale-while-revalidate), so the database sees about one read per photo per minute.
- Sign-in is rate-limited per IP and per account (admin: 5 tries per hour per account). Sessions are random 256-bit tokens, stored only as HMAC hashes, in httpOnly `__Host-` cookies. Passwords use scrypt.
- Rate-limit rows, expired sessions, and page views older than 180 days are cleaned up automatically.
- Admin lists are paginated (50 per page) and searchable.
- Every sign-in, sign-up, and failed attempt (customer, retailer, admin) is kept for a year in **Login history** in the admin desk, with IP and device.
- Uploads are capped at 4MB per request (Vercel limit) and stored in Postgres.
