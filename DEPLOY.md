# Going live: Supabase + Vercel + Cloudflare + domain

The pieces:

- **Supabase**: the Postgres database (users, logins, forms, photos, files).
- **Vercel**: runs the Next.js app, in the Mumbai region (`vercel.json`).
- **Cloudflare**: DNS for your domain, plus optional firewall and DDoS protection in front of Vercel.
- **Domain**: bought once, pointed at Vercel through Cloudflare.

Do the steps in this order.

---

## 1. Supabase (database)

1. Go to https://supabase.com and create a **New project**.
   - **Region:** `South Asia (Mumbai)`. It must match Vercel's `bom1`, or every page pays a cross-continent round trip.
   - **Database password:** use letters and numbers only (no `@ : / ? # %`), so it can be pasted into a URL as-is. Save it in a password manager.
   - **Plan:** Free works for testing. Free projects **pause after 7 days without activity** and have no automatic backups. For the real launch, use **Pro** (daily backups, no pausing).
2. When the project is ready, click **Connect** (top bar), then **ORMs**, then **Prisma**. Copy the two lines it shows into `.env`:
   - `DATABASE_URL`: port **6543**, ends with `?pgbouncer=true`. Add `&connection_limit=1` at the end.
   - `DIRECT_URL`: port **5432**.
3. Create the tables, then the admin account:
   ```bash
   npm run db:migrate
   npm run admin:password
   ```
   `db:migrate` also turns on Row Level Security on every table, so Supabase's public REST API can't read your data even with the anon key. The app connects as the database owner and isn't affected.
4. Check it: `npm run dev`, open http://localhost:3000/admin/login, and sign in.

> Supabase's **Auth** and **Storage** products are not used. Login, sessions, and files are handled by this app and stored in Postgres. You don't need the Supabase anon key or service-role key anywhere.

---

## 2. Vercel (hosting)

1. Push the code to GitHub (`advay77/MRIGA-WEBSITE`).
2. https://vercel.com, then **Add New → Project**, then import the repo. Framework: **Next.js** (auto-detected). Leave the build command alone; `vercel.json` already runs `prisma migrate deploy && next build`.
3. **Settings → Environment Variables** (scope: Production). Add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Supabase transaction pooler URL (6543, `pgbouncer=true&connection_limit=1`) |
   | `DIRECT_URL` | Supabase session pooler URL (5432) |
   | `AUTH_SECRET` | A **new** random value. Run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
   | `ADMIN_EMAIL` | Real admin email |
   | `ADMIN_PASSWORD` | Strong password, 12+ characters (only used if the admin doesn't exist yet) |
   | `SITE_URL` | `https://yourdomain.in` (after step 3; use the `*.vercel.app` URL until then) |
   | `TRUST_CLOUDFLARE` | `1` only if you turn on the orange-cloud proxy in step 4 |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile keys, see step 5 |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional, see step 6 |

4. **Deploy.** Open the `*.vercel.app` URL and check `/` and `/admin/login`.

---

## 3. Domain

**Easiest:** buy the domain on **Cloudflare Registrar** (Cloudflare dashboard → Domain Registration → Register Domains). Cloudflare sells at cost and DNS is set up automatically.

**If the extension you want isn't on Cloudflare** (for example `.in` or `.co.in`), buy it at any registrar (Namecheap, GoDaddy, Hostinger, BigRock). Then:

1. In Cloudflare, **Add a domain**, enter it, pick the **Free** plan.
2. Cloudflare shows two nameservers (`xxx.ns.cloudflare.com`). At the registrar, replace the existing nameservers with these two.
3. Wait until Cloudflare says the domain is **Active** (minutes to a few hours).

---

## 4. Connect the domain: Vercel ↔ Cloudflare

1. Vercel → Project → **Settings → Domains**. Add `yourdomain.in` and `www.yourdomain.in`, and choose to redirect one to the other (`www` → apex is common).
2. Vercel shows the DNS records it wants, usually an **A** record for the apex and a **CNAME** for `www`. Use the exact values Vercel shows.
3. Cloudflare → your domain → **DNS → Records**. Add those records. Set **Proxy status: DNS only (grey cloud)** to start.
4. Wait for Vercel to show **Valid Configuration** and issue the SSL certificate.
5. Update `SITE_URL` in Vercel to `https://yourdomain.in` and redeploy.

### Optional: Cloudflare proxy (orange cloud)

This adds Cloudflare's firewall, bot protection, and DDoS shield. Turn it on only after step 4 works:

1. Cloudflare → **SSL/TLS → Overview**: set to **Full (strict)**. Never use *Flexible*; it causes redirect loops with Vercel.
2. DNS: switch the Vercel records to **Proxied (orange cloud)**.
3. Vercel: set `TRUST_CLOUDFLARE=1` and redeploy. Without it, every visitor looks like a Cloudflare server to the app, so rate limits and the login log would use Cloudflare's IPs instead of the visitor's. The app only trusts Cloudflare's visitor-IP header on requests that actually come from Cloudflare's IP ranges, so it can't be faked by calling the `*.vercel.app` URL directly.
4. Recommended Cloudflare settings:
   - **SSL/TLS → Edge Certificates:** Always Use HTTPS on, Minimum TLS 1.2.
   - **Security → Bots:** Bot Fight Mode on.
   - **Security → WAF → Rate limiting rules:** one rule for URI path `/admin/login` (for example 20 requests per minute per IP, then block). The app has its own limits too; this stops floods before they reach Vercel.
   - **Caching:** leave defaults. Don't add "Cache Everything" rules; the admin pages must never be cached.

---

## 5. Cloudflare Turnstile (bot check on logins and forms)

Turnstile is Cloudflare's replacement for CAPTCHA. Most visitors never see it; bots get stopped before they can guess passwords or flood you with fake leads. It protects customer, retailer and admin login and signup, the test-ride form and the dealer form.

1. Cloudflare dashboard → **Turnstile** (left menu) → **Add widget**.
2. **Widget name:** `MRIGA website`. **Hostnames:** `yourdomain.in` (add `www.yourdomain.in` too, and `localhost` if you want to test real keys locally).
3. **Widget mode:** **Managed**. Leave pre-clearance off. Click **Create**.
4. Copy the **Site Key** into `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret Key** into `TURNSTILE_SECRET_KEY` in Vercel (Production).
5. **Redeploy.** The site key is built into the page, so it only takes effect after a new build.

For localhost, `.env` uses Cloudflare's public test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`), which always pass. Never use them in production. To switch the check off entirely, leave both variables empty.

## 6. Google sign-in (optional)

1. https://console.cloud.google.com/apis/credentials, then **Create credentials → OAuth client ID → Web application**.
2. **Authorized redirect URIs:**
   - `https://yourdomain.in/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for local testing)
3. Copy the client ID and secret into Vercel env (and `.env` locally). The Google button appears once both are set.
4. OAuth consent screen: publish the app (move it out of "Testing"), or only test users can sign in.

---

## 7. After launch

- **WhatsApp number:** Admin → Website text → Showroom → WhatsApp number (country code + digits, e.g. `917303042004`). It drives the floating button, the button after login, and the buttons after a test ride or dealer enquiry.

- **Admin password change:** set `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`, point `DATABASE_URL`/`DIRECT_URL` at production, then run `npm run admin:password`. This also signs that admin out everywhere.
- **Schema changes:** edit `prisma/schema.prisma`, then run `npm run db:new-migration` against a dev database and commit the new folder in `prisma/migrations`. Vercel applies it on the next deploy.
- **Backups:** Supabase Pro takes daily backups. On Free, export regularly (Supabase → Database → Backups, or `pg_dump`).
