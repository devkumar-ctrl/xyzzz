# Dumka Academy Desk

A working sports-academy desk for **coaches, players, and scouts**. Track attendance, record matches, and decide who is ready for a trial — with a separate Next.js frontend and Express/MongoDB API.

- **Live demo:** _pending deployment_
- **Repository:** `vibe-coding-challenge-2-0-okk`

## Structure

```text
frontend/  Next.js 16 App Router UI (port 3000)
backend/   Express REST API + MongoDB (port 4000)
```

The frontend proxies `/api/*` to the backend through a Next rewrite, so the browser keeps one origin and the backend's httpOnly session cookie works normally. Server components call the API directly with the incoming cookie.

## What it does

| Role | What they can do |
| --- | --- |
| **Coach** | Add players, open sessions, mark attendance, lock sessions, record match scores, view the readiness board, and load sample data. |
| **Player** | See only their own attendance, match history, and trial readiness. |
| **Scout** | See only the players who are ready for a trial. |

Every role is redirected to its own area. A player cannot open coach or scout pages, a scout cannot open coach or player pages, and signed-out visitors are sent to `/login`.

## Readiness rule

- Only **closed sessions** count toward attendance.
- Attendance % = sessions present ÷ closed sessions that include the player.
- **Ready for trial** = at least **75%** attendance **and** at least **2 recorded matches**.

The sample data is designed to show the edge cases:

| Player | Attendance | Matches | Result |
| --- | --- | --- | --- |
| Aarav Kumar | 75% (3/4) | 2 | Ready for trial |
| Bhavna Singh | 50% (2/4) | 2 | Not ready — attendance below 75% |
| Chirag Mahto | 75% (3/4) | 1 | Not ready — needs 2 matches |

## Match sheet rule

Only players marked **present in a session on the same date and sport** appear on the match sheet. The API checks this again on submit and refuses an absent player, even if a crafted request includes them.

## Demo accounts

The coach and scout accounts are created automatically the first time the API health check or login runs.

| Role | Username | Password |
| --- | --- | --- |
| Coach | `coach` | `coach123` |
| Scout | `scout` | `scout123` |
| Player | `aarav.kumar` | `player123` |
| Player | `bhavna.singh` | `player123` |
| Player | `chirag.mahto` | `player123` |

The three player accounts appear after clicking **Load sample academy** on the coach dashboard. Players added by the coach get a generated `firstname.lastname` username and the default password `player123`; the coach sees the credentials after adding them.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, lucide-react
- **Backend:** Express 5, MongoDB official driver, HMAC-SHA256 signed httpOnly session cookies, scrypt password hashing
- **API:** REST/JSON with role-guarded coach, player, and scout routes

## Local setup

```bash
npm install
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local
# edit backend/.env.local with your MongoDB Atlas URI and a random AUTH_SECRET
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). The API runs at [http://localhost:4000](http://localhost:4000).

### Environment variables

`backend/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. |
| `MONGODB_DB` | No | Database name. Defaults to `dumka_academy`. |
| `AUTH_SECRET` | Yes in production | Secret used to sign session cookies. Use a long random value. |
| `PORT` | No | API port. Defaults to `4000`. |

`frontend/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | No | API origin used by the rewrite and server components. Defaults to `http://localhost:4000`. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local`. Only `.env.example` belongs in the repository.

## Scripts

```bash
npm run dev         # API + frontend together
npm run dev:api     # Express API only
npm run dev:web     # Next.js only
npm run typecheck   # backend + frontend
npm run lint        # frontend ESLint
npm run build       # backend + frontend production builds
npm start           # run both production builds
```

## API overview

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/logout` | Public |
| `GET` | `/api/auth/me` | Signed in |
| `GET` | `/api/coach/overview` | Coach |
| `GET` | `/api/coach/academy` | Coach |
| `GET` | `/api/coach/players` | Coach |
| `POST` | `/api/coach/players` | Coach |
| `GET` | `/api/coach/sessions` | Coach |
| `POST` | `/api/coach/sessions` | Coach |
| `GET` | `/api/coach/sessions/:id` | Coach |
| `PUT` | `/api/coach/sessions/:id/attendance` | Coach |
| `GET` | `/api/coach/matches` | Coach |
| `POST` | `/api/coach/matches` | Coach |
| `POST` | `/api/coach/seed-demo` | Coach |
| `GET` | `/api/scout/ready` | Scout |
| `GET` | `/api/player/record` | Player |

## Deployment

Deploy the frontend to Vercel and the backend to a Node host (Render, Railway, Fly.io, or similar).

1. Set `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, and `PORT` on the API host.
2. Set `BACKEND_URL` on the frontend to the public API origin.
3. In MongoDB Atlas, allow the API host to connect. For a challenge demo, `0.0.0.0/0` is the simplest network-access rule; restrict it for real deployments.
4. Deploy and update the **Live demo** link at the top of this README.

## Acceptance checks

- [x] Absent players are excluded from that day's match sheet and refused by the API.
- [x] Readiness percentages are computed from closed sessions; 75% + 2 matches is marked ready.
- [x] Scout sees only ready players; a player sees only their own record.
- [x] Data persists across reloads and logins.
- [x] Each role is blocked from the other roles' pages.
- [x] Empty states, form validation, and a one-click sample-data path are included.

## Notes

- The sample-data button only loads into an empty academy, so it cannot duplicate players.
- Change the demo passwords and `AUTH_SECRET` before using real academy data.
- Session cookies are httpOnly, SameSite=Lax, signed with HMAC-SHA256, and expire after 7 days.
