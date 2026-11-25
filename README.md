# Rusetat Itinerary Builder

## Local development

1. Install dependencies with `npm install`.
2. Add the Neon connection string to `.env.local` as `DATABASE_URL=...`.
3. Configure `AUTH_SECRET` with a random value of at least 32 characters and set a separate random `INITIAL_SETUP_KEY`. Keep both secret and use the same values across all app instances.
4. Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_EMAIL` for proposal delivery, account recovery, and public destination inquiries. Set `NEXT_PUBLIC_SITE_URL` to the canonical public URL in production so emailed links use the correct host.
5. Run `npm run db:check` to verify the database connection.
6. Start the app with `npm run dev`.

On the first run, open `/setup`, enter the `INITIAL_SETUP_KEY`, and create the initial administrator account.
The one-time setup is enforced by a database unique index, so only one initial
administrator can be created. Sign in at `/signin`. Administrators can create
consultant accounts under **Team access**; there is no public registration.

Staff sessions use an eight-hour, signed, HTTP-only, same-site cookie. Passwords
are stored as bcrypt hashes. Sign-in attempts are locked for 15 minutes after
five unsuccessful attempts. Deactivating a staff account immediately blocks
its API access.

Client proposal links remain public by design so clients can review and approve
them without a staff account. Keep proposal links private and share them only
with their intended recipients.

The app creates its PostgreSQL tables on the first API request. It imports the
existing ignored `data/store.json` once when present, or seeds the example
destinations on a new database. The database connection string must remain in
environment configuration and must not be committed.

The public destination catalog is available at `/destinations`. Staff can manage
proposals, send them to clients, and update account details from the workspace.
Password reset links expire after 30 minutes and can be requested once per minute
per account.

## Standalone Express API

This repository also contains a separate Express + TypeScript + MongoDB API in
`src/`. It runs independently of the Next.js application and uses its own
MongoDB database; it does not replace the existing Neon-backed app.

1. Copy `.env.example` to `.env` and configure `MONGODB_URI`, a random
   `JWT_SECRET` of at least 32 bytes, `PORT`, and the frontend origins in
   `ALLOWED_ORIGINS` (comma-separated).
2. Run `npm run api:dev` to start the API on the configured port (default 4000).
3. Run `npm run api:build` to type-check and compile it to `dist/`, then
   `npm run api:start` to run the compiled API.

The API exposes `/api/auth/register`, `/api/auth/login`, and authenticated
`/api/itineraries` CRUD and PDF export endpoints. Public registration always
creates an `agent`; do not accept a role from the request. To provision an
administrator, use a separately controlled database administration process.
The built-in rate limiter uses in-memory storage, so configure a shared store
and your hosting provider's trusted-proxy settings before using multiple API
instances.
