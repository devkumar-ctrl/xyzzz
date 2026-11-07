# Dumka Academy Desk

A working sports-academy desk for **coaches, players, and scouts**. Track attendance, record matches, and decide who is ready for a trial.

- **Live demo:** _pending deployment_
- **Repository:** `vibe-coding-challenge-2-0-okk`

## What it does

| Role | What they can do |
| --- | --- |
| **Coach** | Add players, open sessions, mark attendance, lock sessions, record match scores, view the readiness board, and load sample data. |
| **Player** | See only their own attendance, match history, and trial readiness. |
| **Scout** | See only the players who are ready for a trial. |

Every role is redirected to its own area.

## Readiness rule

- Only **closed sessions** count toward attendance.
- Attendance % = sessions present ÷ closed sessions that include the player.
- **Ready for trial** = at least **75%** attendance **and** at least **2 recorded matches**.

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Coach | `coach` | `coach123` |
| Scout | `scout` | `scout123` |
| Player | `aarav.kumar` | `player123` |
| Player | `bhavna.singh` | `player123` |
| Player | `chirag.mahto` | `player123` |

Player accounts appear after clicking **Load sample academy** on the coach dashboard. Players added by the coach get a generated `firstname.lastname` username and the default password `player123`.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, lucide-react
- **Database:** MongoDB (official driver)
- **Auth:** HMAC-SHA256 signed httpOnly session cookies, scrypt password hashing

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with your MongoDB Atlas URI and a random AUTH_SECRET
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. |
| `MONGODB_DB` | No | Database name. Defaults to `dumka_academy`. |
| `AUTH_SECRET` | Yes in production | Secret used to sign session cookies. Use a long random value. |
| `PORT` | No | Not used (Next.js handles port). |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local`. Only `.env.example` belongs in the repository.

## Scripts

```bash
npm run dev         # Next.js dev server
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run build       # production build
npm start           # run production build
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo in Vercel (framework auto-detected as Next.js).
3. Set environment variables in Vercel dashboard: `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`.
4. In MongoDB Atlas, allow the API host to connect (for a demo, `0.0.0.0/0`).
5. Deploy.

## Notes

- The sample-data button only loads into an empty academy, so it cannot duplicate players.
- Change the demo passwords and `AUTH_SECRET` before using real academy data.
- Session cookies are httpOnly, SameSite=Lax, signed with HMAC-SHA256, and expire after 7 days.
