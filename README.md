# PSITS Acquaintance Party 2026

> A bold, real-time onboarding and event operations platform for the PSITS College of Computer Studies Acquaintance Party.

PSITS Acquaintance Party is a Firebase-powered React application for registering students, managing event attendance, and organizing the CCS community into twelve Filipino mythical-creature groups. It combines a playful retro-inspired interface with an operations-ready control center for authorized officers and administrators.

## What it does

- **Student onboarding** — registration with eight-digit student ID validation, course/year/section details, payment tier, and group assignment.
- **Live attendee directory** — searchable attendee records, payment and group filters, detail views, and empty states backed by Firestore.
- **Group operations** — twelve official creature groups, rosters, member counts, group balancing, and a randomization workflow.
- **Spin the Wheel** — a live group-drawing experience with officer-controlled spin history.
- **Admin control center** — event settings, registration pricing and status, officer management, group configuration, attendance metrics, and revenue auditing.
- **CSV workflows** — download a template, bulk-import formatted attendee data, and export filtered or complete attendee lists.
- **Two visual modes** — the default event theme and a retro mode, both responsive for desktop and mobile screens.

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 6 |
| Icons and motion | Lucide React, Motion |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore with live listeners |
| Admin tooling | Firebase Admin SDK, TypeScript scripts, `tsx` |
| Hosting | Firebase Hosting |

## Application routes

The app uses hash navigation so every major view can be bookmarked directly:

| View | Hash route | Intended audience |
| --- | --- | --- |
| Home | `#/` | Everyone |
| Registration | `#/register` | Students |
| Attendee directory | `#/attendees` | Authenticated users; broader operations access for officers |
| Groups | `#/groups` | Authenticated users |
| Spin the Wheel | `#/spin` | Authenticated users; recording spins requires officer access |
| Officer login | `#/login` | Officers and administrators |
| Admin dashboard | `#/admin` | Officers and administrators |
| Admin groups/settings/officers | `#/admin/groups`, `#/admin/settings`, `#/admin/officers` | Administrators |

## Project structure

```text
src/
├── components/       UI, public views, modals, and admin screens
├── context/          Authentication and theme providers
├── data/             Official mythical-group definitions
├── hooks/            Firestore-backed React hooks
├── services/firebase/ Firestore and Authentication operations
├── utils/             CSV import/export helpers
├── App.tsx            Application shell and route state
└── index.css          Global styling and theme tokens
scripts/              Development-only Admin SDK seed and cleanup commands
firestore.rules       Firestore role-based security rules
firebase.json         Firebase Hosting and Firestore deployment config
```

## Quick start

### 1. Install dependencies

Requires Node.js 20+ and an accessible Firebase project.

```powershell
npm install
Copy-Item .env.example .env
```

### 2. Configure the client

Fill in the `VITE_FIREBASE_*` values in `.env` using the Firebase Web App configuration. These values are used by the browser and are not substitutes for server credentials.

In Firebase Console, enable **Authentication → Sign-in method → Email/Password** and create or connect a **Cloud Firestore** database.

### 3. Start the development server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development data and administration

The Admin SDK scripts load `.env` directly and are intentionally guarded by `NODE_ENV=development` plus an explicit `ALLOW_*` flag. Keep service-account credentials server-side: never prefix them with `VITE_`, commit them, or expose them to the browser.

Set `FIREBASE_SERVICE_ACCOUNT_JSON` to a service-account JSON object, or use Google Application Default Credentials through `GOOGLE_APPLICATION_CREDENTIALS`. The `.env` file is ignored by Git.

### Provision core event data

Creates `settings/event` if it does not exist and ensures the twelve official groups. Existing event settings are preserved.

```powershell
$env:NODE_ENV = 'development'
$env:ALLOW_CORE_SEED = 'true'
npm run seed:core
```

### Add synthetic attendees

Creates development settings, twelve groups, and synthetic attendee records. The count must be between 1 and 10,000.

```powershell
$env:NODE_ENV = 'development'
$env:ALLOW_MOCK_SEED = 'true'
npm run seed:mock -- --count 1000
```

### Provision the development administrator

Creates or updates the fixed development account `admin26@psits.com` and gives its Firestore profile the `admin` role. The password is read from the environment only.

```powershell
$env:NODE_ENV = 'development'
$env:ALLOW_ADMIN_SEED = 'true'
$env:ADMIN_SEED_PASSWORD = 'use-a-local-development-password'
npm run seed:admin
```

### Clear development application data

This removes the `attendees`, `groups`, `spinHistory`, and `users` collections plus `settings/event`. Authentication users are preserved. The command prompts for confirmation unless `--force` is supplied.

```powershell
$env:NODE_ENV = 'development'
$env:ALLOW_DATA_CLEAR = 'true'
npm run clear:data

# Only for intentional, non-interactive development cleanup:
npm run clear:data -- --force
```

## Firebase security model

The rules in [`firestore.rules`](firestore.rules) enforce the access model in the database, not only in the UI:

- Public registration can create only a student profile for the signed-in user.
- Students can access their own profile and registration data according to the rules.
- Officers can manage attendee operations and record wheel spins.
- Administrators can manage officers, event settings, groups, and destructive records.
- Event settings are publicly readable so the landing page can display current event information.
- Official groups are restricted to the fixed twelve-group allowlist.

Deploy rules before opening registration:

```powershell
npx firebase-tools deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

The first administrator must be provisioned through the Firebase Admin SDK or Firebase Console by assigning `role: "admin"` in `users/{uid}`. Public sign-up never grants officer or administrator privileges.

## Deployment

Build the production bundle and preview it locally:

```powershell
npm run build
npm run preview
```

Deploy the compiled `dist` directory to the configured Firebase Hosting target after authenticating with the Firebase CLI:

```powershell
npx firebase-tools login
npx firebase-tools use YOUR_FIREBASE_PROJECT_ID
npx firebase-tools deploy --only hosting:acq-psits
```

The hosting rewrite in [`firebase.json`](firebase.json) sends all routes to `index.html`, which keeps the hash-based navigation and Firebase Hosting refresh behavior safe.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port 3000 |
| `npm run build` | Create the production bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript validation with `tsc --noEmit` |
| `npm run seed:core` | Ensure core event settings and groups in development |
| `npm run seed:mock` | Create synthetic development records |
| `npm run seed:admin` | Create/update the development administrator |
| `npm run clear:data` | Remove guarded development application data |

## Environment reference

Start from [`.env.example`](.env.example). Client configuration uses:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Development-only Admin SDK settings include `NODE_ENV`, `ALLOW_ADMIN_SEED`, `ALLOW_CORE_SEED`, `ALLOW_MOCK_SEED`, `ALLOW_DATA_CLEAR`, `ADMIN_SEED_PASSWORD`, `GOOGLE_CLOUD_PROJECT`, and `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Contributing

1. Create a focused branch for your change.
2. Keep Firebase writes behind the service layer in `src/services/firebase/`.
3. Update Firestore rules whenever a feature changes access behavior.
4. Run `npm run lint` and `npm run build` before opening a pull request.
5. Do not commit `.env`, service-account keys, real attendee data, or production exports.

## License and ownership

This project is maintained for the PSITS College of Computer Studies Acquaintance Party 2026. Add the organization’s preferred license and contribution policy here before public distribution.
