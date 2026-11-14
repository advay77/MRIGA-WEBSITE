# MRIGA

Haute electric mobility site. Heritage theme, collection, origins, lounge login, and dealer applications.

## Run locally

```bash
npm install
npx prisma db push
npm run dev
```

Copy `.env.example` to `.env` first. `ADMIN_EMAIL` and `ADMIN_PASSWORD` create the desk account the first time `/login` is opened. Test rides and dealer applications are stored in the database and listed at `/admin`.

## Production database

Use [Neon Postgres](https://neon.tech). Put the connection string in `DATABASE_URL`, set `provider = "postgresql"` in `prisma/schema.prisma`, then run `npx prisma db push`. SQLite is only for local development. It does not persist on Vercel.

Passkeys are hashed with scrypt. Sessions are httpOnly cookies. SMS OTP and Google sign-in stay visible and stay off until a real provider is connected.
