# LALA Quiz Pro

Premium exam-prep quiz platform (React + Node/Express + MongoDB), built for
Ethiopian Natural Science / Social Science students.

This is the **complete, wired-together** version of the project — every
screen (Login/Register, Dashboard, Quiz, Results) talks to a real backend
API backed by MongoDB. Nothing here uses mock/hard-coded data.

## What was fixed/completed from the original pieces

- Backend: `server.ts`, all routes, `QuizController` (grading, dashboard,
  results) were missing — added.
- `subject_controller_backend.txt` had a broken relative import — fixed.
- `QuizEngine.tsx` called a `setIndex` function that didn't exist — fixed
  to `setCurrentIndex`, and wired to submit real answers to the backend.
- `LoginPage.tsx` only did `console.log` — wired to real
  register/login API calls with JWT storage.
- `globals.css` was a JS template string, not a real CSS file — rebuilt as
  proper Tailwind CSS with a matching `tailwind.config.js`.
- `Dashboard.tsx` / `Results.tsx` used static mock data — rewired to fetch
  from the backend.
- No `App.tsx`/router existed to connect the screens — added, with a
  `ProtectedRoute` guard.
- Single-admin creation script added (`npm run seed:admin`), matching the
  "one admin, promoted via ADMIN_EMAIL" pattern.

## Project structure

```
lala-quiz-pro/
├── server/     # Express + MongoDB API
└── client/     # React + Vite + Tailwind PWA
```

## 1. Local setup

### Backend
```bash
cd server
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed:admin   # creates your one admin account
npm run dev          # starts on http://localhost:5000
```

### Frontend
```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev             # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a student account, and you should
be able to log in, see the dashboard, and take a quiz — once at least one
`Subject` document with questions exists in MongoDB (create one via the
admin-only `POST /api/subjects` endpoint using the admin account).

## 2. Getting a real, live link (deployment)

You'll need three free accounts. None of these can be created for you —
each requires your own email/login.

### Step A — Database: MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free
   (M0) cluster.
2. Create a database user (username + password).
3. Under Network Access, allow access from anywhere (`0.0.0.0/0`) for
   simplicity, or add your deployment host's IP later.
4. Copy the connection string — this is your `MONGODB_URI`.

### Step B — Backend: Render
1. Push this project to a GitHub repository.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Root directory: `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables: `MONGODB_URI`, `JWT_SECRET` (any long random
   string), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
7. Deploy. Once live, note the URL, e.g. `https://lala-quiz-api.onrender.com`.
8. Run the admin seed once, either locally pointed at the Atlas URI, or
   via Render's Shell tab: `npm run seed:admin`.

### Step C — Frontend: Vercel
1. Go to https://vercel.com → Add New → Project → import the same repo.
2. Root directory: `client`
3. Framework preset: Vite.
4. Add environment variable: `VITE_API_URL` = `https://lala-quiz-api.onrender.com/api`
   (your Render URL from Step B, with `/api` appended).
5. Deploy. Vercel gives you your live link, e.g.
   `https://lala-quiz-pro.vercel.app`.

### Step D — Connect the two
- In `server`, make sure CORS allows your Vercel domain (currently `cors()`
  allows all origins, which works but can be tightened later to just your
  Vercel URL).
- Update `client/vite.config.ts`'s `urlPattern` regex to your real Render
  domain so PWA offline caching works correctly.

Once all three steps are done, your Vercel URL is your real, working,
shareable link.

## Notes

- Correctness of quiz answers is graded **server-side only** — the client
  never receives which option is correct until after submission, so
  answers can't be inspected via dev tools.
- Only one admin account can exist at a time; running `seed:admin` again
  demotes any previous admin and promotes/creates the one in `.env`.
