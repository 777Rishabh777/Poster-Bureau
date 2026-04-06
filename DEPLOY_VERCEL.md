# Deploy The Poster Bureau on Vercel

This project is now configured to run as one Vercel app:

- Frontend pages from `client/`
- API routes from `server-node/` exposed under `/api/*`

Important: Upload only one repository containing both folders. Do not split frontend/backend into separate repos for this setup.

## 1) Create MongoDB Atlas Database

1. Create a free Atlas cluster (M0 is fine to start).
2. Create a DB user with username/password.
3. In Network Access, allow your Vercel app by IP (quick start: `0.0.0.0/0`, then tighten later).
4. Copy your connection string and replace placeholders:

```text
mongodb+srv://<username>:<password>@<cluster-url>/PosterBureau?retryWrites=true&w=majority
```

Use `PosterBureau` as database name to match your app defaults.

## 2) Push Code to GitHub (Frontend + Backend Together)

From project root:

```bash
git init
git add .
git commit -m "Prepare fullstack app for Vercel"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If your repo already exists locally, just run:

```bash
git add .
git commit -m "Update deployment config"
git push
```

Notes:

- `.gitignore` excludes `.env` so secrets are not uploaded.
- Use `.env.example` as a template for required environment variables.

## 3) Import to Vercel

1. Go to Vercel dashboard -> Add New Project.
2. Import this repo.
3. Leave Root Directory as repo root (the folder that contains `client/`, `server-node/`, and `vercel.json`).
4. Framework Preset: Other.
5. Build settings can stay default (Vercel reads `vercel.json`).

## 4) Add Environment Variables in Vercel

Project Settings -> Environment Variables:

- `MONGO_URI` = your Atlas connection string
- `JWT_SECRET` = long random secret (32+ chars)
- `ADMIN_EMAIL` = admin login email
- `ADMIN_PASSWORD` = strong admin password

Optional:

- `ADMIN_USER` (legacy alias for admin email)
- `AI_SERVICE_URL` if you later proxy to a separate AI service

Important: This app now requires `MONGO_URI` in Vercel runtime. Without it, API init is blocked to avoid non-persistent file writes in serverless.

## 5) Deploy

Click Deploy.

After deploy, test:

- `/api/health` should return JSON with `ok: true` and `mode: "mongo"`
- `/` should load storefront
- `/admin` should load admin login

## 6) Post-Deploy Checks

1. Log in to admin with `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
2. Create/update a product and verify it persists after refresh.
3. Place a test order and verify it appears in MongoDB Atlas collections.

## Notes About AI Service

The Python AI helper in `server-python/` is separate from this Node API.

- Local dev: admin uses `http://localhost:8000` for AI helper.
- Production: admin uses the same origin by default. If AI endpoints are not deployed there, AI status shows Offline and core store functions still work.
